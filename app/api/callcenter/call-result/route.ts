import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCallcenterApiKey } from '@/lib/supabase/callcenter-auth'
import { isValidUUID, truncate } from '@/lib/supabase/auth-guard'

const VALID_RESULT_TYPES = [
  'no_answer', 'unavailable', 'interested', 'meeting_scheduled',
  'meeting_completed', 'not_interested', 'call_later', 'wrong_number',
  'consent_offers', 'other',
]

// Mapování výsledku hovoru na akci v prospect statusu
const RESULT_TO_PROSPECT_STATUS: Record<string, string | null> = {
  interested: 'contacted',
  meeting_scheduled: 'meeting_scheduled',
  meeting_completed: 'meeting_scheduled',
  not_interested: 'refused',
  consent_offers: 'contacted',
}

// Automatický follow-up dle výsledku (dny)
const AUTO_FOLLOW_UP_DAYS: Record<string, number> = {
  no_answer: 1,
  unavailable: 2,
  call_later: 3,
  interested: 7,
  consent_offers: 14,
}

/**
 * POST /api/callcenter/call-result
 * Zaznamenání výsledku hovoru z Web-nabídky callcentra.
 *
 * Body:
 *   prospect_id         - UUID prospektu
 *   prospect_contact_id - UUID kontaktu (optional)
 *   operator_name       - jméno operátora
 *   operator_id         - ID operátora ve Web-nabídky (optional)
 *   result_type         - typ výsledku
 *   note                - poznámka
 *   call_duration_seconds - délka hovoru
 *   next_contact_at     - kdy znovu zavolat (optional, auto-calculated if not set)
 *   meeting_date        - datum schůzky (optional)
 */
export async function POST(request: NextRequest) {
  const auth = await requireCallcenterApiKey(request)
  if (auth instanceof NextResponse) return auth

  if (!auth.permissions.includes('callresult:write')) {
    return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const {
      prospect_id, prospect_contact_id, operator_name,
      operator_id, result_type, note, call_duration_seconds,
      next_contact_at, meeting_date,
    } = body

    // Validace
    if (!prospect_id || !isValidUUID(prospect_id)) {
      return NextResponse.json({ error: 'Neplatné prospect_id' }, { status: 400 })
    }

    if (prospect_contact_id && !isValidUUID(prospect_contact_id)) {
      return NextResponse.json({ error: 'Neplatné prospect_contact_id' }, { status: 400 })
    }

    if (!operator_name || typeof operator_name !== 'string') {
      return NextResponse.json({ error: 'operator_name je povinný' }, { status: 400 })
    }

    if (!VALID_RESULT_TYPES.includes(result_type)) {
      return NextResponse.json({ error: 'Neplatný result_type' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Ověřit, že prospect existuje
    const { data: prospect } = await admin
      .from('prospects')
      .select('id, callcenter_total_calls')
      .eq('id', prospect_id)
      .single()

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect nenalezen' }, { status: 404 })
    }

    const attemptNumber = (prospect.callcenter_total_calls || 0) + 1

    // Vypočítat next_contact_at pokud není nastaveno
    let computedNextContact = next_contact_at || null
    if (!computedNextContact && AUTO_FOLLOW_UP_DAYS[result_type]) {
      const days = AUTO_FOLLOW_UP_DAYS[result_type]
      const nextDate = new Date()
      nextDate.setDate(nextDate.getDate() + days)
      computedNextContact = nextDate.toISOString()
    }

    // Vložit výsledek hovoru
    const { data: callResult, error: insertError } = await admin
      .from('callcenter_call_results')
      .insert({
        prospect_id,
        prospect_contact_id: prospect_contact_id || null,
        operator_name: truncate(operator_name, 100),
        operator_id: truncate(operator_id, 100) || null,
        result_type,
        note: truncate(note, 5000) || null,
        call_duration_seconds: call_duration_seconds || null,
        next_contact_at: computedNextContact,
        meeting_date: meeting_date || null,
        attempt_number: attemptNumber,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Call result insert error:', insertError)
      return NextResponse.json({ error: 'Chyba při ukládání výsledku' }, { status: 500 })
    }

    // Aktualizovat prospect
    const prospectUpdate: Record<string, any> = {
      callcenter_last_called_at: new Date().toISOString(),
      callcenter_total_calls: attemptNumber,
      callcenter_next_contact_at: computedNextContact,
    }

    // Aktualizovat prospect status dle výsledku hovoru
    const newProspectStatus = RESULT_TO_PROSPECT_STATUS[result_type]
    if (newProspectStatus) {
      prospectUpdate.status = newProspectStatus
    }

    // Pokud dokončeno (not_interested, wrong_number), změnit callcenter_status
    if (['not_interested', 'wrong_number'].includes(result_type)) {
      prospectUpdate.callcenter_status = 'completed'
      prospectUpdate.callcenter_next_contact_at = null
    } else if (['meeting_scheduled', 'meeting_completed'].includes(result_type)) {
      prospectUpdate.callcenter_status = 'completed'
    } else {
      prospectUpdate.callcenter_status = 'in_progress'
    }

    await admin
      .from('prospects')
      .update(prospectUpdate)
      .eq('id', prospect_id)

    // Vytvořit touchpoint záznam (pokud tabulka existuje)
    try {
      await admin.from('touchpoints').insert({
        prospect_id,
        type: 'call',
        notes: `[Callcentrum] ${result_type}: ${note || ''}`.slice(0, 1000),
        created_at: new Date().toISOString(),
      })
    } catch {
      // touchpoints tabulka nemusí existovat
    }

    return NextResponse.json({
      success: true,
      call_result: callResult,
      prospect_updated: {
        callcenter_status: prospectUpdate.callcenter_status,
        status: newProspectStatus || undefined,
        next_contact_at: computedNextContact,
        total_calls: attemptNumber,
      },
    })
  } catch (error) {
    console.error('Call result error:', error)
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 })
  }
}
