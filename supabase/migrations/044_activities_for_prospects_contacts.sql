-- ============================================================================
-- Aktivity pro prospekty a kontakty (stejně jako u dealů)
-- ============================================================================
-- Umožňuje sledovat celý životní cyklus od prospecta přes klienta až po deal
-- Včetně logování kdo aktivitu vytvořil
-- ============================================================================

-- ============================================================================
-- PROSPECT ACTIVITIES
-- ============================================================================

CREATE TABLE prospect_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'note'
        CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'document')),
    subject TEXT,
    body TEXT,
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    assigned_to TEXT,
    created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospect_activities_prospect ON prospect_activities(prospect_id);
CREATE INDEX idx_prospect_activities_due ON prospect_activities(due_date) WHERE NOT is_completed;
CREATE INDEX idx_prospect_activities_created_by ON prospect_activities(created_by);

-- ============================================================================
-- CONTACT ACTIVITIES (pro client_contacts i prospect_contacts)
-- ============================================================================

CREATE TABLE contact_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL,  -- ID z client_contacts nebo prospect_contacts
    contact_type TEXT NOT NULL CHECK (contact_type IN ('client_contact', 'prospect_contact')),
    type TEXT DEFAULT 'note'
        CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'document')),
    subject TEXT,
    body TEXT,
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    assigned_to TEXT,
    created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_activities_contact ON contact_activities(contact_id, contact_type);
CREATE INDEX idx_contact_activities_due ON contact_activities(due_date) WHERE NOT is_completed;
CREATE INDEX idx_contact_activities_created_by ON contact_activities(created_by);

-- ============================================================================
-- Aktualizace deal_activities - přidání created_by a updated_at
-- ============================================================================

ALTER TABLE deal_activities 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_deal_activities_created_by ON deal_activities(created_by);

-- ============================================================================
-- Trigger pro automatickou aktualizaci updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prospect_activities_updated_at
    BEFORE UPDATE ON prospect_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_activities_updated_at
    BEFORE UPDATE ON contact_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_activities_updated_at
    BEFORE UPDATE ON deal_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies pro nové tabulky
-- ============================================================================

ALTER TABLE prospect_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

-- Prospect activities - všichni mohou číst a vytvářet
CREATE POLICY "Prospect activities are viewable by everyone"
    ON prospect_activities FOR SELECT
    USING (true);

CREATE POLICY "Prospect activities can be created by everyone"
    ON prospect_activities FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Prospect activities can be updated by everyone"
    ON prospect_activities FOR UPDATE
    USING (true);

CREATE POLICY "Prospect activities can be deleted by everyone"
    ON prospect_activities FOR DELETE
    USING (true);

-- Contact activities - všichni mohou číst a vytvářet
CREATE POLICY "Contact activities are viewable by everyone"
    ON contact_activities FOR SELECT
    USING (true);

CREATE POLICY "Contact activities can be created by everyone"
    ON contact_activities FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Contact activities can be updated by everyone"
    ON contact_activities FOR UPDATE
    USING (true);

CREATE POLICY "Contact activities can be deleted by everyone"
    ON contact_activities FOR DELETE
    USING (true);
