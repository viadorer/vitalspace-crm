'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Client } from '@/lib/supabase/types'

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchClients() {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          company_segments(*),
          client_contacts(
            id,
            first_name,
            last_name,
            position,
            email,
            phone,
            mobile,
            is_primary,
            is_decision_maker
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání klientů')
    } finally {
      setLoading(false)
    }
  }

  async function addClient(client: Partial<Client>) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single()

      if (error) throw error
      await fetchClients()
      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Chyba při vytváření klienta' 
      }
    }
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchClients()
      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Chyba při aktualizaci klienta' 
      }
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient: addClient,
    updateClient,
  }
}
