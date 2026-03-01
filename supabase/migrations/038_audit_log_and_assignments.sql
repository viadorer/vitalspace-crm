-- ============================================================================
-- AUDIT LOG + ASSIGNMENT SYSTEM
-- ============================================================================

-- 1. Centrální audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN (
        'create', 'update', 'delete', 'assign', 'stage_change', 'activate', 'deactivate'
    )),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'deal', 'prospect', 'client', 'deal_item', 'deal_activity',
        'technical_audit', 'installation', 'document', 'product', 'app_user'
    )),
    entity_id UUID NOT NULL,
    changes JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_select" ON audit_log
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "audit_log_insert" ON audit_log
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 2. Assignment history (předávání konzultantů)
CREATE TABLE assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('deal', 'prospect', 'client')),
    entity_id UUID NOT NULL,
    from_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    reason TEXT,
    created_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assignment_history_entity ON assignment_history(entity_type, entity_id);
CREATE INDEX idx_assignment_history_to ON assignment_history(to_user_id);
CREATE INDEX idx_assignment_history_created ON assignment_history(created_at DESC);

ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignment_history_select" ON assignment_history
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assignment_history_insert" ON assignment_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Přidání assigned_user_id na entity (UUID reference místo TEXT)
ALTER TABLE deals ADD COLUMN assigned_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;
CREATE INDEX idx_deals_assigned_user ON deals(assigned_user_id);

ALTER TABLE prospects ADD COLUMN assigned_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;
CREATE INDEX idx_prospects_assigned_user ON prospects(assigned_user_id);

ALTER TABLE clients ADD COLUMN assigned_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;
CREATE INDEX idx_clients_assigned_user ON clients(assigned_user_id);

-- 4. Přidání stage_entered_at na deals pro sledování stáří ve fázi
ALTER TABLE deals ADD COLUMN stage_entered_at TIMESTAMPTZ DEFAULT now();

-- 5. Trigger: automaticky aktualizovat stage_entered_at při změně stage
CREATE OR REPLACE FUNCTION fn_deal_stage_entered()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        NEW.stage_entered_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deal_stage_entered
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION fn_deal_stage_entered();
