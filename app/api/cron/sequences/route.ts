/**
 * GET /api/cron/sequences
 *
 * HLAVNÍ MOZEK ORCHESTRÁTORU
 *
 * Cron endpoint, který každých 15 minut:
 * 1. Najde všechny aktivní enrollmenty, kde next_execution_at <= now()
 * 2. Pro každý enrollment:
 *    a) Zkontroluje STOP podmínky (deal vytvořen, unsubscribed, refused, not_interested)
 *    b) Provede aktuální krok (email, callcentrum, wait_for_event, ai_decide)
 *    c) Posune na další krok nebo dokončí sekvenci
 * 3. Zaloguje co se stalo do sequence_execution_log
 *
 * Auth: Bearer CRON_SECRET (stejný jako stávající workflow cron)
 * Limit: Max 50 enrollmentů per run (ochrana proti timeout)
 *
 * Volání: GET /api/cron/sequences
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/brevo'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'
import { personalizeEmail, decideNextAction } from '@/lib/ai/gemini'
import { recomputeScoreForProspect } from '@/lib/scoring/lead-score'
import type { TemplateName, TemplateVariables } from '@/lib/email/templates'
import type { SequenceStep } from '@/lib/supabase/sequence-types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_ENROLLMENTS_PER_RUN = 50

export async function GET(request: NextRequest) {
  // ─── Auth ──────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  let processed = 0
  let stepsExecuted = 0
  let stopped = 0
  let errors = 0

  try {
    // ─── Najdi enrollmenty k provedení ───────────
    const { data: enrollments } = await supabase
      .from('prospect_sequence_enrollments')
      .select(`
        id, prospect_id, sequence_id, current_step_order, status,
        enrolled_at
      `)
      .eq('status', 'active')
      .lte('next_execution_at', now)
      .order('next_execution_at', { ascending: true })
      .limit(MAX_ENROLLMENTS_PER_RUN)

    if (!enrollments?.length) {
      return NextResponse.json({
        status: 'ok',
        message: 'Žádné enrollmenty k zpracování',
        processed: 0,
        timestamp: now,
      })
    }

    // ─── Zpracuj každý enrollment ────────────────
    for (const enrollment of enrollments) {
      try {
        processed++

        // Načti prospect
        const { data: prospect } = await supabase
          .from('prospects')
          .select('id, company_name, status, segment_id, callcenter_status, city, region')
          .eq('id', enrollment.prospect_id)
          .single()

        if (!prospect) {
          await stopEnrollment(supabase, enrollment.id, 'Prospect nenalezen')
          stopped++
          continue
        }

        // ─── STOP podmínky ────────────────────────
        // 1. Prospect má deal?
        const { count: dealCount } = await supabase
          .from('deals')
          .select('id', { count: 'exact', head: true })
          .eq('prospect_id', prospect.id)

        if (dealCount && dealCount > 0) {
          await completeEnrollment(supabase, enrollment.id, 'Deal vytvořen — sekvence splnila účel')
          stopped++
          continue
        }

        // 2. Prospect status = refused?
        if (prospect.status === 'refused') {
          await stopEnrollment(supabase, enrollment.id, 'Prospect odmítl')
          stopped++
          continue
        }

        // 3. Unsubscribed?
        const { count: unsubCount } = await supabase
          .from('email_events')
          .select('id', { count: 'exact', head: true })
          .eq('prospect_id', prospect.id)
          .eq('event_type', 'unsubscribed')

        if (unsubCount && unsubCount > 0) {
          await stopEnrollment(supabase, enrollment.id, 'Prospect se odhlásil z emailů')
          stopped++
          continue
        }

        // 4. Callcentrum: not_interested?
        const { data: lastCall } = await supabase
          .from('callcenter_call_results')
          .select('result_type')
          .eq('prospect_id', prospect.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (lastCall?.result_type === 'not_interested') {
          await stopEnrollment(supabase, enrollment.id, 'Callcentrum: nezájem')
          stopped++
          continue
        }

        // ─── Načti aktuální krok ──────────────────
        const { data: step } = await supabase
          .from('sequence_steps')
          .select('*')
          .eq('sequence_id', enrollment.sequence_id)
          .eq('step_order', enrollment.current_step_order)
          .single()

        if (!step) {
          // Žádný další krok → sekvence dokončena
          await completeEnrollment(supabase, enrollment.id, 'Všechny kroky dokončeny')
          stopped++
          continue
        }

        // ─── Proveď krok ─────────────────────────
        const result = await executeStep(supabase, enrollment, step, prospect)
        stepsExecuted++

        // Loguj výsledek
        await supabase.from('sequence_execution_log').insert({
          enrollment_id: enrollment.id,
          step_order: step.step_order,
          action_type: step.action_type,
          result: result.success ? 'success' : 'error',
          details: result.details,
          brevo_message_id: result.messageId || null,
        })

        // ─── Posuň na další krok ─────────────────
        const { data: nextStep } = await supabase
          .from('sequence_steps')
          .select('step_order, delay_hours')
          .eq('sequence_id', enrollment.sequence_id)
          .eq('step_order', enrollment.current_step_order + 1)
          .single()

        if (nextStep) {
          const nextExecution = new Date(
            Date.now() + (nextStep.delay_hours || 72) * 60 * 60 * 1000
          ).toISOString()

          await supabase
            .from('prospect_sequence_enrollments')
            .update({
              current_step_order: nextStep.step_order,
              next_execution_at: nextExecution,
              last_step_executed_at: now,
              updated_at: now,
            })
            .eq('id', enrollment.id)
        } else {
          await completeEnrollment(supabase, enrollment.id, 'Všechny kroky dokončeny')
        }

        // Přepočítej lead score
        await recomputeScoreForProspect(supabase, prospect.id)

      } catch (err) {
        errors++
        console.error(`Sequence error for enrollment ${enrollment.id}:`, err)

        // Označ enrollment jako error
        await supabase
          .from('prospect_sequence_enrollments')
          .update({
            status: 'error',
            stop_reason: err instanceof Error ? err.message : 'Neznámá chyba',
            updated_at: now,
          })
          .eq('id', enrollment.id)
      }
    }

    return NextResponse.json({
      status: 'ok',
      processed,
      steps_executed: stepsExecuted,
      stopped,
      errors,
      timestamp: now,
    })
  } catch (error) {
    console.error('Sequence cron fatal error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ─── Step Execution ──────────────────────────────

interface StepResult {
  success: boolean
  details: Record<string, unknown>
  messageId?: string
}

async function executeStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string; sequence_id: string; current_step_order: number; enrolled_at: string },
  step: SequenceStep,
  prospect: { id: string; company_name: string; status: string; segment_id: string | null; city: string | null }
): Promise<StepResult> {
  switch (step.action_type) {
    case 'email':
      return executeEmailStep(supabase, enrollment, step, prospect)
    case 'callcenter':
      return executeCallcenterStep(supabase, prospect)
    case 'wait_for_event':
      return executeWaitStep(supabase, enrollment, step)
    case 'ai_decide':
      return executeAiStep(supabase, enrollment, step, prospect)
    default:
      return { success: false, details: { error: `Neznámý typ kroku: ${step.action_type}` } }
  }
}

async function executeEmailStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string },
  step: SequenceStep,
  prospect: { id: string; company_name: string; segment_id: string | null; city: string | null }
): Promise<StepResult> {
  const templateName = step.email_template_name as TemplateName
  if (!templateName || !EMAIL_TEMPLATES[templateName]) {
    return { success: false, details: { error: `Šablona ${templateName} neexistuje` } }
  }

  // Najdi kontakt s emailem
  const { data: contacts } = await supabase
    .from('prospect_contacts')
    .select('first_name, last_name, email, position, is_decision_maker')
    .eq('prospect_id', prospect.id)
    .not('email', 'is', null)
    .order('is_decision_maker', { ascending: false })
    .limit(1)

  const contact = contacts?.[0]
  if (!contact?.email) {
    return { success: false, details: { error: 'Prospect nemá kontakt s emailem' } }
  }

  // Připrav proměnné šablony
  const variables: TemplateVariables = {
    salutation: 'Dobrý den',
    contact_name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || undefined,
    company_name: prospect.company_name,
    city: prospect.city || undefined,
  }

  // Získej segment info pro personalizaci
  let segmentName = ''
  let segmentPainPoint: string | null = null
  if (prospect.segment_id) {
    const { data: segment } = await supabase
      .from('company_segments')
      .select('name, target_pain_point')
      .eq('id', prospect.segment_id)
      .single()
    segmentName = segment?.name || ''
    segmentPainPoint = segment?.target_pain_point || null
  }

  // Generuj email (s AI personalizací pokud zapnutá)
  let emailResult
  if (step.use_ai_personalization) {
    emailResult = await personalizeEmail(templateName, variables, {
      companyName: prospect.company_name,
      segmentName,
      segmentPainPoint,
      decisionMakerRole: contact.position,
      city: prospect.city,
      contactName: variables.contact_name || null,
    })
  } else {
    emailResult = EMAIL_TEMPLATES[templateName].build(variables)
  }

  // Pošli email přes Brevo
  const contactName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
  const brevoResult = await sendEmail({
    to: [{ email: contact.email, name: contactName }],
    subject: step.email_subject_override || emailResult.subject,
    htmlContent: emailResult.html,
    tags: ['sequence', templateName, enrollment.id],
  })

  // Zaloguj do email_send_log (pro webhook propojení)
  await supabase.from('email_send_log').insert({
    recipient_email: contact.email,
    recipient_name: contactName,
    template_name: templateName,
    prospect_id: prospect.id,
    message_id: brevoResult.messageId,
  })

  // Vytvoř aktivitu
  await supabase.from('activities').insert({
    entity_type: 'prospect',
    entity_id: prospect.id,
    type: 'email',
    subject: `Sekvence: ${emailResult.subject}`,
    body: `Email odeslán na ${contact.email} (šablona: ${templateName})`,
  })

  return {
    success: true,
    messageId: brevoResult.messageId,
    details: {
      template: templateName,
      recipient: contact.email,
      ai_personalized: step.use_ai_personalization,
    },
  }
}

async function executeCallcenterStep(
  supabase: ReturnType<typeof createAdminClient>,
  prospect: { id: string; company_name: string }
): Promise<StepResult> {
  // Zařaď prospekta do callcentrum fronty
  await supabase
    .from('prospects')
    .update({
      callcenter_status: 'queued',
      callcenter_assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospect.id)

  // Vytvoř aktivitu
  await supabase.from('activities').insert({
    entity_type: 'prospect',
    entity_id: prospect.id,
    type: 'task',
    subject: 'Callcentrum: zavolat prospectu',
    body: `Automaticky zařazeno do callcentrum fronty po email sekvenci.`,
  })

  return {
    success: true,
    details: { action: 'queued_for_callcenter', company: prospect.company_name },
  }
}

async function executeWaitStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string },
  step: SequenceStep
): Promise<StepResult> {
  // Zkontroluj jestli čekaný event už přišel
  if (step.wait_event_type) {
    const eventTypeMap: Record<string, string[]> = {
      open: ['opened'],
      click: ['clicked'],
      call_result: [], // kontroluje se jinak
    }

    const eventTypes = eventTypeMap[step.wait_event_type] || []

    if (eventTypes.length > 0) {
      const { count } = await supabase
        .from('email_events')
        .select('id', { count: 'exact', head: true })
        .eq('prospect_id', enrollment.prospect_id)
        .in('event_type', eventTypes)

      if (count && count > 0) {
        return {
          success: true,
          details: { event_received: step.wait_event_type, action: 'advancing' },
        }
      }
    }

    // Zkontroluj timeout
    // (timeout se počítá od last_step_executed_at, ale tady to řeší cron timing)
    // Pokud jsme tady, timeout vypršel → pokračuj dál
  }

  return {
    success: true,
    details: { action: 'timeout_reached', wait_event: step.wait_event_type },
  }
}

async function executeAiStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string; sequence_id: string; current_step_order: number; enrolled_at: string },
  step: SequenceStep,
  prospect: { id: string; company_name: string; segment_id: string | null }
): Promise<StepResult> {
  // Získej segment
  let segmentName = 'neznámý'
  if (prospect.segment_id) {
    const { data: segment } = await supabase
      .from('company_segments')
      .select('name')
      .eq('id', prospect.segment_id)
      .single()
    segmentName = segment?.name || 'neznámý'
  }

  // Spočítej statistiky
  const { count: emailsSent } = await supabase
    .from('email_send_log')
    .select('id', { count: 'exact', head: true })
    .eq('prospect_id', prospect.id)

  const { count: emailsOpened } = await supabase
    .from('email_events')
    .select('id', { count: 'exact', head: true })
    .eq('prospect_id', prospect.id)
    .eq('event_type', 'opened')

  const { count: emailsClicked } = await supabase
    .from('email_events')
    .select('id', { count: 'exact', head: true })
    .eq('prospect_id', prospect.id)
    .eq('event_type', 'clicked')

  const { data: callResults } = await supabase
    .from('callcenter_call_results')
    .select('result_type')
    .eq('prospect_id', prospect.id)

  const { count: totalSteps } = await supabase
    .from('sequence_steps')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', enrollment.sequence_id)

  const daysSinceEnroll = Math.floor(
    (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Zavolej Gemini
  const decision = await decideNextAction({
    companyName: prospect.company_name,
    segmentName,
    emailsSent: emailsSent || 0,
    emailsOpened: emailsOpened || 0,
    emailsClicked: emailsClicked || 0,
    callResults: callResults?.map(r => r.result_type) || [],
    daysSinceFirstContact: daysSinceEnroll,
    currentStep: enrollment.current_step_order,
    totalSteps: totalSteps || 0,
  })

  // Proveď AI rozhodnutí
  switch (decision.action) {
    case 'queue_callcenter':
      await executeCallcenterStep(supabase, prospect)
      break
    case 'stop_sequence':
      await stopEnrollment(supabase, enrollment.id, `AI: ${decision.reasoning}`)
      break
    case 'wait':
      // Nastav next_execution_at na wait_days
      if (decision.wait_days) {
        await supabase
          .from('prospect_sequence_enrollments')
          .update({
            next_execution_at: new Date(Date.now() + decision.wait_days * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollment.id)
      }
      break
    // send_email a skip_step → pokračují na další krok normálně
  }

  return {
    success: true,
    details: {
      ai_action: decision.action,
      ai_reasoning: decision.reasoning,
      ai_template: decision.template_name,
    },
  }
}

// ─── Helpers ─────────────────────────────────────

async function stopEnrollment(
  supabase: ReturnType<typeof createAdminClient>,
  enrollmentId: string,
  reason: string
) {
  await supabase
    .from('prospect_sequence_enrollments')
    .update({
      status: 'stopped',
      stop_reason: reason,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
}

async function completeEnrollment(
  supabase: ReturnType<typeof createAdminClient>,
  enrollmentId: string,
  reason: string
) {
  await supabase
    .from('prospect_sequence_enrollments')
    .update({
      status: 'completed',
      stop_reason: reason,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
}
