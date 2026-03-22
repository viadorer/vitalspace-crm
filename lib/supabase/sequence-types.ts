/**
 * Typy pro Email Sequence Orchestrátor
 *
 * Orchestrátor automatizuje outreach na prospekty:
 * 1. Email sekvence (per segment, s AI personalizací)
 * 2. Callcentrum koordinace (po emailech)
 * 3. Lead scoring (0-100, hot/warm/cold)
 * 4. Engagement tracking (otevření, kliknutí)
 */

// ─── Sekvence ────────────────────────────────────

export interface EmailSequence {
  id: string
  name: string
  description: string | null
  segment_ids: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined data
  steps?: SequenceStep[]
  enrollment_count?: number
}

export type StepActionType = 'email' | 'callcenter' | 'wait_for_event' | 'ai_decide'
export type WaitEventType = 'open' | 'click' | 'call_result' | 'reply'

export interface SequenceStep {
  id: string
  sequence_id: string
  step_order: number
  action_type: StepActionType
  // Email
  email_template_name: string | null
  email_subject_override: string | null
  use_ai_personalization: boolean
  // Timing
  delay_hours: number
  // Wait for event
  wait_event_type: WaitEventType | null
  wait_timeout_hours: number
  // Branching
  on_event_skip_to_step: number | null
  created_at: string
}

// ─── Enrollmenty ─────────────────────────────────

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'stopped' | 'error'

export interface ProspectSequenceEnrollment {
  id: string
  prospect_id: string
  sequence_id: string
  current_step_order: number
  status: EnrollmentStatus
  next_execution_at: string | null
  enrolled_at: string
  last_step_executed_at: string | null
  stop_reason: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  prospect?: {
    id: string
    company_name: string
    status: string
    callcenter_status: string | null
  }
  sequence?: {
    id: string
    name: string
  }
}

// ─── Email Events ────────────────────────────────

export type EmailEventType = 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complaint'

export interface EmailEvent {
  id: string
  message_id: string
  prospect_id: string | null
  client_id: string | null
  enrollment_id: string | null
  event_type: EmailEventType
  email_address: string | null
  link_url: string | null
  raw_payload: Record<string, unknown> | null
  created_at: string
}

// ─── Lead Scoring ────────────────────────────────

export type LeadCategory = 'hot' | 'warm' | 'cold'

export interface LeadScore {
  id: string
  prospect_id: string
  total_score: number
  segment_potential_score: number
  priority_score: number
  contact_completeness_score: number
  engagement_score: number
  recency_score: number
  callcenter_score: number
  ai_adjustment: number
  category: LeadCategory
  last_computed_at: string
  created_at: string
  updated_at: string
  // Joined
  prospect?: {
    id: string
    company_name: string
    status: string
    priority: number
    region: string | null
  }
}

// ─── Execution Log ───────────────────────────────

export interface SequenceExecutionLog {
  id: string
  enrollment_id: string
  step_order: number
  action_type: string
  result: string | null
  details: Record<string, unknown> | null
  brevo_message_id: string | null
  created_at: string
}

// ─── AI Decision Types ───────────────────────────

export type AIAction = 'send_email' | 'queue_callcenter' | 'wait' | 'skip_step' | 'stop_sequence'

export interface AIDecision {
  action: AIAction
  template_name?: string
  wait_days?: number
  reasoning: string
}

export interface AIScoreAdjustment {
  adjustment: number  // -10 to +10
  reasoning: string
}
