/**
 * Bidirectional sync between VitalSpace CRM and Realvisor.
 *
 * Realvisor Supabase: fswvswtihoaouimziuxg.supabase.co
 * Realvisor API: https://api-production-88cf.up.railway.app
 * Realvisor tenant: 11111111-1111-1111-1111-111111111111
 * Realvisor project "Vitalspace.cz": 6cb6883d-af50-4c3f-bae7-dfd4332d3e8a
 * Realvisor pipeline: 3bb184d9-0d57-415f-8a66-9dbfe222a06f
 * Realvisor "Kontaktován" stage: 897cc4b2-f802-4fd5-b824-9058e6d34622
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// ── Constants ──

const REALVISOR_SUPABASE_URL = 'https://fswvswtihoaouimziuxg.supabase.co'
const REALVISOR_SERVICE_KEY = process.env.REALVISOR_SERVICE_ROLE_KEY || ''
const REALVISOR_TENANT_ID = '11111111-1111-1111-1111-111111111111'
const REALVISOR_PROJECT_ID = '6cb6883d-af50-4c3f-bae7-dfd4332d3e8a'
const REALVISOR_PIPELINE_ID = '3bb184d9-0d57-415f-8a66-9dbfe222a06f'
const REALVISOR_STAGE_CONTACTED = '897cc4b2-f802-4fd5-b824-9058e6d34622'

function getRealvisorClient(): SupabaseClient {
  return createSupabaseClient(REALVISOR_SUPABASE_URL, REALVISOR_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ── Realvisor → VitalSpace CRM ──

interface RealvisorContactChange {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  personal_email?: string | null
  personal_phone?: string | null
  position?: string | null
  notes?: string | null
  temperature?: string | null
  tags?: string[]
  updated_at: string
}

interface RealvisorLeadChange {
  id: string
  contact_id: string
  status: string
  lead_type?: string
  expected_value?: number | null
  notes?: string | null
  current_stage_id?: string
  assigned_to?: string | null
  updated_at: string
}

/**
 * Process a contact change from Realvisor → update matching records in VitalSpace CRM
 */
export async function syncContactFromRealvisor(
  localDb: SupabaseClient,
  change: RealvisorContactChange
) {
  const results: string[] = []

  // Find prospect_contacts with this realvisor_contact_id
  const { data: prospectContacts } = await localDb
    .from('prospect_contacts')
    .select('id, prospect_id')
    .eq('realvisor_contact_id', change.id)

  if (prospectContacts && prospectContacts.length > 0) {
    for (const pc of prospectContacts) {
      const updateData: Record<string, any> = {}
      if (change.first_name !== undefined) updateData.first_name = change.first_name
      if (change.last_name !== undefined) updateData.last_name = change.last_name
      if (change.email !== undefined) updateData.email = change.email
      if (change.phone !== undefined) updateData.phone = change.phone
      if (change.position !== undefined) updateData.position = change.position

      if (Object.keys(updateData).length > 0) {
        await localDb
          .from('prospect_contacts')
          .update(updateData)
          .eq('id', pc.id)
        results.push(`prospect_contact:${pc.id}`)
      }
    }
  }

  // Find client_contacts with this realvisor_contact_id
  const { data: clientContacts } = await localDb
    .from('client_contacts')
    .select('id, client_id')
    .eq('realvisor_contact_id', change.id)

  if (clientContacts && clientContacts.length > 0) {
    for (const cc of clientContacts) {
      const updateData: Record<string, any> = {}
      if (change.first_name !== undefined) updateData.first_name = change.first_name
      if (change.last_name !== undefined) updateData.last_name = change.last_name
      if (change.email !== undefined) updateData.email = change.email
      if (change.phone !== undefined) updateData.phone = change.phone
      if (change.position !== undefined) updateData.position = change.position

      if (Object.keys(updateData).length > 0) {
        await localDb
          .from('client_contacts')
          .update(updateData)
          .eq('id', cc.id)
        results.push(`client_contact:${cc.id}`)
      }
    }
  }

  // Log sync
  await localDb.from('realvisor_sync_log').insert({
    direction: 'from_realvisor',
    entity_type: 'contact',
    realvisor_id: change.id,
    action: 'update',
    payload: { updated_fields: Object.keys(change), affected: results },
  })

  return results
}

/**
 * Process a lead change from Realvisor → update matching deal in VitalSpace CRM
 */
