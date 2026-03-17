'use client'

import { createClient } from '@/lib/supabase/client'
import { logAuditEvent, logAssignment } from '@/lib/hooks/useAuditLog'
import type { WorkflowRule, DealStage } from '@/lib/supabase/types'

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
    .eq('trigger_type', 'stage_change')
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

    if (rule.send_email && rule.email_subject) {
      await handleSendEmail(rule, ctx)
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
    .from('activities')
    .insert({
      entity_type: 'deal',
      entity_id: ctx.dealId,
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

async function handleSendEmail(
  rule: WorkflowRule,
  ctx: WorkflowContext
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: deal } = await supabase
      .from('deals')
      .select(`
        id, title, deal_number, stage, assigned_user_id,
        clients:client_id (company_name, email),
        prospects:prospect_id (company_name, email)
      `)
      .eq('id', ctx.dealId)
      .single()

    if (!deal) return

    let recipientEmail: string | null = null
    let recipientName = ''

    if (deal.assigned_user_id) {
      const { data: user } = await supabase
        .from('app_users')
        .select('email, full_name')
        .eq('id', deal.assigned_user_id)
        .single()

      if (user) {
        recipientEmail = user.email
        recipientName = user.full_name || ''
      }
    }

    if (!recipientEmail) return

    const clients = deal.clients as unknown as { company_name: string }[] | null
    const prospects = deal.prospects as unknown as { company_name: string }[] | null
    const companyName = clients?.[0]?.company_name
      || prospects?.[0]?.company_name
      || 'Neznámá firma'

    await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'custom',
        to_email: recipientEmail,
        to_name: recipientName,
        subject: rule.email_subject || `Workflow: ${rule.activity_subject}`,
        html_body: rule.email_body_html || buildDefaultEmailBody(rule, deal, companyName),
      }),
    })
  } catch (err) {
    console.error('Workflow email error:', err)
  }
}

function buildDefaultEmailBody(
  rule: WorkflowRule,
  deal: { title: string; deal_number: string | null },
  companyName: string
): string {
  return `
    <p>Dobrý den,</p>
    <p>automatický workflow vytvořil novou úlohu:</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Deal:</td><td style="padding: 4px 0; font-weight: 600;">${deal.deal_number || deal.title}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Firma:</td><td style="padding: 4px 0;">${companyName}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Úloha:</td><td style="padding: 4px 0;">${rule.activity_subject || '—'}</td></tr>
      <tr><td style="padding: 4px 12px 4px 0; color: #6b7280;">Termín:</td><td style="padding: 4px 0;">${rule.activity_due_days ? `${rule.activity_due_days} dní` : 'Ihned'}</td></tr>
    </table>
    <p><a href="https://vitalspace-crm.vercel.app/crm/pipeline" style="color: #059669;">Otevřít v CRM →</a></p>
  `
}
