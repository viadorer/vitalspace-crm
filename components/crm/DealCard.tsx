import { formatCurrency } from '@/lib/utils/format'
import type { Deal } from '@/lib/supabase/types'

interface DealCardProps {
  deal: Deal & { client?: { company_name: string } }
  onClick: () => void
  isDragging?: boolean
}

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg rotate-2' : ''
      }`}
    >
      <h4 className="font-medium text-gray-900 mb-2">{deal.title}</h4>
      
      {deal.client && (
        <p className="text-sm text-gray-600 mb-2">{deal.client.company_name}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-blue-600">
          {formatCurrency(deal.final_price_czk)}
        </span>
      </div>

      {deal.estimated_close_date && (
        <p className="text-xs text-gray-500 mt-2">
          Očekáváno: {new Date(deal.estimated_close_date).toLocaleDateString('cs-CZ')}
        </p>
      )}
    </div>
  )
}
