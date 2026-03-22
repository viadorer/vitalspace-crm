/**
 * Lead Scoring Engine
 *
 * Automaticky vypočítává skóre prospektu na základě:
 * 1. Segment potenciál (20b) — jak hodnotný je segment (avg deal value)
 * 2. Priorita (20b) — uživatelem nastavená priorita P1-P5
 * 3. Kontaktní kompletnost (15b) — má email, telefon, decision makera?
 * 4. Engagement (20b) — otevřel/kliknul emaily?
 * 5. Čerstvost (10b) — jak nedávno byla aktivita?
 * 6. Callcentrum (15b) — výsledky hovorů
 *
 * Výsledek: 0-100 bodů → Hot (80+) / Warm (50-79) / Cold (<50)
 *
 * Účel: Konzultanti se zaměří na Hot leady, sekvence ohřívají Cold/Warm.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { LeadScore } from '@/lib/supabase/sequence-types'

interface ProspectData {
  id: string
  priority: number
  segment_id: string | null
  updated_at: string
}

interface SegmentData {
  average_deal_min_czk: number | null
  average_deal_max_czk: number | null
}

interface ContactData {
  email: string | null
  phone: string | null
  is_decision_maker: boolean
}

interface ScoreBreakdown {
  segment_potential_score: number
  priority_score: number
  contact_completeness_score: number
  engagement_score: number
  recency_score: number
  callcenter_score: number
  ai_adjustment: number
  total_score: number
}

// ─── Scoring Components ──────────────────────────

/** Max 20 bodů — škálováno z průměrné hodnoty dealu segmentu */
function scoreSegmentPotential(segment: SegmentData | null): number {
  if (!segment?.average_deal_max_czk) return 5 // default pro neznámý segment
  const avgDeal = ((segment.average_deal_min_czk || 0) + segment.average_deal_max_czk) / 2
  // Škála: 0-100K=5, 100K-300K=10, 300K-500K=15, 500K+=20
  if (avgDeal >= 500000) return 20
  if (avgDeal >= 300000) return 15
  if (avgDeal >= 100000) return 10
  return 5
}

/** Max 20 bodů — priorita nastavená uživatelem */
function scorePriority(priority: number): number {
  const scores: Record<number, number> = { 1: 20, 2: 16, 3: 12, 4: 8, 5: 4 }
  return scores[priority] || 12
}

/** Max 15 bodů — kompletnost kontaktních údajů */
function scoreContactCompleteness(contacts: ContactData[]): number {
  let score = 0
  const hasEmail = contacts.some(c => c.email)
  const hasPhone = contacts.some(c => c.phone)
  const hasDecisionMaker = contacts.some(c => c.is_decision_maker)
  if (hasEmail) score += 5
  if (hasPhone) score += 5
  if (hasDecisionMaker) score += 5
  return score
}

/** Max 20 bodů — engagement z email eventů (otevření +2, kliknutí +4) */
function scoreEngagement(emailOpens: number, emailClicks: number): number {
  const openScore = Math.min(emailOpens * 2, 8)
  const clickScore = Math.min(emailClicks * 4, 12)
  return openScore + clickScore
}

