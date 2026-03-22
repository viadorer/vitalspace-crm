/**
 * GET /api/sequences/[id]/steps — Kroky sekvence
 * PUT /api/sequences/[id]/steps — Nahrazení všech kroků sekvence
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
    .from('sequence_steps')
    .select('*')
    .eq('sequence_id', id)
    .order('step_order', { ascending: true })

  if (error) return safeErrorResponse(error)
  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('superadmin', 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await request.json()
    const { steps } = body

    if (!Array.isArray(steps)) {
      return NextResponse.json({ error: 'steps musí být pole' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Smaž existující kroky
    await supabase.from('sequence_steps').delete().eq('sequence_id', id)

    // Vlož nové kroky
    if (steps.length > 0) {
      const stepsToInsert = steps.map((step: Record<string, unknown>, index: number) => ({
        sequence_id: id,
        step_order: index + 1,
        action_type: step.action_type || 'email',
        email_template_name: step.email_template_name || null,
        email_subject_override: step.email_subject_override || null,
        use_ai_personalization: step.use_ai_personalization || false,
        delay_hours: step.delay_hours ?? 72,
        wait_event_type: step.wait_event_type || null,
        wait_timeout_hours: step.wait_timeout_hours ?? 168,
        on_event_skip_to_step: step.on_event_skip_to_step || null,
      }))

      const { error } = await supabase.from('sequence_steps').insert(stepsToInsert)
      if (error) return safeErrorResponse(error)
    }

    // Vrať aktualizované kroky
    const { data } = await supabase
      .from('sequence_steps')
      .select('*')
      .eq('sequence_id', id)
      .order('step_order', { ascending: true })

    return NextResponse.json(data)
  } catch (error) {
    return safeErrorResponse(error)
  }
}
