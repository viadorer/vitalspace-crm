/**
 * GET /api/sequences/[id]/enrollments — Enrollmenty sekvence
 * POST /api/sequences/[id]/enrollments — Zařadit prospekty do sekvence
 *
 * POST body: { prospect_ids: string[] }
 * Zařadí prospekty do sekvence a nastaví next_execution_at na ihned.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('prospect_sequence_enrollments')
    .select(`
      *,
      prospect:prospects(id, company_name, status, callcenter_status)
    `)
    .eq('sequence_id', id)
    .order('enrolled_at', { ascending: false })

  if (error) return safeErrorResponse(error)
  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await request.json()
    const { prospect_ids } = body

    if (!Array.isArray(prospect_ids) || prospect_ids.length === 0) {
      return NextResponse.json({ error: 'prospect_ids je povinné pole' }, { status: 400 })
    }

    if (prospect_ids.length > 500) {
      return NextResponse.json({ error: 'Max 500 prospektů najednou' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Najdi první krok sekvence pro delay
    const { data: firstStep } = await supabase
      .from('sequence_steps')
      .select('delay_hours')
      .eq('sequence_id', id)
      .eq('step_order', 1)
      .single()

    const delayHours = firstStep?.delay_hours || 0
    const nextExecution = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString()

    // Vlož enrollmenty (ignoruj duplicity)
    const enrollments = prospect_ids.map((prospectId: string) => ({
      prospect_id: prospectId,
      sequence_id: id,
      current_step_order: 1,
      status: 'active' as const,
      next_execution_at: nextExecution,
    }))

    const { data, error } = await supabase
      .from('prospect_sequence_enrollments')
      .upsert(enrollments, { onConflict: 'prospect_id,sequence_id', ignoreDuplicates: true })
      .select()

    if (error) return safeErrorResponse(error)

    return NextResponse.json({
      enrolled: data?.length || 0,
      sequence_id: id,
    }, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
