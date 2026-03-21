import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncContactFromRealvisor, syncLeadFromRealvisor } from '@/lib/realvisor/sync'
import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.REALVISOR_WEBHOOK_SECRET

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

/**
 * Verifies webhook authenticity using HMAC-SHA256 or Bearer token.
 * Supports:
 *   - x-webhook-signature header (HMAC-SHA256 of raw body)
 *   - x-webhook-secret / authorization header (direct secret comparison)
 */
function verifyWebhook(rawBody: string, request: Request): boolean {
  if (!WEBHOOK_SECRET) return false

  // Prefer HMAC signature verification
  const signature = request.headers.get('x-webhook-signature')
  if (signature) {
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex')
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expected, 'hex')
      )
    } catch {
      return false
    }
  }

  // Fallback: direct secret comparison (for simpler webhook providers)
  const authHeader = request.headers.get('x-webhook-secret') || request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(WEBHOOK_SECRET)
    )
  } catch {
    return false
  }
}

/**
 * POST /api/webhooks/realvisor
 *
 * Receives webhook from Realvisor Supabase Database Webhook
 * when contacts or leads table is updated.
 *
 * Payload format (Supabase database webhook):
 * {
 *   type: "INSERT" | "UPDATE" | "DELETE",
 *   table: "contacts" | "leads",
 *   record: { ... current row ... },
 *   old_record: { ... previous row (on UPDATE) ... },
 *   schema: "public"
 * }
 */
export async function POST(request: Request) {
  // Require webhook secret to be configured
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook service not configured' },
      { status: 503 }
    )
  }

  const rawBody = await request.text()

  // Verify webhook authenticity
  if (!verifyWebhook(rawBody, request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = JSON.parse(rawBody)
    const { type, table, record } = body

    if (!record || !table) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const db = getAdminClient()
    let results: string[] = []

    if (table === 'contacts' && (type === 'UPDATE' || type === 'INSERT')) {
      results = await syncContactFromRealvisor(db, {
        id: record.id,
        first_name: record.first_name,
        last_name: record.last_name,
        email: record.email,
        phone: record.phone,
        personal_email: record.personal_email,
        personal_phone: record.personal_phone,
        position: record.position,
        notes: record.notes,
        temperature: record.temperature,
        tags: record.tags,
        updated_at: record.updated_at,
      })
    } else if (table === 'leads' && (type === 'UPDATE' || type === 'INSERT')) {
      results = await syncLeadFromRealvisor(db, {
        id: record.id,
        contact_id: record.contact_id,
        status: record.status,
        lead_type: record.lead_type,
        expected_value: record.expected_value ? Number(record.expected_value) : null,
        notes: record.notes,
        current_stage_id: record.current_stage_id,
        assigned_to: record.assigned_to,
        updated_at: record.updated_at,
      })
    }

    return NextResponse.json({
      ok: true,
      table,
      type,
      synced: results.length,
      details: results,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Realvisor webhook error:', message)
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? message : 'Internal error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/realvisor
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'realvisor-webhook',
    configured: !!WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  })
}
