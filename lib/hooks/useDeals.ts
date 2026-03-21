'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { executeWorkflowRules } from '@/lib/hooks/useWorkflowEngine'
import type { Deal, DealStage } from '@/lib/supabase/types'

const DEAL_SELECT = '*, client:clients(*), prospect:prospects(id, company_name), assigned_user:app_users(*)'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeals = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('deals')
        .select(DEAL_SELECT)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setDeals(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání dealů')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDeal = useCallback(async (deal: Partial<Deal>) => {
    const supabase = createClient()
    try {
      const { data, error: createError } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single()

      if (createError) throw createError
      await fetchDeals()
      await logAuditEvent({
        action: 'create',
        entityType: 'deal',
        entityId: data.id,
        metadata: { title: data.title },
      })
      return { data: data as Deal, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při vytváření dealu' }
    }
  }, [fetchDeals])

  const updateDeal = useCallback(async (id: string, updates: Partial<Deal>) => {
    const supabase = createClient()
    try {
      const oldDeal = deals.find(d => d.id === id)
      const { data, error: updateError } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select(DEAL_SELECT)
        .single()

      if (updateError) throw updateError
      setDeals(prev => prev.map(d => d.id === id ? data : d))

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

      return { data: data as Deal, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci dealu' }
    }
  }, [deals, fetchDeals])

  const updateDealStage = useCallback(async (id: string, newStage: DealStage) => {
    return updateDeal(id, { stage: newStage })
  }, [updateDeal])

  const deleteDeal = useCallback(async (id: string) => {
    const supabase = createClient()
    try {
      const deleted = deals.find(d => d.id === id)
      const { error: deleteError } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setDeals(prev => prev.filter(d => d.id !== id))
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
  }, [deals])

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
  }, [fetchDeals])

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