/** Max 10 bodů — čerstvost poslední aktivity */
function scoreRecency(lastActivityDate: string | null): number {
  if (!lastActivityDate) return 0
  const daysSince = Math.floor(
    (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSince <= 7) return 10
  if (daysSince <= 14) return 7
  if (daysSince <= 30) return 4
  if (daysSince <= 60) return 2
  return 0
}

/** Max 15 bodů — výsledky callcentra */
function scoreCallcenter(bestResult: string | null): number {
  if (!bestResult) return 0
  const scores: Record<string, number> = {
    meeting_scheduled: 15,
    meeting_completed: 15,
    interested: 10,
    consent_offers: 5,
    call_later: 3,
    no_answer: 1,
    unavailable: 1,
  }
  return scores[bestResult] || 0
}

// ─── Main Compute Function ──────────────────────

export async function computeLeadScore(
  supabase: SupabaseClient,
  prospectId: string
): Promise<ScoreBreakdown> {
  // 1. Prospect data
  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, priority, segment_id, updated_at')
    .eq('id', prospectId)
    .single()

  if (!prospect) {
    return {
      segment_potential_score: 0,
      priority_score: 0,
      contact_completeness_score: 0,
      engagement_score: 0,
      recency_score: 0,
      callcenter_score: 0,
      ai_adjustment: 0,
      total_score: 0,
    }
  }

  // 2. Segment data
  let segment: SegmentData | null = null
  if (prospect.segment_id) {
    const { data } = await supabase
      .from('company_segments')
      .select('average_deal_min_czk, average_deal_max_czk')
      .eq('id', prospect.segment_id)
      .single()
    segment = data
  }

  // 3. Contacts
  const { data: contacts } = await supabase
    .from('prospect_contacts')
    .select('email, phone, is_decision_maker')
    .eq('prospect_id', prospectId)

  // 4. Email events (engagement)
  const { data: emailEvents } = await supabase
    .from('email_events')
    .select('event_type')
    .eq('prospect_id', prospectId)
    .in('event_type', ['opened', 'clicked'])

  const emailOpens = emailEvents?.filter(e => e.event_type === 'opened').length || 0
  const emailClicks = emailEvents?.filter(e => e.event_type === 'clicked').length || 0

  // 5. Last activity (recency)
  const { data: lastActivity } = await supabase
    .from('activities')
    .select('created_at')
    .eq('entity_type', 'prospect')
    .eq('entity_id', prospectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 6. Best callcenter result
  const { data: bestCall } = await supabase
    .from('callcenter_call_results')
    .select('result_type')
    .eq('prospect_id', prospectId)
    .in('result_type', ['meeting_scheduled', 'meeting_completed', 'interested', 'consent_offers', 'call_later'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Calculate
  const breakdown: ScoreBreakdown = {
    segment_potential_score: scoreSegmentPotential(segment),
    priority_score: scorePriority(prospect.priority),
    contact_completeness_score: scoreContactCompleteness(contacts || []),
    engagement_score: scoreEngagement(emailOpens, emailClicks),
    recency_score: scoreRecency(lastActivity?.created_at || prospect.updated_at),
    callcenter_score: scoreCallcenter(bestCall?.result_type || null),
    ai_adjustment: 0,
    total_score: 0,
  }

  breakdown.total_score = Math.min(
    100,
    Math.max(
      0,
      breakdown.segment_potential_score +
      breakdown.priority_score +
      breakdown.contact_completeness_score +
      breakdown.engagement_score +
      breakdown.recency_score +
      breakdown.callcenter_score +
      breakdown.ai_adjustment
    )
  )

  return breakdown
}

/** Uloží/aktualizuje lead score v DB */
export async function saveLeadScore(
  supabase: SupabaseClient,
  prospectId: string,
  breakdown: ScoreBreakdown
): Promise<void> {
  await supabase
    .from('lead_scores')
    .upsert(
      {
        prospect_id: prospectId,
        ...breakdown,
        last_computed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'prospect_id' }
    )
}

/** Přepočítá skóre pro jednoho prospekta */
export async function recomputeScoreForProspect(
  supabase: SupabaseClient,
  prospectId: string
): Promise<ScoreBreakdown> {
  const breakdown = await computeLeadScore(supabase, prospectId)
  await saveLeadScore(supabase, prospectId, breakdown)
  return breakdown
}

/** Bulk přepočet všech prospektů (pro cron) */
export async function recomputeAllScores(
  supabase: SupabaseClient,
  limit = 200
): Promise<number> {
  const { data: prospects } = await supabase
    .from('prospects')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (!prospects?.length) return 0

  let computed = 0
  for (const prospect of prospects) {
    await recomputeScoreForProspect(supabase, prospect.id)
    computed++
  }
  return computed
}
