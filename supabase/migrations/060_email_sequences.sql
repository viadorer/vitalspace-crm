-- =====================================================
-- EMAIL SEQUENCE ORCHESTRATOR — Database Schema
-- =====================================================
-- Účel: Automatizovaný outreach systém s email sekvencemi,
-- callcentrum koordinací, Gemini AI personalizací a lead scoringem.
--
-- Tabulky:
--   email_sequences          – Definice sekvencí (název, cílové segmenty)
--   sequence_steps            – Jednotlivé kroky sekvence (email, callcentrum, AI)
--   prospect_sequence_enrollments – Zařazení prospektů do sekvencí
--   email_events              – Tracking z Brevo (otevření, kliknutí, bounce)
--   lead_scores               – Vypočítané lead skóre (0-100, hot/warm/cold)
--   sequence_execution_log    – Audit log co se v sekvenci stalo
-- =====================================================

-- 1. Definice emailových sekvencí
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  -- Cílové segmenty (prázdné pole = pro všechny segmenty)
  segment_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Kroky sekvence (co se děje v jakém pořadí)
CREATE TABLE IF NOT EXISTS sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  -- Pořadí kroku v sekvenci (1, 2, 3...)
  step_order INTEGER NOT NULL,
  -- Typ akce: email, callcenter, wait_for_event, ai_decide
  action_type TEXT NOT NULL CHECK (action_type IN ('email', 'callcenter', 'wait_for_event', 'ai_decide')),

  -- Pro email kroky:
  email_template_name TEXT,        -- klíč šablony z templates.ts
  email_subject_override TEXT,     -- volitelný override předmětu
  use_ai_personalization BOOLEAN DEFAULT false,  -- Gemini personalizace?

  -- Delay před provedením tohoto kroku (v hodinách)
  delay_hours INTEGER DEFAULT 72,

  -- Pro wait_for_event kroky:
  wait_event_type TEXT CHECK (wait_event_type IN ('open', 'click', 'call_result', 'reply')),
  wait_timeout_hours INTEGER DEFAULT 168,  -- 7 dní timeout

  -- Větvení: pokud událost nastane, skoč na tento krok
  on_event_skip_to_step INTEGER,

  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(sequence_id, step_order)
);

-- 3. Zařazení prospektů do sekvencí
CREATE TABLE IF NOT EXISTS prospect_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES email_sequences(id) ON DELETE CASCADE,
  -- Aktuální krok v sekvenci
  current_step_order INTEGER DEFAULT 1,
  -- Status: active = běží, paused = pozastaveno, completed = dokončeno, stopped = zastaveno, error = chyba
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'stopped', 'error')),
  -- Kdy se má provést další krok
  next_execution_at TIMESTAMPTZ,
  -- Tracking
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_step_executed_at TIMESTAMPTZ,
  stop_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Prospect může být v jedné sekvenci jen jednou
  UNIQUE(prospect_id, sequence_id)
);

-- Index pro cron: rychle najdi enrollmenty k provedení
CREATE INDEX IF NOT EXISTS idx_enrollments_active_next
  ON prospect_sequence_enrollments(next_execution_at)
  WHERE status = 'active';

-- 4. Email eventy z Brevo webhooků
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Brevo message ID pro propojení s odeslaným emailem
  message_id TEXT NOT NULL,
  prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  enrollment_id UUID REFERENCES prospect_sequence_enrollments(id) ON DELETE SET NULL,
  -- Typ události
  event_type TEXT NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complaint')),
  email_address TEXT,
  link_url TEXT,  -- pro click eventy
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_message ON email_events(message_id);
CREATE INDEX IF NOT EXISTS idx_email_events_prospect ON email_events(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_events_enrollment ON email_events(enrollment_id);

-- 5. Lead skóre — automaticky vypočítané
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE UNIQUE,
  -- Celkové skóre 0-100
  total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  -- Breakdown per komponenta
  segment_potential_score INTEGER DEFAULT 0,  -- max 20
  priority_score INTEGER DEFAULT 0,           -- max 20
  contact_completeness_score INTEGER DEFAULT 0, -- max 15
  engagement_score INTEGER DEFAULT 0,          -- max 20
  recency_score INTEGER DEFAULT 0,             -- max 10
  callcenter_score INTEGER DEFAULT 0,          -- max 15
  ai_adjustment INTEGER DEFAULT 0,             -- -10 to +10
  -- Kategorie (automaticky z total_score)
  category TEXT GENERATED ALWAYS AS (
    CASE
      WHEN total_score >= 80 THEN 'hot'
      WHEN total_score >= 50 THEN 'warm'
      ELSE 'cold'
    END
  ) STORED,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_scores_category ON lead_scores(category);
CREATE INDEX IF NOT EXISTS idx_lead_scores_total ON lead_scores(total_score DESC);

-- 6. Execution log — audit trail co se v sekvenci stalo
CREATE TABLE IF NOT EXISTS sequence_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES prospect_sequence_enrollments(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  -- Výsledek: success, skipped, error, ai_decided, stopped
  result TEXT,
  -- Detaily (např. jaký email se poslal, co AI rozhodlo)
  details JSONB,
  brevo_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exec_log_enrollment ON sequence_execution_log(enrollment_id);

-- =====================================================
-- RLS Policies
-- =====================================================
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_sequence_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_execution_log ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read everything
CREATE POLICY "authenticated_read_sequences" ON email_sequences FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_steps" ON sequence_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_enrollments" ON prospect_sequence_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_events" ON email_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_scores" ON lead_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_read_exec_log" ON sequence_execution_log FOR SELECT TO authenticated USING (true);

-- Authenticated users can insert/update (service role bypasses RLS for cron)
CREATE POLICY "authenticated_write_sequences" ON email_sequences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_steps" ON sequence_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_enrollments" ON prospect_sequence_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_events" ON email_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_scores" ON lead_scores FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_write_exec_log" ON sequence_execution_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Service role (cron) can do everything (implicit via service_role key)
