import { formatCurrency } from '@/lib/utils/format'
import type { MonthlyRevenueRow } from '@/lib/hooks/useDashboardData'

interface Props {
  monthlyRevenue: MonthlyRevenueRow[]
}

export function MonthlyRevenueCard({ monthlyRevenue }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Měsíční tržby</h2>
      {monthlyRevenue.length === 0 ? (
        <p className="text-sm text-gray-500">Zatím žádné uzavřené dealy</p>
      ) : (
        <div className="space-y-4">
          {monthlyRevenue.map((row) => {
            const monthLabel = new Date(row.month).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })
            return (
              <div key={row.month} className="border-b border-gray-50 pb-3 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 capitalize">{monthLabel}</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(row.revenue_czk)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{row.deals_closed} dealů</span>
                  <span>·</span>
                  <span>Ø {formatCurrency(row.avg_deal_czk)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
