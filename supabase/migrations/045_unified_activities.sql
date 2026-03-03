-- ============================================================================
-- Univerzální tabulka aktivit napříč celým flow
-- ============================================================================
-- Jedna tabulka pro prospect, client, deal i kontakty
-- Aktivity se udržují po celou životnost entity
-- ============================================================================

-- 1. Vytvořit univerzální tabulku activities
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Polymorfní vazba na entitu
    entity_type TEXT NOT NULL CHECK (entity_type IN ('prospect', 'client', 'deal', 'client_contact', 'prospect_contact')),
    entity_id UUID NOT NULL,
    
    -- Typ aktivity
    type TEXT DEFAULT 'note'
        CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'document')),
    
    -- Obsah
    subject TEXT,
    body TEXT,
    
    -- Stav
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    assigned_to TEXT,
    
    -- Kdo vytvořil / upravil
    created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy pro rychlé dotazy
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_due ON activities(due_date) WHERE NOT is_completed;
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. Migrovat existující deal_activities do nové tabulky
-- ============================================================================

INSERT INTO activities (id, entity_type, entity_id, type, subject, body, is_completed, due_date, assigned_to, created_by, created_at)
SELECT 
    id,
    'deal' AS entity_type,
    deal_id AS entity_id,
    type,
    subject,
    body,
    is_completed,
    due_date,
    assigned_to,
    created_by,
    created_at
FROM deal_activities;

-- ============================================================================
-- 3. Migrovat prospect_activities (pokud existují data)
-- ============================================================================

INSERT INTO activities (id, entity_type, entity_id, type, subject, body, is_completed, due_date, assigned_to, created_by, created_at)
SELECT 
    id,
    'prospect' AS entity_type,
    prospect_id AS entity_id,
    type,
    subject,
    body,
    is_completed,
    due_date,
    assigned_to,
    created_by,
    created_at
FROM prospect_activities;

-- ============================================================================
-- 4. Migrovat contact_activities (pokud existují data)
-- ============================================================================

INSERT INTO activities (id, entity_type, entity_id, type, subject, body, is_completed, due_date, assigned_to, created_by, created_at)
SELECT 
    id,
    contact_type AS entity_type,
    contact_id AS entity_id,
    type,
    subject,
    body,
    is_completed,
    due_date,
    assigned_to,
    created_by,
    created_at
FROM contact_activities;

-- ============================================================================
-- 5. Smazat staré tabulky
-- ============================================================================

DROP TABLE IF EXISTS prospect_activities CASCADE;
DROP TABLE IF EXISTS contact_activities CASCADE;

-- deal_activities ponecháme jako view pro zpětnou kompatibilitu
-- (workflow engine a DealDetail ji používají)
CREATE OR REPLACE VIEW deal_activities_view AS
SELECT 
    id,
    entity_id AS deal_id,
    type,
    subject,
    body,
    is_completed,
    due_date,
    assigned_to,
    created_by,
    created_at,
    updated_at
FROM activities
WHERE entity_type = 'deal';

-- ============================================================================
-- 6. RLS Policies
-- ============================================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by everyone"
    ON activities FOR SELECT
    USING (true);

CREATE POLICY "Activities can be created by everyone"
    ON activities FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Activities can be updated by everyone"
    ON activities FOR UPDATE
    USING (true);

CREATE POLICY "Activities can be deleted by everyone"
    ON activities FOR DELETE
    USING (true);
