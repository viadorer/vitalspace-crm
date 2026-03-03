import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import type { Activity, ActivityEntityType, ActivityType } from '@/lib/supabase/types'

interface UseActivitiesOptions {
  entityType: ActivityEntityType
  entityId: string | null
}

interface NewActivityInput {
  type: ActivityType
  subject: string
  body?: string
  due_date?: string
  assigned_to?: string
}

async function resolveRelatedEntityIds(
  entityType: ActivityEntityType,
  entityId: string
): Promise<string[]> {
  const supabase = createClient()
  const ids = new Set<string>([entityId])

  if (entityType === 'prospect') {
    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('prospect_id', entityId)
    clients?.forEach((c) => ids.add(c.id))

    const { data: deals } = await supabase
      .from('deals')
      .select('id')
      .eq('prospect_id', entityId)
    deals?.forEach((d) => ids.add(d.id))
  }

  if (entityType === 'client') {
    const { data: client } = await supabase
      .from('clients')
      .select('prospect_id')
      .eq('id', entityId)
      .single()
    if (client?.prospect_id) ids.add(client.prospect_id)

    const { data: deals } = await supabase
      .from('deals')
      .select('id')
      .eq('client_id', entityId)
    deals?.forEach((d) => ids.add(d.id))
  }

  if (entityType === 'deal') {
    const { data: deal } = await supabase
      .from('deals')
      .select('client_id, prospect_id')
      .eq('id', entityId)
      .single()
    if (deal?.client_id) ids.add(deal.client_id)
    if (deal?.prospect_id) ids.add(deal.prospect_id)
  }

  return Array.from(ids)
}

export function useActivities({ entityType, entityId }: UseActivitiesOptions) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!entityId) {
      setActivities([])
      setLoading(false)
      return
    }

    loadActivities()
  }, [entityType, entityId])

  async function loadActivities() {
    if (!entityId) return

    setLoading(true)
    const supabase = createClient()

    const allIds = await resolveRelatedEntityIds(entityType, entityId)

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .in('entity_id', allIds)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading activities:', error)
    } else {
      setActivities((data || []) as Activity[])
    }
    setLoading(false)
  }

  async function addActivity(input: NewActivityInput): Promise<Activity | null> {
    if (!entityId) return null

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id || null

    const { data, error } = await supabase
      .from('activities')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        type: input.type,
        subject: input.subject,
        body: input.body || null,
        due_date: input.due_date || null,
        assigned_to: input.assigned_to || null,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding activity:', error)
      throw error
    }

    const activity = data as Activity

    await logAuditEvent({
      action: 'create',
      entityType: entityType === 'deal' ? 'deal_activity' : 'prospect_activity',
      entityId: activity.id,
      metadata: {
        parent_entity_type: entityType,
        parent_entity_id: entityId,
        type: input.type,
        subject: input.subject,
      },
    })

    await loadActivities()
    return activity
  }

  async function updateActivity(id: string, updates: Partial<Pick<Activity, 'subject' | 'body' | 'type' | 'is_completed' | 'due_date' | 'assigned_to'>>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating activity:', error)
      throw error
    }

    await loadActivities()
  }

  async function toggleComplete(id: string, currentState: boolean) {
    await updateActivity(id, { is_completed: !currentState })
  }

  async function deleteActivity(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting activity:', error)
      throw error
    }

    await loadActivities()
  }

  return {
    activities,
    loading,
    addActivity,
    updateActivity,
    toggleComplete,
    deleteActivity,
    refresh: loadActivities,
  }
}
