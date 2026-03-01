'use client'

import { createClient } from '@/lib/supabase/client'
import type { AuditAction, AuditEntityType, AuditLogEntry } from '@/lib/supabase/types'

interface LogParams {
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  changes?: Record<string, { old: unknown; new: unknown }>
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(params: LogParams): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('audit_log').insert({
    user_id: user?.id || null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    changes: params.changes || {},
    metadata: params.metadata || {},
  })
}

export async function logAssignment(params: {
  entityType: 'deal' | 'prospect' | 'client'
  entityId: string
  fromUserId: string | null
  toUserId: string | null
  reason?: string
}): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('assignment_history').insert({
    entity_type: params.entityType,
    entity_id: params.entityId,
    from_user_id: params.fromUserId,
    to_user_id: params.toUserId,
    reason: params.reason || null,
    created_by: user?.id || null,
  })

  await logAuditEvent({
    action: 'assign',
    entityType: params.entityType,
    entityId: params.entityId,
    changes: {
      assigned_user_id: { old: params.fromUserId, new: params.toUserId },
    },
    metadata: { reason: params.reason },
  })
}

export async function fetchAuditLog(
  entityType: AuditEntityType,
  entityId: string
): Promise<AuditLogEntry[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('audit_log')
    .select('*, user:app_users(*)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data || []) as AuditLogEntry[]
}
