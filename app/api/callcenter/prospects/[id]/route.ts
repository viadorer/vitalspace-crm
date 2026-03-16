import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCallcenterApiKey } from '@/lib/supabase/callcenter-auth'
import { isValidUUID } from '@/lib/supabase/auth-guard'

/**
 * GET /api/callcenter/prospects/[id]
 * Detail prospektu s kontakty a historií hovorů.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCallcenterApiKey(request)
  if (auth instanceof NextResponse) return auth

  if (!auth.permissions.includes('prospects:read')) {
    return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
  }

  const { id } = await params

  if (!isValidUUID(id)) {
    return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    // Prospect s kontakty
    const { data: prospect, error } = await admin
      .from('prospects')
      .select(`
        id, company_name, ico, city, region, address, website,
        status, priority, notes, source,
        callcenter_status, callcenter_total_calls,
        callcenter_last_called_at, callcenter_next_contact_at,
        company_segments(name),
        prospect_contacts(
          id, first_name, last_name, phone, email,
          position, linkedin_url, is_decision_maker
        )
      `)
      .eq('id', id)
      .single()

    if (error || !prospect) {
      return NextResponse.json({ error: 'Prospect nenalezen' }, { status: 404 })
    }

    // Historie hovorů
    const { data: callHistory } = await admin
      .from('callcenter_call_results')
      .select('*')
      .eq('prospect_id', id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      ...prospect,
      call_history: callHistory || [],
    })
  } catch (error) {
    console.error('Callcenter prospect detail error:', error)
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 })
  }
}
