/**
 * GET /api/lead-scores — Seznam lead skóre
 * POST /api/lead-scores — Trigger přepočtu všech skóre
 *
 * Query params:
 *   category: hot | warm | cold (filtr)
 *   limit: number (default 50)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { recomputeAllScores } from '@/lib/scoring/lead-score'

export async function GET(request: NextRequest) {
  const auth = await requireRole('superadmin', 'admin', 'consultant')
  if (auth instanceof NextResponse) return auth

  try {
    const category = request.nextUrl.searchParams.get('category')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 200)

    const supabase = createAdminClient()

    let query = supabase
      .from('lead_scores')
      .select(`
        *,
        prospect:prospects(id, company_name, status, priority, region, city)
      `)
      .order('total_score', { ascending: false })
      .limit(limit)

    if (category && ['hot', 'warm', 'cold'].includes(category)) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) return safeErrorResponse(error)
    return NextResponse.json(data)
  } catch (error) {
    return safeErrorResponse(error)
  }
}

export async function POST() {
  const auth = await requireRole('superadmin', 'admin')
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = createAdminClient()
    const computed = await recomputeAllScores(supabase)

    return NextResponse.json({
      success: true,
      computed,
      message: `Přepočítáno ${computed} lead skóre`,
    })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
