/**
 * PATCH /api/sequences/[id]/enrollments/[enrollmentId]
 *
 * Ovládání enrollment: pause, resume, stop
 * Body: { action: 'pause' | 'resume' | 'stop' }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
) {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  const { enrollmentId } = await params

  try {
    const body = await request.json()
    const { action } = body

    if (!['pause', 'resume', 'stop'].includes(action)) {
      return NextResponse.json({ error: 'action musí být pause, resume nebo stop' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const now = new Date().toISOString()

    const updates: Record<string, unknown> = { updated_at: now }

    switch (action) {
      case 'pause':
        updates.status = 'paused'
        break
      case 'resume':
        updates.status = 'active'
        updates.next_execution_at = now // Proveď hned
        break
      case 'stop':
        updates.status = 'stopped'
        updates.stop_reason = 'Zastaveno uživatelem'
        updates.completed_at = now
        break
    }

    const { data, error } = await supabase
      .from('prospect_sequence_enrollments')
      .update(updates)
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) return safeErrorResponse(error)
    return NextResponse.json(data)
  } catch (error) {
    return safeErrorResponse(error)
  }
}
