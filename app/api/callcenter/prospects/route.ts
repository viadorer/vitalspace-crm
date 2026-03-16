import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCallcenterApiKey } from '@/lib/supabase/callcenter-auth'
import { clampLimit } from '@/lib/supabase/auth-guard'

/**
 * GET /api/callcenter/prospects
 * Vrací prospekty zařazené do callcentra s primárním kontaktem.
 * Auth: X-API-Key header
 *
 * Query params:
 *   status    - filtr dle callcenter_status (queued|in_progress|completed|paused)
 *   priority  - filtr dle priority (1-5)
 *   region    - filtr dle regionu
 *   segment   - filtr dle segment_name
 *   due       - "true" = jen prospekty, kde callcenter_next_contact_at <= now
 *   limit     - max záznamů (default 50, max 200)
 *   offset    - offset pro stránkování
 */
export async function GET(request: NextRequest) {
  const auth = await requireCallcenterApiKey(request)
  if (auth instanceof NextResponse) return auth

  if (!auth.permissions.includes('prospects:read')) {
    return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
  }

  try {
    const admin = createAdminClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const region = searchParams.get('region')
    const segment = searchParams.get('segment')
    const due = searchParams.get('due')
    const limit = clampLimit(searchParams.get('limit'))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0') || 0)

    let query = admin
      .from('prospects')
      .select(`
        id, company_name, city, region, status, priority, notes,
        callcenter_status, callcenter_total_calls,
        callcenter_last_called_at, callcenter_next_contact_at,
        segment_id, company_segments(name),
        prospect_contacts(
          id, first_name, last_name, phone, email,
          position, is_decision_maker
        )
      `)
      .not('callcenter_status', 'is', null)

    if (status) {
      query = query.eq('callcenter_status', status)
    }

    if (priority) {
      query = query.eq('priority', parseInt(priority))
    }

    if (region) {
      query = query.eq('region', region)
    }

    if (segment) {
      const { data: seg } = await admin
        .from('company_segments')
        .select('id')
        .eq('name', segment)
        .single()
      if (seg) query = query.eq('segment_id', seg.id)
    }

    if (due === 'true') {
      query = query.lte('callcenter_next_contact_at', new Date().toISOString())
    }

    // Řazení: nejdřív due prospekty, pak dle priority
    query = query
      .order('callcenter_next_contact_at', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Callcenter prospects error:', error)
      return NextResponse.json({ error: 'Chyba při načítání' }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        offset,
        limit,
        returned: data?.length || 0,
      },
    })
  } catch (error) {
    console.error('Callcenter prospects error:', error)
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 })
  }
}

/**
 * PATCH /api/callcenter/prospects
 * Hromadné zařazení prospektů do callcentra.
 * Body: { prospect_ids: string[], callcenter_status: "queued" }
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireCallcenterApiKey(request)
  if (auth instanceof NextResponse) return auth

  if (!auth.permissions.includes('prospects:write')) {
    return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { prospect_ids, callcenter_status } = body

    if (!Array.isArray(prospect_ids) || prospect_ids.length === 0 || prospect_ids.length > 100) {
      return NextResponse.json({ error: 'prospect_ids musí být pole s 1-100 položkami' }, { status: 400 })
    }

    const validStatuses = ['queued', 'in_progress', 'completed', 'paused']
    if (!validStatuses.includes(callcenter_status)) {
      return NextResponse.json({ error: 'Neplatný callcenter_status' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('prospects')
      .update({
        callcenter_status,
        callcenter_assigned_at: callcenter_status === 'queued' ? new Date().toISOString() : undefined,
      })
      .in('id', prospect_ids)
      .select('id, company_name, callcenter_status')

    if (error) {
      console.error('Callcenter assign error:', error)
      return NextResponse.json({ error: 'Chyba při aktualizaci' }, { status: 500 })
    }

    return NextResponse.json({ updated: data?.length || 0, data })
  } catch (error) {
    console.error('Callcenter assign error:', error)
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 })
  }
}
