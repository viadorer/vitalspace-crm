'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Deal, Prospect, AuditLogEntry } from '@/lib/supabase/types'

export interface MonthlyRevenueRow {
  month: string
  deals_closed: number
  revenue_czk: number
  avg_deal_czk: number
}

export interface DashboardData {
  deals: Deal[]
  prospects: Prospect[]
  recentActivity: AuditLogEntry[]
  monthlyRevenue: MonthlyRevenueRow[]
}

async function fetchDashboardData(): Promise<DashboardData> {
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

  return {
    deals: (deals || []) as Deal[],
    prospects: (prospects || []) as Prospect[],
    recentActivity: (recentActivity || []) as AuditLogEntry[],
    monthlyRevenue: (monthlyRevenue || []) as MonthlyRevenueRow[],
  }
}

export function useDashboardData() {
  const { data, isLoading } = useSWR<DashboardData>(
    'dashboard',
    fetchDashboardData,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  )

  return { data: data ?? null, loading: isLoading }
}
