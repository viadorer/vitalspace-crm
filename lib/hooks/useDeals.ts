'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { executeWorkflowRules } from '@/lib/hooks/useWorkflowEngine'
import type { Deal, DealStage } from '@/lib/supabase/types'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchDeals() {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deals')
        .select('*, client:clients(*), prospect:prospects(id, company_name), assigned_user:app_users(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeals(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání dealů')
    } finally {
      setLoading(false)
    }
  }

  async function createDeal(deal: Partial<Deal>) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single()

      if (error) throw error
      setDeals([data, ...deals])
      await logAuditEvent({
        action: 'create',
        entityType: 'deal',
        entityId: data.id,
        metadata: { title: data.title },
      })
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při vytváření dealu' }
    }
  }

  async function updateDeal(id: string, updates: Partial<Deal>) {
    const supabase = createClient()
    try {
      const oldDeal = deals.find(d => d.id === id)
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select('*, client:clients(*), prospect:prospects(id, company_name), assigned_user:app_users(*)')
        .single()

      if (error) throw error
      setDeals(deals.map(d => d.id === id ? data : d))

      const changes: Record<string, { old: unknown; new: unknown }> = {}
      for (const key of Object.keys(updates) as (keyof typeof updates)[]) {
        if (oldDeal && oldDeal[key] !== updates[key]) {
          changes[key] = { old: oldDeal[key], new: updates[key] }
        }
      }
      const isStageChange = oldDeal?.stage !== updates.stage && updates.stage
      await logAuditEvent({
        action: isStageChange ? 'stage_change' : 'update',
        entityType: 'deal',
        entityId: id,
        changes,
      })

      if (isStageChange) {
        await executeWorkflowRules({
          dealId: id,
          newStage: updates.stage as DealStage,
          currentAssignedUserId: oldDeal?.assigned_user_id || null,
        })
        await fetchDeals()
      }

      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci dealu' }
    }
  }

  async function updateDealStage(id: string, newStage: DealStage) {
    return updateDeal(id, { stage: newStage })
  }

  async function deleteDeal(id: string) {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (error) throw error
      const deleted = deals.find(d => d.id === id)
      setDeals(deals.filter(d => d.id !== id))
      await logAuditEvent({
        action: 'delete',
        entityType: 'deal',
        entityId: id,
        metadata: { title: deleted?.title },
      })
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Chyba při mazání dealu' }
    }
  }

  useEffect(() => {
    fetchDeals()

    const supabase = createClient()
    const channel = supabase
      .channel('deals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'deals' },
        () => {
          fetchDeals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    deals,
    loading,
    error,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    refetch: fetchDeals,
  }
}
