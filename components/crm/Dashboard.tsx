'use client'

import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useDashboardData } from '@/lib/hooks/useDashboardData'
import { formatCurrency } from '@/lib/utils/format'
import {
  DollarSign,
  Target,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Flame,
} from 'lucide-react'

import { KpiCard } from './dashboard/KpiCard'
import { PipelineByStageCard } from './dashboard/PipelineByStageCard'
import { MonthlyRevenueCard } from './dashboard/MonthlyRevenueCard'
import { MyDealsCard } from './dashboard/MyDealsCard'
import { DeadlinesCard } from './dashboard/DeadlinesCard'
import { HotProspectsCard } from './dashboard/HotProspectsCard'
import { RecentActivityCard } from './dashboard/RecentActivityCard'

const ACTIVE_STAGES = ['lead', 'technical_audit', 'proposal_sent', 'negotiation', 'contract_signed', 'installation', 'handover']

export function Dashboard() {
  const { data, loading } = useDashboardData()
  const { user } = useCurrentUser()

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { deals, prospects, recentActivity, monthlyRevenue } = data

  const activeDeals = deals.filter(d => ACTIVE_STAGES.includes(d.stage))
  const wonDeals = deals.filter(d => d.stage === 'closed_won')
  const lostDeals = deals.filter(d => d.stage === 'closed_lost')
  const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.final_price_czk || 0), 0)
  const totalWon = wonDeals.reduce((sum, d) => sum + (d.final_price_czk || 0), 0)
  const avgDeal = wonDeals.length > 0 ? totalWon / wonDeals.length : 0
  const conversionRate = (wonDeals.length + lostDeals.length) > 0
    ? Math.round((wonDeals.length / (wonDeals.length + lostDeals.length)) * 100)
    : 0
  const hotProspects = prospects.filter(p => p.status === 'not_contacted' && p.priority <= 2)

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const wonThisMonth = wonDeals.filter(d => d.closed_at && new Date(d.closed_at) >= thisMonthStart)
  const wonThisMonthTotal = wonThisMonth.reduce((sum, d) => sum + (d.final_price_czk || 0), 0)

  const myDeals = user
    ? activeDeals.filter(d => d.assigned_user_id === user.id)
    : []

  return (
    <div className="p-8 space-y-6">
      {/* KPI karty */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Pipeline celkem"
          value={formatCurrency(totalPipeline)}
          subtitle={`${activeDeals.length} aktivních dealů`}
          icon={<BarChart3 className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <KpiCard
          title="Won tento měsíc"
          value={formatCurrency(wonThisMonthTotal)}
          subtitle={`${wonThisMonth.length} uzavřených`}
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <KpiCard
          title="Celkem uzavřeno"
          value={formatCurrency(totalWon)}
          subtitle={`${wonDeals.length} dealů`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <KpiCard
          title="Konverzní poměr"
          value={`${conversionRate}%`}
          subtitle={`${wonDeals.length} won / ${lostDeals.length} lost`}
          icon={<Target className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <KpiCard
          title="Průměrný deal"
          value={formatCurrency(avgDeal)}
          icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
          color="bg-orange-50"
        />
        <KpiCard
          title="Hot prospekty"
          value={String(hotProspects.length)}
          subtitle="Neoslovené, priorita 1–2"
          icon={<Flame className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
      </div>

      {/* Pipeline funnel + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PipelineByStageCard activeDeals={activeDeals} />
        <MonthlyRevenueCard monthlyRevenue={monthlyRevenue} />
      </div>

      {/* Moje dealy + Deadliny + Hot prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MyDealsCard deals={myDeals} />
        <DeadlinesCard deals={activeDeals} />
        <HotProspectsCard prospects={hotProspects} />
      </div>

      {/* Nedávná aktivita */}
      <RecentActivityCard entries={recentActivity} />
    </div>
  )
}
