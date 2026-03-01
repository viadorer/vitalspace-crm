'use client'

import { createClient } from '@/lib/supabase/client'
import { logAuditEvent, logAssignment } from '@/lib/hooks/useAuditLog'
import type { WorkflowRule, AppUser, DealStage } from '@/lib/supabase/types'

interface WorkflowContext {
  dealId: string
  newStage: DealStage
  currentAssignedUserId: string | null
}

export async function executeWorkflowRules(ctx: WorkflowContext): Promise<void> {
  const supabase = createClient()

  const { data: rules } = await supabase
    .from('workflow_rules')
    .select('*')
    .eq('trigger_stage', ctx.newStage)
    .eq('is_active', true)
    .order('sort_order')

  if (!rules || rules.length === 0) return

  for (const rule of rules as WorkflowRule[]) {
    if (rule.assign_to_role) {
      await handleAssignment(supabase, rule, ctx)
    }

    if (rule.create_activity && rule.activity_subject) {
      await handleCreateActivity(supabase, rule, ctx)
    }
  }
}

async function handleAssignment(
  supabase: ReturnType<typeof createClient>,
  rule: WorkflowRule,
  ctx: WorkflowContext
): Promise<void> {
  let targetUserId: string | null = null

  switch (rule.assign_strategy) {
    case 'keep_current':
      return

    case 'return_original': {
      const { data: history } = await supabase
        .from('assignment_history')
        .select('from_user_id')
        .eq('entity_type', 'deal')
        .eq('entity_id', ctx.dealId)
        .order('created_at', { ascending: true })
        .limit(1)

      if (history && history.length > 0 && history[0].from_user_id) {
        targetUserId = history[0].from_user_id
      } else {
        targetUserId = await roundRobinAssign(supabase, rule.assign_to_role!)
      }
      break
    }

    case 'round_robin': {
      targetUserId = await roundRobinAssign(supabase, rule.assign_to_role!)
      break
    }
  }

  if (!targetUserId || targetUserId === ctx.currentAssignedUserId) return

  await supabase
    .from('deals')
    .update({ assigned_user_id: targetUserId })
    .eq('id', ctx.dealId)

  await logAssignment({
    entityType: 'deal',
    entityId: ctx.dealId,
    fromUserId: ctx.currentAssignedUserId,
    toUserId: targetUserId,
    reason: `Automatické přiřazení – stage: ${ctx.newStage}`,
  })
}

async function roundRobinAssign(
  supabase: ReturnType<typeof createClient>,
  role: string
): Promise<string | null> {
  const { data: users } = await supabase
    .from('app_users')
    .select('id')
    .eq('role', role)
    .eq('is_active', true)
    .order('full_name')

  if (!users || users.length === 0) return null

  const { data: lastAssigned } = await supabase
    .from('assignment_history')
    .select('to_user_id')
    .order('created_at', { ascending: false })
    .limit(1)

  const lastUserId = lastAssigned?.[0]?.to_user_id
  const userIds = users.map(u => u.id)

  if (!lastUserId || !userIds.includes(lastUserId)) {
    return userIds[0]
  }

  const lastIndex = userIds.indexOf(lastUserId)
  return userIds[(lastIndex + 1) % userIds.length]
}

async function handleCreateActivity(
  supabase: ReturnType<typeof createClient>,
  rule: WorkflowRule,
  ctx: WorkflowContext
): Promise<void> {
  const dueDate = rule.activity_due_days
    ? new Date(Date.now() + rule.activity_due_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    : null

  const { data: created } = await supabase
    .from('deal_activities')
    .insert({
      deal_id: ctx.dealId,
      type: rule.activity_type || 'task',
      subject: rule.activity_subject,
      due_date: dueDate,
    })
    .select()
    .single()

  if (created) {
    await logAuditEvent({
      action: 'create',
      entityType: 'deal_activity',
      entityId: created.id,
      metadata: {
        deal_id: ctx.dealId,
        auto_workflow: true,
        trigger_stage: ctx.newStage,
        subject: rule.activity_subject,
      },
    })
  }
}
