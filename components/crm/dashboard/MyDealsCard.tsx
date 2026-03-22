import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import { DEAL_STAGES } from '@/lib/utils/constants'
import type { Deal } from '@/lib/supabase/types'

interface Props {
  deals: Deal[]
}

export function MyDealsCard({ deals }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Moje dealy</h2>
        <span className="text-sm text-gray-500">{deals.length}</span>
      </div>
      {deals.length === 0 ? (
        <p className="text-sm text-gray-500">Nemáte přiřazené žádné dealy</p>
      ) : (
        <div className="space-y-3">
          {deals.slice(0, 8).map(deal => {
            const stageInfo = DEAL_STAGES.find(s => s.value === deal.stage)
            const companyName = deal.client?.company_name || deal.prospect?.company_name
            return (
              <Link key={deal.id} href="/crm/pipeline" className="block">
                <div className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                    {companyName && <p className="text-xs text-gray-500 truncate">{companyName}</p>}
                  </div>
                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-blue-600">{formatCurrency(deal.final_price_czk)}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full mt-1"
                      style={{ backgroundColor: stageInfo?.color + '20', color: stageInfo?.color }}
                    >
                      {stageInfo?.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