export async function syncLeadFromRealvisor(
  localDb: SupabaseClient,
  change: RealvisorLeadChange
) {
  const results: string[] = []

  // Find deals with this realvisor_lead_id
  const { data: deals } = await localDb
    .from('deals')
    .select('id, client_id')
    .eq('realvisor_lead_id', change.id)

  if (deals && deals.length > 0) {
    for (const deal of deals) {
      const updateData: Record<string, any> = {}

      // Map Realvisor status → VitalSpace deal stage
      if (change.status === 'won') updateData.stage = 'closed_won'
      else if (change.status === 'lost') updateData.stage = 'closed_lost'

      if (change.expected_value !== undefined) updateData.value = change.expected_value
      if (change.notes !== undefined) updateData.notes = change.notes

      if (Object.keys(updateData).length > 0) {
        await localDb
          .from('deals')
          .update(updateData)
          .eq('id', deal.id)
        results.push(`deal:${deal.id}`)
      }
    }
  }

  // Log sync
  await localDb.from('realvisor_sync_log').insert({
    direction: 'from_realvisor',
    entity_type: 'lead',
    realvisor_id: change.id,
    action: 'update',
    payload: { status: change.status, affected: results },
  })

  return results
}

// ── VitalSpace CRM → Realvisor ──

/**
 * Push a prospect contact change to Realvisor
 */
export async function syncContactToRealvisor(
  localDb: SupabaseClient,
  contactData: {
    realvisor_contact_id: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    position?: string
    notes?: string
  }
) {
  const rv = getRealvisorClient()
  const now = new Date().toISOString()

  const updateData: Record<string, any> = { updated_at: now }
  if (contactData.first_name !== undefined) updateData.first_name = contactData.first_name
  if (contactData.last_name !== undefined) updateData.last_name = contactData.last_name
  if (contactData.email !== undefined) updateData.email = contactData.email
  if (contactData.phone !== undefined) updateData.phone = contactData.phone
  if (contactData.position !== undefined) updateData.position = contactData.position
  if (contactData.notes !== undefined) updateData.notes = contactData.notes

  const { error } = await rv
    .from('contacts')
    .update(updateData)
    .eq('id', contactData.realvisor_contact_id)
    .eq('tenant_id', REALVISOR_TENANT_ID)

  // Log
  await localDb.from('realvisor_sync_log').insert({
    direction: 'to_realvisor',
    entity_type: 'contact',
    realvisor_id: contactData.realvisor_contact_id,
    action: 'update',
    payload: { error: error?.message || null, fields: Object.keys(updateData) },
  })

  return { success: !error, error: error?.message }
}

/**
 * Push a deal status change to Realvisor lead
 */
export async function syncDealToRealvisor(
  localDb: SupabaseClient,
  dealData: {
    realvisor_lead_id: string
    stage?: string
    value?: number
    notes?: string
  }
) {
  const rv = getRealvisorClient()
  const now = new Date().toISOString()

  const updateData: Record<string, any> = { updated_at: now }

  // Map VitalSpace stage → Realvisor status
  if (dealData.stage === 'closed_won') updateData.status = 'won'
  else if (dealData.stage === 'closed_lost') updateData.status = 'lost'

  if (dealData.value !== undefined) updateData.expected_value = dealData.value
  if (dealData.notes !== undefined) updateData.notes = dealData.notes

  const { error } = await rv
    .from('leads')
    .update(updateData)
    .eq('id', dealData.realvisor_lead_id)
    .eq('tenant_id', REALVISOR_TENANT_ID)

  await localDb.from('realvisor_sync_log').insert({
    direction: 'to_realvisor',
    entity_type: 'lead',
    realvisor_id: dealData.realvisor_lead_id,
    action: 'update',
    payload: { error: error?.message || null, fields: Object.keys(updateData) },
  })

  return { success: !error, error: error?.message }
}

/**
 * Create a new contact + lead in Realvisor from a VitalSpace prospect
 */
export async function createInRealvisor(data: {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  company_name: string
  notes?: string
}) {
  const rv = getRealvisorClient()
  const now = new Date().toISOString()

  // 1. Create contact
  const { data: contact, error: contactErr } = await rv
    .from('contacts')
    .insert({
      id: crypto.randomUUID(),
      tenant_id: REALVISOR_TENANT_ID,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      phone: data.phone || null,
      primary_project_id: REALVISOR_PROJECT_ID,
      tags: ['vitalspace-crm'],
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (contactErr) {
    return { success: false, error: contactErr.message, contact_id: null, lead_id: null }
  }

  // 2. Create lead
  const { data: lead, error: leadErr } = await rv
    .from('leads')
    .insert({
      id: crypto.randomUUID(),
      tenant_id: REALVISOR_TENANT_ID,
      project_id: REALVISOR_PROJECT_ID,
      contact_id: contact.id,
      pipeline_id: REALVISOR_PIPELINE_ID,
      current_stage_id: REALVISOR_STAGE_CONTACTED,
      lead_type: 'other',
      status: 'open',
      notes: data.notes || `${data.company_name} – synced from VitalSpace CRM`,
      source_payload: { source: 'vitalspace-crm', company: data.company_name },
      created_at: now,
      updated_at: now,
    })
    .select('id')
    .single()

  if (leadErr) {
    return { success: false, error: leadErr.message, contact_id: contact.id, lead_id: null }
  }

  return { success: true, contact_id: contact.id, lead_id: lead.id }
}
