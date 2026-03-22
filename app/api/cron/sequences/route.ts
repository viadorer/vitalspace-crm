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
        id, prospect_id, client_id, entity_type, sequence_id, current_step_order, status,
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

        const isClient = enrollment.entity_type === 'client'
        const entityId = isClient ? enrollment.client_id : enrollment.prospect_id

        // Načti entitu (prospect nebo klient)
        let entity: { id: string; company_name: string; status?: string; segment_id: string | null; city: string | null } | null = null

        if (isClient && enrollment.client_id) {
          const { data: client } = await supabase
            .from('clients')
            .select('id, company_name, segment_id, city')
            .eq('id', enrollment.client_id)
            .single()
          if (client) entity = { ...client, status: 'active' }
        } else if (enrollment.prospect_id) {
          const { data: prospect } = await supabase
            .from('prospects')
            .select('id, company_name, status, segment_id, callcenter_status, city, region')
            .eq('id', enrollment.prospect_id)
            .single()
          entity = prospect
        }

        if (!entity) {
          await stopEnrollment(supabase, enrollment.id, `${isClient ? 'Klient' : 'Prospect'} nenalezen`, entityId)
          stopped++
          continue
        }

        // ─── STOP podmínky (jen pro prospekty) ──────
        if (!isClient) {
          // 1. Prospect má deal?
          const { count: dealCount } = await supabase
            .from('deals')
            .select('id', { count: 'exact', head: true })
            .eq('prospect_id', entity.id)

          if (dealCount && dealCount > 0) {
            await completeEnrollment(supabase, enrollment.id, 'Deal vytvořen — sekvence splnila účel', entityId)
            stopped++
            continue
          }

          // 2. Prospect status = refused?
          if (entity.status === 'refused') {
            await stopEnrollment(supabase, enrollment.id, 'Prospect odmítl', entityId)
            stopped++
            continue
          }

          // 3. Callcentrum: not_interested?
          const { data: lastCall } = await supabase
            .from('callcenter_call_results')
            .select('result_type')
            .eq('prospect_id', entity.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (lastCall?.result_type === 'not_interested') {
            await stopEnrollment(supabase, enrollment.id, 'Callcentrum: nezájem', entityId)
            stopped++
            continue
          }
        }

        // Unsubscribed? (platí pro prospect i klient)
        const unsubFilter = isClient
          ? supabase.from('email_events').select('id', { count: 'exact', head: true }).eq('client_id', entity.id).eq('event_type', 'unsubscribed')
          : supabase.from('email_events').select('id', { count: 'exact', head: true }).eq('prospect_id', entity.id).eq('event_type', 'unsubscribed')
        const { count: unsubCount } = await unsubFilter

        if (unsubCount && unsubCount > 0) {
          await stopEnrollment(supabase, enrollment.id, `${isClient ? 'Klient' : 'Prospect'} se odhlásil z emailů`, entityId)
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
          await completeEnrollment(supabase, enrollment.id, 'Všechny kroky dokončeny', entityId)
          stopped++
          continue
        }

        // ─── Proveď krok ─────────────────────────
        const result = await executeStep(supabase, enrollment, step, entity, isClient)
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
          await completeEnrollment(supabase, enrollment.id, 'Všechny kroky dokončeny', entityId)
        }

        // Přepočítej lead score (jen pro prospekty)
        if (!isClient && entity.id) {
          await recomputeScoreForProspect(supabase, entity.id)
        }

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
  enrollment: { id: string; prospect_id: string; client_id: string; entity_type: string; sequence_id: string; current_step_order: number; enrolled_at: string },
  step: SequenceStep,
  entity: { id: string; company_name: string; status?: string; segment_id: string | null; city: string | null },
  isClient: boolean
): Promise<StepResult> {
  switch (step.action_type) {
    case 'email':
      return executeEmailStep(supabase, enrollment, step, entity, isClient)
    case 'callcenter':
      if (isClient) {
        // Klienti se nezařazují do callcentra — vytvoř task místo toho
        await supabase.from('activities').insert({
          entity_type: 'client',
          entity_id: entity.id,
          type: 'task',
          subject: 'Zavolat klientovi (sekvence)',
          body: `Automatický task z email sekvence — kontaktovat ${entity.company_name}.`,
        })
        return { success: true, details: { action: 'client_call_task_created' } }
      }
      return executeCallcenterStep(supabase, entity)
    case 'wait_for_event':
      return executeWaitStep(supabase, enrollment, step)
    case 'ai_decide':
      return executeAiStep(supabase, enrollment, step, entity)
    default:
      return { success: false, details: { error: `Neznámý typ kroku: ${step.action_type}` } }
  }
}

