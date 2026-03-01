-- ============================================================================
-- WORKFLOW RULES – automatické akce při změně stage
-- ============================================================================

CREATE TABLE workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_stage TEXT NOT NULL,
    assign_to_role TEXT CHECK (assign_to_role IN ('consultant', 'technician') OR assign_to_role IS NULL),
    assign_strategy TEXT NOT NULL DEFAULT 'keep_current' CHECK (assign_strategy IN (
        'round_robin', 'keep_current', 'return_original'
    )),
    create_activity BOOLEAN NOT NULL DEFAULT false,
    activity_type TEXT CHECK (activity_type IN ('task', 'note', 'call', 'email', 'meeting') OR activity_type IS NULL),
    activity_subject TEXT,
    activity_due_days INT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflow_rules_stage ON workflow_rules(trigger_stage);
CREATE INDEX idx_workflow_rules_active ON workflow_rules(is_active);

ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workflow_rules_select" ON workflow_rules
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "workflow_rules_all" ON workflow_rules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
    );

-- Seed: výchozí pravidla
INSERT INTO workflow_rules (trigger_stage, assign_to_role, assign_strategy, create_activity, activity_type, activity_subject, activity_due_days, sort_order) VALUES
    ('lead',             'consultant', 'round_robin',     true, 'task', 'Kontaktovat nový lead',           1, 10),
    ('technical_audit',  'technician', 'round_robin',     true, 'task', 'Naplánovat technický audit',      2, 20),
    ('proposal_sent',    'consultant', 'return_original', true, 'task', 'Follow-up nabídky',               3, 30),
    ('negotiation',       NULL,        'keep_current',    true, 'task', 'Připravit finální nabídku',       2, 40),
    ('contract_signed',  'technician', 'round_robin',     true, 'task', 'Připravit montážní plán',         5, 50),
    ('installation',      NULL,        'keep_current',    true, 'task', 'Zkontrolovat průběh montáže',     3, 60),
    ('handover',          NULL,        'keep_current',    true, 'task', 'Vytvořit předávací protokol',     1, 70),
    ('closed_won',       'consultant', 'return_original', true, 'task', 'Satisfaction check',             30, 80),
    ('closed_lost',       NULL,        'keep_current',    true, 'note', 'Analýza ztráty – důvod?',        0, 90);
