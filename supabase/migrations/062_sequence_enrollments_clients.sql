-- =====================================================
-- Rozšíření sekvencí pro klienty (nejen prospekty)
-- =====================================================
-- Přidává client_id sloupec do enrollments a email_events
-- Umožňuje spouštět sekvence i pro stávající klienty (upsell, retention)

-- 1. Přidej client_id do enrollments
ALTER TABLE prospect_sequence_enrollments
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'prospect' CHECK (entity_type IN ('prospect', 'client'));

-- 2. Odstraň NOT NULL constraint na prospect_id (klient nemá prospect_id)
ALTER TABLE prospect_sequence_enrollments
  ALTER COLUMN prospect_id DROP NOT NULL;

-- 3. Přidej CHECK — musí být vyplněný buď prospect_id NEBO client_id
ALTER TABLE prospect_sequence_enrollments
  ADD CONSTRAINT enrollment_entity_check
  CHECK (
    (prospect_id IS NOT NULL AND client_id IS NULL AND entity_type = 'prospect')
    OR
    (prospect_id IS NULL AND client_id IS NOT NULL AND entity_type = 'client')
  );

-- 4. Unique constraint pro klienty (klient může být v sekvenci jen jednou)
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollment_client_sequence
  ON prospect_sequence_enrollments(client_id, sequence_id)
  WHERE client_id IS NOT NULL;

-- 5. Index pro dotazy přes client_id
CREATE INDEX IF NOT EXISTS idx_enrollments_client
  ON prospect_sequence_enrollments(client_id)
  WHERE client_id IS NOT NULL;

-- 6. Lead scores pro klienty
ALTER TABLE lead_scores
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  ALTER COLUMN prospect_id DROP NOT NULL;

ALTER TABLE lead_scores
  ADD CONSTRAINT lead_score_entity_check
  CHECK (prospect_id IS NOT NULL OR client_id IS NOT NULL);