async function executeEmailStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string; client_id: string; entity_type: string },
  step: SequenceStep,
  entity: { id: string; company_name: string; segment_id: string | null; city: string | null },
  isClient: boolean
): Promise<StepResult> {
  const templateName = step.email_template_name as TemplateName
  if (!templateName || !EMAIL_TEMPLATES[templateName]) {
    return { success: false, details: { error: `Šablona ${templateName} neexistuje` } }
  }

  // Najdi kontakt s emailem (prospect_contacts nebo client_contacts)
  const contactsTable = isClient ? 'client_contacts' : 'prospect_contacts'
  const foreignKey = isClient ? 'client_id' : 'prospect_id'
  const { data: contacts } = await supabase
    .from(contactsTable)
    .select('first_name, last_name, email, position, is_decision_maker')
    .eq(foreignKey, entity.id)
    .not('email', 'is', null)
    .order('is_decision_maker', { ascending: false })
    .limit(1)

  const contact = contacts?.[0]
  if (!contact?.email) {
    return { success: false, details: { error: `${isClient ? 'Klient' : 'Prospect'} nemá kontakt s emailem` } }
  }

  // Připrav proměnné šablony
  const variables: TemplateVariables = {
    salutation: 'Dobrý den',
    contact_name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || undefined,
    company_name: entity.company_name,
    city: entity.city || undefined,
  }

  // Získej segment info pro personalizaci
  let segmentName = ''
  let segmentPainPoint: string | null = null
  if (entity.segment_id) {
    const { data: segment } = await supabase
      .from('company_segments')
      .select('name, target_pain_point')
      .eq('id', entity.segment_id)
      .single()
    segmentName = segment?.name || ''
    segmentPainPoint = segment?.target_pain_point || null
  }

  // Generuj email (s AI personalizací pokud zapnutá)
  let emailResult
  if (step.use_ai_personalization) {
    emailResult = await personalizeEmail(templateName, variables, {
      companyName: entity.company_name,
      segmentName,
      segmentPainPoint,
      decisionMakerRole: contact.position,
      city: entity.city,
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
    prospect_id: isClient ? null : entity.id,
    client_id: isClient ? entity.id : null,
    message_id: brevoResult.messageId,
  })

  // Vytvoř aktivitu
  const actEntityType = isClient ? 'client' : 'prospect'
  await supabase.from('activities').insert({
    entity_type: actEntityType,
    entity_id: entity.id,
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

  // Vytvoř aktivitu
  await supabase.from('activities').insert({
    entity_type: 'prospect',
    entity_id: enrollment.prospect_id,
    type: 'note',
    subject: `Sekvence: čekání na ${step.wait_event_type || 'událost'}`,
    body: `Timeout vypršel — prospect nereagoval. Pokračuje se dalším krokem.`,
  })

  return {
    success: true,
    details: { action: 'timeout_reached', wait_event: step.wait_event_type },
  }
}

async function executeAiStep(
  supabase: ReturnType<typeof createAdminClient>,
  enrollment: { id: string; prospect_id: string; client_id: string; entity_type: string; sequence_id: string; current_step_order: number; enrolled_at: string },
  step: SequenceStep,
  entity: { id: string; company_name: string; segment_id: string | null }
): Promise<StepResult> {
  // Získej segment
  const isClientAi = enrollment.entity_type === 'client'
  let segmentName = 'neznámý'
  if (entity.segment_id) {
    const { data: segment } = await supabase
      .from('company_segments')
      .select('name')
      .eq('id', entity.segment_id)
      .single()
    segmentName = segment?.name || 'neznámý'
  }

  // Spočítej statistiky
  const emailFilterKey = isClientAi ? 'client_id' : 'prospect_id'
  const { count: emailsSent } = await supabase
    .from('email_send_log')
    .select('id', { count: 'exact', head: true })
    .eq(emailFilterKey, entity.id)

  const { count: emailsOpened } = await supabase
    .from('email_events')
    .select('id', { count: 'exact', head: true })
    .eq(isClientAi ? 'client_id' : 'prospect_id', entity.id)
    .eq('event_type', 'opened')

  const { count: emailsClicked } = await supabase
    .from('email_events')
    .select('id', { count: 'exact', head: true })
    .eq(isClientAi ? 'client_id' : 'prospect_id', entity.id)
    .eq('event_type', 'clicked')

  const { data: callResults } = isClientAi
    ? { data: [] as { result_type: string }[] }
    : await supabase
        .from('callcenter_call_results')
        .select('result_type')
        .eq('prospect_id', entity.id)

  const { count: totalSteps } = await supabase
    .from('sequence_steps')
    .select('id', { count: 'exact', head: true })
    .eq('sequence_id', enrollment.sequence_id)

  const daysSinceEnroll = Math.floor(
    (Date.now() - new Date(enrollment.enrolled_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Zavolej Gemini
  const decision = await decideNextAction({
    companyName: entity.company_name,
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
      await executeCallcenterStep(supabase, entity)
      break
    case 'stop_sequence':
      await stopEnrollment(supabase, enrollment.id, `AI: ${decision.reasoning}`, entity.id)
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

  // Vytvoř aktivitu
  const aiEntityType = enrollment.entity_type || 'prospect'
  const aiEntityId = aiEntityType === 'client' ? enrollment.client_id : enrollment.prospect_id
  await supabase.from('activities').insert({
    entity_type: aiEntityType,
    entity_id: aiEntityId || entity.id,
    type: 'note',
    subject: `Sekvence: AI rozhodnutí — ${decision.action}`,
    body: `Gemini doporučil: ${decision.action}. Důvod: ${decision.reasoning}`,
  })

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
  reason: string,
  entityId?: string | null
) {
  // Zjisti entity_type z enrollmentu
  const { data: enr } = await supabase
    .from('prospect_sequence_enrollments')
    .select('entity_type')
    .eq('id', enrollmentId)
    .single()

  await supabase
    .from('prospect_sequence_enrollments')
    .update({
      status: 'stopped',
      stop_reason: reason,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)

  if (entityId) {
    await supabase.from('activities').insert({
      entity_type: enr?.entity_type || 'prospect',
      entity_id: entityId,
      type: 'note',
      subject: 'Sekvence: zastavena',
      body: `Důvod: ${reason}`,
    })
  }
}

async function completeEnrollment(
  supabase: ReturnType<typeof createAdminClient>,
  enrollmentId: string,
  reason: string,
  entityId?: string | null
) {
  const { data: enr } = await supabase
    .from('prospect_sequence_enrollments')
    .select('entity_type')
    .eq('id', enrollmentId)
    .single()

  await supabase
    .from('prospect_sequence_enrollments')
    .update({
      status: 'completed',
      stop_reason: reason,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)

  if (entityId) {
    await supabase.from('activities').insert({
      entity_type: enr?.entity_type || 'prospect',
      entity_id: entityId,
      type: 'note',
      subject: 'Sekvence: dokončena',
      body: `Důvod: ${reason}`,
    })
  }
}
