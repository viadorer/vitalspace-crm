/**
 * GET /api/sequences/[id] — Detail sekvence
 * PATCH /api/sequences/[id] — Úprava sekvence
 * DELETE /api/sequences/[id] — Smazání sekvence
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
    .from('email_sequences')
    .select('*, steps:sequence_steps(*)')
    .eq('id', id)
    .single()

  if (error) return safeErrorResponse(error)
  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('superadmin', 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  try {
    const body = await request.json()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.segment_ids !== undefined) updates.segment_ids = body.segment_ids
    if (body.is_active !== undefined) updates.is_active = body.is_active

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('email_sequences')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return safeErrorResponse(error)
    return NextResponse.json(data)
  } catch (error) {
    return safeErrorResponse(error)
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole('superadmin', 'admin')
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('email_sequences')
    .delete()
    .eq('id', id)

  if (error) return safeErrorResponse(error)
  return NextResponse.json({ success: true })
}
