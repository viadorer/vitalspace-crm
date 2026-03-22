import { AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Deal } from '@/lib/supabase/types'

interface Props {
  deals: Deal[]
}

export function DeadlinesCard({ deals }: Props) {
  const now = new Date()
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const upcomingDeadlines = deals
    .filter(d => d.estimated_close_date && new Date(d.estimated_close_date) <= in14Days && new Date(d.estimated_close_date) >= now)
    .sort((a, b) => new Date(a.estimated_close_date!).getTime() - new Date(b.estimated_close_date!).getTime())

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-gray-900">Blížící se deadliny</h2>
      </div>
      {upcomingDeadlines.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné blížící se deadliny</p>
      ) : (
        <div className="space-y-3">
          {upcomingDeadlines.slice(0, 8).map(deal => {
            const daysLeft = Math.ceil((new Date(deal.estimated_close_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            const companyName = deal.client?.company_name || deal.prospect?.company_name
            const urgencyColor = daysLeft <= 3 ? 'text-red-600 bg-red-50' : daysLeft <= 7 ? 'text-orange-600 bg-orange-50' : 'text-yellow-600 bg-yellow-50'
            return (
              <div key={deal.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{deal.title}</p>
                  {companyName && <p className="text-xs text-gray-500 truncate">{companyName}</p>}
                </div>
                <div className="flex flex-col items-end ml-2 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900">{formatDate(deal.estimated_close_date!)}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded mt-1 ${urgencyColor}`}>
                    {daysLeft === 0 ? 'Dnes!' : `${daysLeft}d`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
