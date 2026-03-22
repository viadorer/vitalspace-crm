/**
 * POST /api/webhooks/brevo
 *
 * Přijímá webhook eventy z Brevo (SendinBlue):
 * - delivered: email byl doručen
 * - opened: příjemce otevřel email
 * - clicked: příjemce kliknul na link
 * - bounced: email se vrátil (špatná adresa)
 * - unsubscribed: příjemce se odhlásil
 * - complaint: spam report
 *
 * Co se stane:
 * 1. Uloží event do email_events tabulky
 * 2. Pokud otevření/klik → posune sekvenci (pokud čeká na event)
 * 3. Pokud unsubscribed/bounced → zastaví aktivní sekvence
 * 4. Přepočítá lead score prospekta
 *
 * Auth: Volitelně BREVO_WEBHOOK_SECRET v query parametru
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recomputeScoreForProspect } from '@/lib/scoring/lead-score'

export const dynamic = 'force-dynamic'

// Brevo event type mapping
const VALID_EVENTS = ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complaint'] as const
type BrevoEventType = typeof VALID_EVENTS[number]

// Map Brevo event names to our event types
const EVENT_MAP: Record<string, BrevoEventType> = {
  delivered: 'delivered',
  request: 'delivered',
  opened: 'opened',
  unique_opened: 'opened',
  click: 'clicked',
  hard_bounce: 'bounced',
  soft_bounce: 'bounced',
  unsubscribed: 'unsubscribed',
  complaint: 'complaint',
  spam: 'complaint',
}

export async function POST(request: NextRequest) {
  // Optional secret verification
  const secret = process.env.BREVO_WEBHOOK_SECRET
  if (secret) {
    const querySecret = request.nextUrl.searchParams.get('secret')
    if (querySecret !== secret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }
  }

  try {
    const body = await request.json()
    const eventName = body.event?.toLowerCase() || ''
    const mappedEvent = EVENT_MAP[eventName]

    if (!mappedEvent) {
      // Neznámý event — ignorovat
      return NextResponse.json({ status: 'ignored', event: eventName })
    }

    const messageId = body['message-id'] || body.messageId || ''
    const email = body.email || ''

    if (!messageId) {
      return NextResponse.json({ error: 'Missing message-id' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Najdi prospect podle message_id v email_send_log
    const { data: sendLog } = await supabase
      .from('email_send_log')
      .select('prospect_id, client_id')
      .eq('message_id', messageId)
      .single()

    const prospectId = sendLog?.prospect_id || null
    const clientId = sendLog?.client_id || null

    // 2. Najdi enrollment (pokud existuje)
    let enrollmentId: string | null = null
    if (prospectId) {
      const { data: enrollment } = await supabase
        .from('prospect_sequence_enrollments')
        .select('id')
        .eq('prospect_id', prospectId)
        .eq('status', 'active')
        .limit(1)
        .single()
      enrollmentId = enrollment?.id || null
    }

    // 3. Ulož event
    await supabase.from('email_events').insert({
      message_id: messageId,
      prospect_id: prospectId,
      client_id: clientId,
      enrollment_id: enrollmentId,
      event_type: mappedEvent,
      email_address: email,
      link_url: body.link || null,
      raw_payload: body,
    })

    // 4. Reaguj na event
    if (enrollmentId && prospectId) {
      if (mappedEvent === 'opened' || mappedEvent === 'clicked') {
        // Pokud sekvence čeká na tento event → posuň ji
        await advanceSequenceOnEvent(supabase, enrollmentId, mappedEvent)
      }

      if (mappedEvent === 'unsubscribed' || mappedEvent === 'bounced') {
        // Zastav sekvenci
        await supabase
          .from('prospect_sequence_enrollments')
          .update({
            status: 'stopped',
            stop_reason: mappedEvent === 'unsubscribed' ? 'Prospect se odhlásil z emailů' : 'Email bounced — neplatná adresa',
            updated_at: new Date().toISOString(),
          })
          .eq('id', enrollmentId)
      }
    }

    // 5. Přepočítej lead score
    if (prospectId) {
      await recomputeScoreForProspect(supabase, prospectId)
    }

    return NextResponse.json({ status: 'ok', event: mappedEvent, prospect_id: prospectId })
  } catch (error) {
    console.error('Brevo webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/** Health check */
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'brevo-webhook' })
}

// ─── Helpers ─────────────────────────────────────

async function advanceSequenceOnEvent(
  supabase: ReturnType<typeof createAdminClient>,
  enrollmentId: string,
  eventType: string
) {
  // Najdi enrollment a jeho aktuální krok
  const { data: enrollment } = await supabase
    .from('prospect_sequence_enrollments')
    .select('id, sequence_id, current_step_order')
    .eq('id', enrollmentId)
    .eq('status', 'active')
    .single()

  if (!enrollment) return

  // Najdi aktuální krok — je to wait_for_event?
  const { data: currentStep } = await supabase
    .from('sequence_steps')
    .select('*')
    .eq('sequence_id', enrollment.sequence_id)
    .eq('step_order', enrollment.current_step_order)
    .single()

  if (!currentStep || currentStep.action_type !== 'wait_for_event') return

  // Kontrola: čekáme na tento typ eventu?
  const eventMatch =
    (currentStep.wait_event_type === 'open' && eventType === 'opened') ||
    (currentStep.wait_event_type === 'click' && eventType === 'clicked')

  if (!eventMatch) return

  // Event nastal! Posuň sekvenci
  const nextStep = currentStep.on_event_skip_to_step || enrollment.current_step_order + 1

  await supabase
    .from('prospect_sequence_enrollments')
    .update({
      current_step_order: nextStep,
      next_execution_at: new Date().toISOString(), // Proveď hned
      last_step_executed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)

  // Loguj
  await supabase.from('sequence_execution_log').insert({
    enrollment_id: enrollmentId,
    step_order: enrollment.current_step_order,
    action_type: 'wait_for_event',
    result: 'success',
    details: { event_type: eventType, skipped_to: nextStep },
  })
}
