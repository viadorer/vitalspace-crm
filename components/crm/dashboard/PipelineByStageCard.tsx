import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { DEAL_STAGES } from '@/lib/utils/constants'
import type { Deal } from '@/lib/supabase/types'

const ACTIVE_STAGES = ['lead', 'technical_audit', 'proposal_sent', 'negotiation', 'contract_signed', 'installation', 'handover']

interface Props {
  activeDeals: Deal[]
}

export function PipelineByStageCard({ activeDeals }: Props) {
  const stageStats = DEAL_STAGES
    .filter(s => ACTIVE_STAGES.includes(s.value))
    .map(stage => {
      const stageDeals = activeDeals.filter(d => d.stage === stage.value)
      return {
        ...stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.final_price_czk || 0), 0),
      }
    })

  const maxStageValue = Math.max(...stageStats.map(s => s.value), 1)

  return (
    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline podle fáze</h2>
        <Link href="/crm/pipeline" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Zobrazit pipeline <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {stageStats.map(stage => (
          <div key={stage.value} className="flex items-center gap-3">
            <div className="w-32 text-sm text-gray-600 truncate flex-shrink-0">{stage.label}</div>
            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500"
                style={{
                  width: `${Math.max((stage.value / maxStageValue) * 100, stage.count > 0 ? 5 : 0)}%`,
                  backgroundColor: stage.color,
                  opacity: 0.8,
                }}
              />
              {stage.count > 0 && (
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium text-gray-900">
                    {stage.count}× · {formatCurrency(stage.value)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
