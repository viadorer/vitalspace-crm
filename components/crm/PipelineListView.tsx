'use client'

import { useState, useMemo } from 'react'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { DEAL_STAGES } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/format'
import { Building2, User, Calendar, Clock, ArrowUpDown, ChevronDown } from 'lucide-react'
import type { Deal, DealStage } from '@/lib/supabase/types'

interface PipelineListViewProps {
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  onStageChange: (dealId: string, newStage: DealStage) => Promise<void>
}

type SortField = 'title' | 'company' | 'value' | 'date' | 'days'
type SortDir = 'asc' | 'desc'

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

export function PipelineListView({ deals, onDealClick, onStageChange }: PipelineListViewProps) {
  const [activeStage, setActiveStage] = usePersistedState<DealStage | 'all'>('pipeline_list_stage', 'all')
  const [sortField, setSortField] = usePersistedState<SortField>('pipeline_list_sort', 'date')
  const [sortDir, setSortDir] = usePersistedState<SortDir>('pipeline_list_dir', 'desc')
  const [changingStage, setChangingStage] = useState<string | null>(null)

  const dealsByStage = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const stage of DEAL_STAGES) {
      counts[stage.value] = deals.filter(d => d.stage === stage.value).length
    }
    return counts
  }, [deals])

  const totalValue = useMemo(() => {
    return deals.reduce((sum, d) => sum + (d.final_price_czk || d.total_value_czk || 0), 0)
  }, [deals])

  const filteredDeals = useMemo(() => {
    let filtered = activeStage === 'all'
      ? deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
      : deals.filter(d => d.stage === activeStage)

    filtered.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = (a.title || '').localeCompare(b.title || '', 'cs')
          break
        case 'company': {
          const aName = a.client?.company_name || a.prospect?.company_name || ''
          const bName = b.client?.company_name || b.prospect?.company_name || ''
          cmp = aName.localeCompare(bName, 'cs')
          break
        }
        case 'value':
          cmp = (a.final_price_czk || 0) - (b.final_price_czk || 0)
          break
        case 'date': {
          const aDate = a.estimated_close_date || ''
          const bDate = b.estimated_close_date || ''
          cmp = aDate.localeCompare(bDate)
          break
        }
        case 'days':
          cmp = getDaysInStage(a.stage_entered_at) - getDaysInStage(b.stage_entered_at)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return filtered
  }, [deals, activeStage, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  async function handleStageChange(dealId: string, newStage: DealStage) {
    setChangingStage(dealId)
    await onStageChange(dealId, newStage)
    setChangingStage(null)
  }

  const activeStages = DEAL_STAGES.filter(s => s.value !== 'closed_won' && s.value !== 'closed_lost')
  const closedStages = DEAL_STAGES.filter(s => s.value === 'closed_won' || s.value === 'closed_lost')

  return (
    <div>
      {/* Stage tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setActiveStage('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeStage === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Vše
          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
            activeStage === 'all' ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            {deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length}
          </span>
        </button>

        {activeStages.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setActiveStage(stage.value as DealStage)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === stage.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={activeStage === stage.value ? { backgroundColor: stage.color } : undefined}
          >
            {stage.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeStage === stage.value ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {dealsByStage[stage.value] || 0}
            </span>
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0" />

        {closedStages.map((stage) => (
          <button
            key={stage.value}
            onClick={() => setActiveStage(stage.value as DealStage)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === stage.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={activeStage === stage.value ? { backgroundColor: stage.color } : undefined}
          >
            {stage.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              activeStage === stage.value ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {dealsByStage[stage.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
        <span>{filteredDeals.length} dealů</span>
        <span>Celková hodnota: <strong className="text-gray-900">{formatCurrency(
          filteredDeals.reduce((s, d) => s + (d.final_price_czk || d.total_value_czk || 0), 0)
        )}</strong></span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort('title')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900">
                  Deal
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort('company')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900">
                  Firma
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              {activeStage === 'all' && (
                <th className="text-left px-4 py-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Fáze</span>
                </th>
              )}
              <th className="text-right px-4 py-3">
                <button onClick={() => toggleSort('value')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900 ml-auto">
                  Hodnota
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <span className="text-xs font-semibold text-gray-500 uppercase">Konzultant</span>
              </th>
              <th className="text-left px-4 py-3">
                <button onClick={() => toggleSort('date')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900">
                  Odhad uzavření
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-4 py-3">
                <button onClick={() => toggleSort('days')} className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase hover:text-gray-900 ml-auto">
                  Ve fázi
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={activeStage === 'all' ? 7 : 6} className="text-center py-12 text-gray-400">
                  Žádné dealy v této fázi
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => {
                const companyName = deal.client?.company_name || deal.prospect?.company_name
                const consultantName = deal.assigned_user?.full_name || deal.assigned_consultant
                const daysInStage = getDaysInStage(deal.stage_entered_at)
                const ageBadge = getAgeBadge(daysInStage)
                const stageInfo = DEAL_STAGES.find(s => s.value === deal.stage)

                return (
                  <tr
                    key={deal.id}
                    onClick={() => onDealClick(deal)}
                    className="border-b border-border last:border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{deal.title}</p>
                        {deal.deal_number && (
                          <p className="text-xs text-gray-400 font-mono">{deal.deal_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {companyName && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[200px]">{companyName}</span>
                        </span>
                      )}
                    </td>
                    {activeStage === 'all' && (
                      <td className="px-4 py-3">
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={deal.stage}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                            disabled={changingStage === deal.id}
                            className="appearance-none text-xs font-medium px-2.5 py-1 pr-6 rounded-full border-0 cursor-pointer"
                            style={{
                              backgroundColor: stageInfo?.color + '20',
                              color: stageInfo?.color,
                            }}
                          >
                            {DEAL_STAGES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: stageInfo?.color }} />
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrency(deal.final_price_czk)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {consultantName && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          <span className="truncate max-w-[150px]">{consultantName}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {deal.estimated_close_date && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                          {new Date(deal.estimated_close_date).toLocaleDateString('cs-CZ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {ageBadge ? (
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${ageBadge.className}`}>
                          <Clock className="w-3 h-3" />
                          {ageBadge.label}
                        </span>
                      ) : daysInStage > 0 ? (
                        <span className="text-xs text-gray-400">{daysInStage}d</span>
                      ) : null}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
