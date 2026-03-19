'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Prospect } from '@/lib/supabase/types'

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function fetchProspects() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('prospects')
        .select(`
          *,
          company_segments(*),
          prospect_contacts(
            id,
            first_name,
            last_name,
            position,
            email,
            phone,
            is_decision_maker
          ),
          converted_client:clients!prospects_converted_to_client_id_fkey(
            id,
            company_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProspects(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání prospektů')
    } finally {
      setLoading(false)
    }
  }

  async function createProspect(prospect: Partial<Prospect>) {
    try {
      // Convert empty strings to null for UUID/nullable fields
      const cleaned = { ...prospect } as any
      if (cleaned.segment_id === '') cleaned.segment_id = null
      if (cleaned.assigned_user_id === '') cleaned.assigned_user_id = null
      const { data, error } = await supabase
        .from('prospects')
        .insert([cleaned])
        .select()
        .single()

      if (error) throw error
      setProspects([data, ...prospects])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při vytváření prospectu' }
    }
  }

  async function updateProspect(id: string, updates: Partial<Prospect>) {
    try {
      const cleaned = { ...updates } as any
      if (cleaned.segment_id === '') cleaned.segment_id = null
      if (cleaned.assigned_user_id === '') cleaned.assigned_user_id = null
      const { data, error } = await supabase
        .from('prospects')
        .update(cleaned)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProspects(prospects.map(p => p.id === id ? data : p))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci prospectu' }
    }
  }

  async function deleteProspect(id: string) {
    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProspects(prospects.filter(p => p.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Chyba při mazání prospectu' }
    }
  }

  useEffect(() => {
    fetchProspects()
  }, [])

  return {
    prospects,
    loading,
    error,
    createProspect,
    updateProspect,
    deleteProspect,
    refetch: fetchProspects,
  }
}
