import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProspectActivity } from '@/lib/supabase/types'

export function useProspectActivities(prospectId: string | null) {
  const [activities, setActivities] = useState<ProspectActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!prospectId) {
      setActivities([])
      setLoading(false)
      return
    }

    loadActivities()
  }, [prospectId])

  async function loadActivities() {
    if (!prospectId) return

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('prospect_activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading prospect activities:', error)
    } else {
      setActivities(data || [])
    }
    setLoading(false)
  }

  async function addActivity(activity: Omit<ProspectActivity, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createClient()
    
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id || null

    const { data, error } = await supabase
      .from('prospect_activities')
      .insert({
        ...activity,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding prospect activity:', error)
      throw error
    }

    await loadActivities()
    return data
  }

  async function updateActivity(id: string, updates: Partial<ProspectActivity>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('prospect_activities')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating prospect activity:', error)
      throw error
    }

    await loadActivities()
  }

  async function deleteActivity(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('prospect_activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting prospect activity:', error)
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
