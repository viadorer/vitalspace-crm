import React from 'react'
import { formatCurrency } from '@/lib/utils/format'
import { Building2, User, Calendar, Clock } from 'lucide-react'
import type { Deal } from '@/lib/supabase/types'

interface DealCardProps {
  deal: Deal
  onClick: () => void
  isDragging?: boolean
}

function getDaysInStage(stageEnteredAt: string | null): number {
  if (!stageEnteredAt) return 0
  const diff = Date.now() - new Date(stageEnteredAt).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function getAgeBadge(days: number): { label: string; className: string } | null {
  if (days <= 3) return null
  if (days <= 7) return { label: `${days}d`, className: 'bg-yellow-100 text-yellow-700' }
  if (days <= 14) return { label: `${days}d`, className: 'bg-orange-100 text-orange-700' }
  return { label: `${days}d`, className: 'bg-red-100 text-red-700' }
}

export const DealCard = React.memo(function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const companyName = deal.client?.company_name || deal.prospect?.company_name
  const consultantName = deal.assigned_user?.full_name || deal.assigned_consultant
  const daysInStage = getDaysInStage(deal.stage_entered_at)
  const ageBadge = getAgeBadge(daysInStage)

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 rounded-lg border border-border cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg rotate-2' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">{deal.title}</h4>
        {ageBadge && (
          <span className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${ageBadge.className}`}>
            <Clock className="w-3 h-3" />
            {ageBadge.label}
          </span>
        )}
      </div>

      {deal.deal_number && (
        <p className="text-xs text-gray-400 font-mono mb-1">{deal.deal_number}</p>
      )}

      {companyName && (
        <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{companyName}</span>
        </p>
      )}

      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-semibold text-blue-600">
          {formatCurrency(deal.final_price_czk)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        {consultantName ? (
          <span className="flex items-center gap-1 truncate">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{consultantName}</span>
          </span>
        ) : (
          <span />
        )}
        {deal.estimated_close_date && (
          <span className="flex items-center gap-1 flex-shrink-0">
            <Calendar className="w-3 h-3" />
            {new Date(deal.estimated_close_date).toLocaleDateString('cs-CZ')}
          </span>
        )}
      </div>
    </div>
  )
})
