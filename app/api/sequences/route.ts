/**
 * GET /api/sequences — Seznam všech email sekvencí
 * POST /api/sequences — Vytvoření nové sekvence
 *
 * Auth: superadmin, admin, consultant
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'

export async function GET() {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('email_sequences')
      .select(`
        *,
        steps:sequence_steps(count),
        enrollments:prospect_sequence_enrollments(count)
      `)
      .order('created_at', { ascending: false })

    if (error) return safeErrorResponse(error)

    // Flatten counts
    const sequences = (data || []).map((s: Record<string, unknown>) => ({
      ...s,
      step_count: (s.steps as Array<{ count: number }>)?.[0]?.count || 0,
      enrollment_count: (s.enrollments as Array<{ count: number }>)?.[0]?.count || 0,
      steps: undefined,
      enrollments: undefined,
    }))

    return NextResponse.json(sequences)
  } catch (error) {
    return safeErrorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole('superadmin', 'admin')
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { name, description, segment_ids, is_active } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Název je povinný' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('email_sequences')
      .insert({
        name: name.slice(0, 200),
        description: description || null,
        segment_ids: Array.isArray(segment_ids) ? segment_ids : [],
        is_active: is_active || false,
        created_by: auth.id,
      })
      .select()
      .single()

    if (error) return safeErrorResponse(error)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
