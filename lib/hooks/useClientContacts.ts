'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClientContact } from '@/lib/supabase/types'

export function useClientContacts(clientId: string | null) {
  const [contacts, setContacts] = useState<ClientContact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) {
      setContacts([])
      setLoading(false)
      return
    }

    fetchContacts()
  }, [clientId])

  async function fetchContacts() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error: fetchError } = await supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })
        .order('is_decision_maker', { ascending: false })

      if (fetchError) throw fetchError
      setContacts(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání kontaktů')
    } finally {
      setLoading(false)
    }
  }

  async function addContact(contact: Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const supabase = createClient()
      
      const { data, error: insertError } = await supabase
        .from('client_contacts')
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

  async function updateContact(id: string, updates: Partial<ClientContact>) {
    try {
      const supabase = createClient()
      
      const { data, error: updateError } = await supabase
        .from('client_contacts')
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
        .from('client_contacts')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      setContacts(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Chyba při mazání kontaktu')
    }
  }

  async function setPrimaryContact(id: string) {
    try {
      const supabase = createClient()
      
      await supabase
        .from('client_contacts')
        .update({ is_primary: false })
        .eq('client_id', clientId)

      await supabase
        .from('client_contacts')
        .update({ is_primary: true })
        .eq('id', id)

      await fetchContacts()
    } catch (err) {
      throw err instanceof Error ? err : new Error('Chyba při nastavování primárního kontaktu')
    }
  }

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    setPrimaryContact,
    refresh: fetchContacts
  }
}
