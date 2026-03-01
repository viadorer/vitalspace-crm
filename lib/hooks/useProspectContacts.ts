'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProspectContact } from '@/lib/supabase/types'

export function useProspectContacts(prospectId: string | null) {
  const [contacts, setContacts] = useState<ProspectContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prospectId) {
      setContacts([])
      setLoading(false)
      return
    }

    fetchContacts()
  }, [prospectId])

  async function fetchContacts() {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error: fetchError } = await supabase
        .from('prospect_contacts')
        .select('*')
        .eq('prospect_id', prospectId)
        .order('is_decision_maker', { ascending: false })
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError
      setContacts(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání kontaktů')
    } finally {
      setLoading(false)
    }
  }

  async function addContact(contact: Omit<ProspectContact, 'id' | 'created_at'>) {
    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('prospect_contacts')
        .insert(contact)
        .select()
        .single()

      if (insertError) throw insertError

      setContacts(prev => [...prev, data])
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Chyba při přidávání kontaktu')
    }
  }

  async function updateContact(id: string, updates: Partial<ProspectContact>) {
    try {
      const supabase = createClient()

      const { data, error: updateError } = await supabase
        .from('prospect_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      setContacts(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      throw err instanceof Error ? err : new Error('Chyba při aktualizaci kontaktu')
    }
  }

  async function deleteContact(id: string) {
    try {
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from('prospect_contacts')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Chyba při mazání kontaktu')
    }
  }

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    refresh: fetchContacts,
  }
}
