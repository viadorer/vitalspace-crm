/**
 * GET /api/lead-scores/[prospectId] — Lead skóre jednoho prospekta
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { recomputeScoreForProspect } from '@/lib/scoring/lead-score'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  const { prospectId } = await params

  try {
    const supabase = createAdminClient()

    // Zkus načíst existující skóre
    const { data: existing } = await supabase
      .from('lead_scores')
      .select('*')
      .eq('prospect_id', prospectId)
      .single()

    if (existing) {
      return NextResponse.json(existing)
    }

    // Pokud neexistuje, vypočítej a vrať
    const refresh = request.nextUrl.searchParams.get('refresh') === 'true'
    if (refresh || !existing) {
      const breakdown = await recomputeScoreForProspect(supabase, prospectId)
      return NextResponse.json({
        prospect_id: prospectId,
        ...breakdown,
        category: breakdown.total_score >= 80 ? 'hot' : breakdown.total_score >= 50 ? 'warm' : 'cold',
      })
    }

    return NextResponse.json(existing)
  } catch (error) {
    return safeErrorResponse(error)
  }
}
