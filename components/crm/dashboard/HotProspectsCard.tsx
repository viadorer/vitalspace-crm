import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import type { Prospect } from '@/lib/supabase/types'

interface Props {
  prospects: Prospect[]
}

export function HotProspectsCard({ prospects }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Hot prospekty</h2>
        </div>
        <Link href="/crm/prospects" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Vše <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {prospects.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné neoslovené high-priority prospekty</p>
      ) : (
        <div className="space-y-3">
          {prospects.slice(0, 8).map(prospect => (
            <div key={prospect.id} className="flex items-start justify-between p-2 rounded-lg hover:bg-gray-50">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{prospect.company_name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {prospect.region && <span>{prospect.region}</span>}
                  {prospect.city && <><span>·</span><span>{prospect.city}</span></>}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  prospect.priority === 1 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  P{prospect.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
