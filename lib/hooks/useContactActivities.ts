import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ContactActivity } from '@/lib/supabase/types'

export function useContactActivities(
  contactId: string | null,
  contactType: 'client_contact' | 'prospect_contact' | null
) {
  const [activities, setActivities] = useState<ContactActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contactId || !contactType) {
      setActivities([])
      setLoading(false)
      return
    }

    loadActivities()
  }, [contactId, contactType])

  async function loadActivities() {
    if (!contactId || !contactType) return

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('contact_activities')
      .select('*')
      .eq('contact_id', contactId)
      .eq('contact_type', contactType)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading contact activities:', error)
    } else {
      setActivities(data || [])
    }
    setLoading(false)
  }

  async function addActivity(activity: Omit<ContactActivity, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()
    
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id || null

    const { data, error } = await supabase
      .from('contact_activities')
      .insert({
        ...activity,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding contact activity:', error)
      throw error
    }

    await loadActivities()
    return data
  }

  async function updateActivity(id: string, updates: Partial<ContactActivity>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('contact_activities')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating contact activity:', error)
      throw error
    }

    await loadActivities()
  }

  async function deleteActivity(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('contact_activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact activity:', error)
      throw error
    }

    await loadActivities()
  }

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    deleteActivity,
    refresh: loadActivities,
  }
}
