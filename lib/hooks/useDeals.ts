'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Deal, DealStage } from '@/lib/supabase/types'

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchDeals() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('deals')
        .select('*, client:clients(*)')
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
    try {
      const { data, error } = await supabase
        .from('deals')
        .insert([deal])
        .select()
        .single()

      if (error) throw error
      setDeals([data, ...deals])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při vytváření dealu' }
    }
  }

  async function updateDeal(id: string, updates: Partial<Deal>) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setDeals(deals.map(d => d.id === id ? data : d))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci dealu' }
    }
  }

  async function updateDealStage(id: string, newStage: DealStage) {
    return updateDeal(id, { stage: newStage })
  }

  async function deleteDeal(id: string) {
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setDeals(deals.filter(d => d.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Chyba při mazání dealu' }
    }
  }

  useEffect(() => {
    fetchDeals()

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
