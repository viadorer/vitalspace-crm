import { NextRequest, NextResponse } from 'next/server'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { sendTemplateEmail } from '@/lib/email/brevo'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 min for bulk

const DAILY_LIMIT = 300
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * POST /api/email/bulk-send
 *
 * Body:
 *   template_name: string
 *   recipients: Array<{
 *     email: string
 *     name?: string
 *     variables?: Record<string, string>
 *     prospect_id?: string     // If sending to prospect → will convert to client + deal
 *     client_id?: string       // If sending to existing client
 *   }>
 *   convert_prospects?: boolean  // Auto-convert prospects to clients (default true)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireRole('superadmin', 'admin', 'consultant')
    if (authResult instanceof NextResponse) return authResult

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json({ error: 'BREVO_API_KEY není nakonfigurován' }, { status: 503 })
    }

    const body = await request.json()
    const { template_name, recipients, convert_prospects = true } = body

    if (!template_name || !recipients?.length) {
      return NextResponse.json({ error: 'Chybí template_name nebo recipients' }, { status: 400 })
    }

    const supabase = createServiceClient(SUPABASE_URL, SUPABASE_KEY)

    // Check daily limit
    const today = new Date().toISOString().slice(0, 10)
    const { count: sentToday } = await supabase
      .from('email_send_log')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', `${today}T00:00:00`)
      .lte('sent_at', `${today}T23:59:59`)

    const currentCount = sentToday || 0
    const remaining = DAILY_LIMIT - currentCount

    if (remaining <= 0) {
      return NextResponse.json({
        error: `Denní limit ${DAILY_LIMIT} emailů vyčerpán. Odesláno dnes: ${currentCount}.`,
        sent_today: currentCount,
        limit: DAILY_LIMIT,
      }, { status: 429 })
    }

    const toSend = recipients.slice(0, remaining)
    const results: Array<{ email: string; success: boolean; error?: string; messageId?: string }> = []

    for (const recipient of toSend) {
      if (!recipient.email) {
        results.push({ email: '(chybí)', success: false, error: 'Chybí email' })
        continue
      }

      try {
        // Send email
        const res = await sendTemplateEmail(
          recipient.email,
          recipient.name || '',
          template_name,
          recipient.variables || {}
        )

        // Log the send
        await supabase.from('email_send_log').insert({
          recipient_email: recipient.email,
          recipient_name: recipient.name,
          template_name,
          prospect_id: recipient.prospect_id || null,
          client_id: recipient.client_id || null,
          message_id: res.messageId,
        })

        // If prospect → convert to client + create deal
        if (recipient.prospect_id && convert_prospects) {
          await convertProspectToClientAndDeal(supabase, recipient.prospect_id)
        }

        // Log activity on client
        if (recipient.client_id) {
          await supabase.from('activities').insert({
            entity_type: 'client',
            entity_id: recipient.client_id,
            type: 'email',
            subject: `Hromadný email: ${template_name}`,
            body: `Email odeslán na ${recipient.email}`,
            is_completed: true,
          })
        }

        // Log activity on prospect
        if (recipient.prospect_id) {
          await supabase.from('activities').insert({
            entity_type: 'prospect',
            entity_id: recipient.prospect_id,
            type: 'email',
            subject: `Hromadný email: ${template_name}`,
            body: `Email odeslán na ${recipient.email}`,
            is_completed: true,
          })
        }

        results.push({ email: recipient.email, success: true, messageId: res.messageId })
      } catch (err: any) {
        results.push({ email: recipient.email, success: false, error: err.message })
      }

      // Small delay between sends to avoid rate limiting
      await new Promise(r => setTimeout(r, 200))
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      sent: successCount,
      errors: errorCount,
      skipped: recipients.length - toSend.length,
      sent_today: currentCount + successCount,
      limit: DAILY_LIMIT,
      remaining: remaining - successCount,
      results,
    })
  } catch (error) {
    return safeErrorResponse(error, 500)
  }
}

/**
 * GET /api/email/bulk-send
 * Returns daily send count and remaining limit.
 */
export async function GET() {
  try {
    const authResult = await requireRole('superadmin', 'admin', 'consultant')
    if (authResult instanceof NextResponse) return authResult

    const supabase = createServiceClient(SUPABASE_URL, SUPABASE_KEY)
    const today = new Date().toISOString().slice(0, 10)

    const { count } = await supabase
      .from('email_send_log')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', `${today}T00:00:00`)
      .lte('sent_at', `${today}T23:59:59`)

    const sentToday = count || 0

    return NextResponse.json({
      sent_today: sentToday,
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - sentToday),
    })
  } catch (error) {
    return safeErrorResponse(error, 500)
  }
}

async function convertProspectToClientAndDeal(supabase: any, prospectId: string) {
  // Get prospect data
  const { data: prospect } = await supabase
    .from('prospects')
    .select('*, prospect_contacts(*)')
    .eq('id', prospectId)
    .single()

  if (!prospect) return

  // Check if already converted
  if (prospect.converted_to_client_id) return

  // Create client
  const { data: client } = await supabase
    .from('clients')
    .insert({
      prospect_id: prospect.id,
      original_prospect_id: prospect.id,
      company_name: prospect.company_name,
      ico: prospect.ico,
      dic: prospect.dic,
      segment_id: prospect.segment_id,
      region: prospect.region,
      city: prospect.city,
      address: prospect.address,
      website: prospect.website,
      employees_count_est: prospect.employees_count_est,
      estimated_floor_area_m2: prospect.estimated_floor_area_m2,
      source: prospect.source,
      notes: prospect.notes,
      assigned_consultant: prospect.assigned_consultant,
      assigned_user_id: prospect.assigned_user_id,
      type: 'B2B',
      payment_terms_days: 14,
    })
    .select()
    .single()

  if (!client) return

  // Copy prospect contacts to client contacts
  if (prospect.prospect_contacts?.length) {
    for (const pc of prospect.prospect_contacts) {
      await supabase.from('client_contacts').insert({
        client_id: client.id,
        first_name: pc.first_name,
        last_name: pc.last_name,
        position: pc.position,
        email: pc.email,
        phone: pc.phone,
        is_primary: pc.is_decision_maker,
        is_decision_maker: pc.is_decision_maker,
      })
    }
  }

  // Update prospect
  await supabase
    .from('prospects')
    .update({
      status: 'contacted',
      converted_to_client_id: client.id,
    })
    .eq('id', prospectId)

  // Create deal
  const dealNum = `VS-2026-${String(Date.now()).slice(-4)}`
  await supabase.from('deals').insert({
    prospect_id: prospect.id,
    client_id: client.id,
    deal_number: dealNum,
    title: `Nabídka - ${prospect.company_name}`,
    stage: 'lead',
    assigned_consultant: prospect.assigned_consultant,
    assigned_user_id: prospect.assigned_user_id,
  })

  // Create touchpoint
  await supabase.from('touchpoints').insert({
    prospect_id: prospect.id,
    type: 'email',
    subject: 'Hromadný email - nabídka služeb',
    outcome: 'Email odeslán',
    next_action: 'Follow-up telefonát',
    next_action_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  })
}
