import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendCrmNotification } from '@/lib/email/brevo'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/cron/workflows
 *
 * Cron-triggered endpoint that processes inactivity-based workflow rules.
 * Should be called via Vercel Cron (vercel.json) or external cron service.
 *
 * Auth: CRON_SECRET header must match env var.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  // Use service role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch active inactivity rules
  const { data: rules, error: rulesError } = await supabase
    .from('workflow_rules')
    .select('*')
    .eq('trigger_type', 'inactivity')
    .eq('is_active', true)
    .order('sort_order')

  if (rulesError || !rules?.length) {
    return NextResponse.json({ processed: 0, message: 'No inactivity rules' })
  }

  let totalProcessed = 0
  const results: { rule: string; matched: number; actions: number }[] = []

  for (const rule of rules) {
    if (!rule.inactivity_days || rule.inactivity_days <= 0) continue

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - rule.inactivity_days)

    // Find prospects/deals matching this inactivity rule
    if (rule.trigger_stage === 'not_contacted') {
      // Prospect-based: prospects with status 'not_contacted' that haven't been touched
      const { data: prospects } = await supabase
        .from('prospects')
        .select('id, company_name, callcenter_status')
        .eq('status', 'not_contacted')
        .is('callcenter_status', null)
        .lt('updated_at', cutoffDate.toISOString())
        .limit(50)

      if (prospects?.length) {
        // Auto-assign to callcenter queue
        const ids = prospects.map(p => p.id)
        await supabase
          .from('prospects')
          .update({
            callcenter_status: 'queued',
            callcenter_assigned_at: new Date().toISOString(),
          })
          .in('id', ids)

        // Create activities for each
        if (rule.create_activity && rule.activity_subject) {
          const activities = prospects.map(p => ({
            entity_type: 'prospect',
            entity_id: p.id,
            type: rule.activity_type || 'task',
            subject: rule.activity_subject,
            due_date: new Date().toISOString().split('T')[0],
          }))
          await supabase.from('activities').insert(activities)
        }

        results.push({
          rule: rule.activity_subject || rule.trigger_stage,
          matched: prospects.length,
          actions: prospects.length,
        })
        totalProcessed += prospects.length
      }
    } else {
      // Deal-based: deals in the specified stage without recent activity
      const { data: deals } = await supabase
        .from('deals')
        .select('id, title, deal_number, assigned_user_id, stage')
        .eq('stage', rule.trigger_stage)
        .lt('updated_at', cutoffDate.toISOString())
        .limit(50)

      if (!deals?.length) continue

      let actionsCount = 0

      for (const deal of deals) {
        // Check if we already created this activity recently (prevent duplicates)
        const { data: existingActivity } = await supabase
          .from('activities')
          .select('id')
          .eq('entity_type', 'deal')
          .eq('entity_id', deal.id)
          .eq('subject', rule.activity_subject)
          .gte('created_at', cutoffDate.toISOString())
          .limit(1)

        if (existingActivity?.length) continue

        // Create activity
        if (rule.create_activity && rule.activity_subject) {
          const dueDate = rule.activity_due_days
            ? new Date(Date.now() + rule.activity_due_days * 86400000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]

          await supabase.from('activities').insert({
            entity_type: 'deal',
            entity_id: deal.id,
            type: rule.activity_type || 'task',
            subject: rule.activity_subject,
            due_date: dueDate,
          })
        }

        // Send email notification
        if (rule.send_email && rule.email_subject && deal.assigned_user_id) {
          try {
            const { data: user } = await supabase
              .from('app_users')
              .select('email, full_name')
              .eq('id', deal.assigned_user_id)
              .single()

            if (user?.email) {
              await sendCrmNotification(
                user.email,
                user.full_name || '',
                rule.email_subject,
                `<p>Deal <strong>${deal.deal_number || deal.title}</strong> je ve fázi
                 <em>${deal.stage}</em> bez aktivity ${rule.inactivity_days} dní.</p>
                 <p>${rule.activity_subject || ''}</p>
                 <p><a href="https://vitalspace-crm.vercel.app/crm/pipeline" style="color:#059669;">Otevřít v CRM →</a></p>`
              )
            }
          } catch (emailErr) {
            console.error('Cron email error:', emailErr)
          }
        }

        // Touch the deal to prevent re-triggering
        await supabase
          .from('deals')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', deal.id)

        actionsCount++
      }

      results.push({
        rule: rule.activity_subject || rule.trigger_stage,
        matched: deals.length,
        actions: actionsCount,
      })
      totalProcessed += actionsCount
    }
  }

  return NextResponse.json({
    processed: totalProcessed,
    rules: results,
    timestamp: new Date().toISOString(),
  })
}
