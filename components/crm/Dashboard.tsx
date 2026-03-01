'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/format'
import { DEAL_STAGES, PROSPECT_STATUSES } from '@/lib/utils/constants'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  BarChart3,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Flame,
} from 'lucide-react'
import type { Deal, Prospect, AuditLogEntry, AppUser } from '@/lib/supabase/types'

interface DashboardData {
  deals: Deal[]
  prospects: Prospect[]
  recentActivity: AuditLogEntry[]
  monthlyRevenue: { month: string; deals_closed: number; revenue_czk: number; avg_deal_czk: number }[]
}

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean } | null
  color: string
}

function KpiCard({ title, value, subtitle, icon, trend, color }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const ACTIVE_STAGES = ['lead', 'technical_audit', 'proposal_sent', 'negotiation', 'contract_signed', 'installation', 'handover']

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useCurrentUser()

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()

      const [
        { data: deals },
        { data: prospects },
        { data: recentActivity },
        { data: monthlyRevenue },
      ] = await Promise.all([
        supabase
          .from('deals')
          .select('*, client:clients(id, company_name), prospect:prospects(id, company_name), assigned_user:app_users(id, full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('prospects')
          .select('*')
          .order('priority', { ascending: true })
          .limit(100),
        supabase
          .from('audit_log')
          .select('*, user:app_users(id, full_name)')
          .order('created_at', { ascending: false })
          .limit(15),
        supabase
          .from('v_monthly_revenue')
          .select('*')
          .order('month', { ascending: false })
          .limit(6),
      ])

      setData({
        deals: (deals || []) as Deal[],
        prospects: (prospects || []) as Prospect[],
        recentActivity: (recentActivity || []) as AuditLogEntry[],
        monthlyRevenue: (monthlyRevenue || []) as DashboardData['monthlyRevenue'],
      })
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = activeDeals
    .filter(d => d.estimated_close_date && new Date(d.estimated_close_date) <= in14Days && new Date(d.estimated_close_date) >= now)
    .sort((a, b) => new Date(a.estimated_close_date!).getTime() - new Date(b.estimated_close_date!).getTime())

  const myDeals = user
    ? activeDeals.filter(d => d.assigned_user_id === user.id)
    : []

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
    <div className="p-8 space-y-6">
      {/* KPI karty */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        {/* Pipeline by stage */}
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

        {/* Měsíční revenue */}
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
      </div>

      {/* Moje dealy + Blížící se deadliny + Hot prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Moje dealy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Moje dealy</h2>
            <span className="text-sm text-gray-500">{myDeals.length}</span>
          </div>
          {myDeals.length === 0 ? (
            <p className="text-sm text-gray-500">Nemáte přiřazené žádné dealy</p>
          ) : (
            <div className="space-y-3">
              {myDeals.slice(0, 8).map(deal => {
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

        {/* Blížící se deadliny */}
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

        {/* Hot prospects */}
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
          {hotProspects.length === 0 ? (
            <p className="text-sm text-gray-500">Žádné neoslovené high-priority prospekty</p>
          ) : (
            <div className="space-y-3">
              {hotProspects.slice(0, 8).map(prospect => (
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
      </div>

      {/* Nedávná aktivita */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Nedávná aktivita</h2>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500">Zatím žádná aktivita</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map(entry => {
              const actionLabel = ACTION_LABELS[entry.action] || entry.action
              const entityLabel = ENTITY_LABELS[entry.entity_type] || entry.entity_type
              const actionIcon = ACTION_ICONS[entry.action]
              return (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-500'}`}>
                      {actionIcon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{entry.user?.full_name || 'Systém'}</span>
                      <span className="text-sm text-gray-500">{actionLabel}</span>
                      <span className="text-sm text-gray-700 font-medium">{entityLabel}</span>
                    </div>
                    {Object.keys(entry.changes).length > 0 && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {Object.entries(entry.changes).slice(0, 2).map(([field, change]) => (
                          <span key={field} className="mr-3">
                            {field}: {String(change.old || '–')} → {String(change.new || '–')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                    {formatDateTime(entry.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const ACTION_LABELS: Record<string, string> = {
  create: 'vytvořil/a',
  update: 'upravil/a',
  delete: 'smazal/a',
  assign: 'přiřadil/a',
  stage_change: 'posunul/a',
  activate: 'aktivoval/a',
  deactivate: 'deaktivoval/a',
}

const ENTITY_LABELS: Record<string, string> = {
  deal: 'deal',
  prospect: 'prospekt',
  client: 'klienta',
  deal_item: 'položku dealu',
  deal_activity: 'aktivitu',
  technical_audit: 'audit',
  installation: 'instalaci',
  document: 'dokument',
  product: 'produkt',
  app_user: 'uživatele',
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  assign: 'bg-purple-100 text-purple-600',
  stage_change: 'bg-amber-100 text-amber-600',
  activate: 'bg-emerald-100 text-emerald-600',
  deactivate: 'bg-gray-100 text-gray-600',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <CheckCircle2 className="w-3.5 h-3.5" />,
  update: <Activity className="w-3.5 h-3.5" />,
  delete: <XCircle className="w-3.5 h-3.5" />,
  assign: <Users className="w-3.5 h-3.5" />,
  stage_change: <ArrowRight className="w-3.5 h-3.5" />,
  activate: <CheckCircle2 className="w-3.5 h-3.5" />,
  deactivate: <XCircle className="w-3.5 h-3.5" />,
}
