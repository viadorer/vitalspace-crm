import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireCallcenterApiKey } from '@/lib/supabase/callcenter-auth'

/**
 * GET /api/callcenter/stats
 * Statistiky callcentra — přehled výkonnosti.
 *
 * Query params:
 *   from  - datum od (ISO)
 *   to    - datum do (ISO)
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

    const from = searchParams.get('from') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const to = searchParams.get('to') || new Date().toISOString()

    // Celkové počty prospektů dle callcenter_status
    const { data: statusCounts } = await admin
      .from('prospects')
      .select('callcenter_status')
      .not('callcenter_status', 'is', null)

    const queueStats = {
      queued: 0,
      in_progress: 0,
      completed: 0,
      paused: 0,
    }
    statusCounts?.forEach((p: any) => {
      if (p.callcenter_status in queueStats) {
        queueStats[p.callcenter_status as keyof typeof queueStats]++
      }
    })

    // Výsledky hovorů za období
    const { data: callResults } = await admin
      .from('callcenter_call_results')
      .select('result_type, operator_name')
      .gte('created_at', from)
      .lte('created_at', to)

    const resultStats: Record<string, number> = {}
    const operatorStats: Record<string, number> = {}
    callResults?.forEach((cr: any) => {
      resultStats[cr.result_type] = (resultStats[cr.result_type] || 0) + 1
      operatorStats[cr.operator_name] = (operatorStats[cr.operator_name] || 0) + 1
    })

    // Due prospekty (k zavolání teď)
    const { count: dueCount } = await admin
      .from('prospects')
      .select('id', { count: 'exact', head: true })
      .lte('callcenter_next_contact_at', new Date().toISOString())
      .eq('callcenter_status', 'in_progress')

    return NextResponse.json({
      period: { from, to },
      queue: queueStats,
      total_calls: callResults?.length || 0,
      due_now: dueCount || 0,
      results_by_type: resultStats,
      calls_by_operator: operatorStats,
    })
  } catch (error) {
    console.error('Callcenter stats error:', error)
    return NextResponse.json({ error: 'Interní chyba' }, { status: 500 })
  }
}
