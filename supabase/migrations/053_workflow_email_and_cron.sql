-- ============================================================================
-- Migration 053: Extend workflow rules with email actions + auto-trigger support
-- ============================================================================

-- Add email action fields to workflow_rules
ALTER TABLE workflow_rules
    ADD COLUMN IF NOT EXISTS send_email BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_template TEXT CHECK (email_template IN (
        'stage_notification', 'activity_reminder', 'quote_followup', 'custom'
    ) OR email_template IS NULL),
    ADD COLUMN IF NOT EXISTS email_subject TEXT,
    ADD COLUMN IF NOT EXISTS email_body_html TEXT;

-- Add trigger type: 'stage_change' (existing) or 'inactivity' (cron-based)
ALTER TABLE workflow_rules
    ADD COLUMN IF NOT EXISTS trigger_type TEXT NOT NULL DEFAULT 'stage_change'
        CHECK (trigger_type IN ('stage_change', 'inactivity')),
    ADD COLUMN IF NOT EXISTS inactivity_days INT;

-- Update existing rules to have trigger_type explicitly
UPDATE workflow_rules SET trigger_type = 'stage_change' WHERE trigger_type IS NULL;

-- Add inactivity-based rule: auto-assign to callcenter after 7 days without activity
INSERT INTO workflow_rules (
    trigger_type, trigger_stage, assign_to_role, assign_strategy,
    create_activity, activity_type, activity_subject, activity_due_days,
    send_email, email_template, email_subject,
    inactivity_days, sort_order
) VALUES (
    'inactivity', 'not_contacted', NULL, 'keep_current',
    true, 'task', 'Prospect neaktivní 7 dní – přidat do callcentra', 0,
    false, NULL, NULL,
    7, 100
);

-- Add inactivity rule: follow-up reminder after 3 days on proposal_sent
INSERT INTO workflow_rules (
    trigger_type, trigger_stage, assign_to_role, assign_strategy,
    create_activity, activity_type, activity_subject, activity_due_days,
    send_email, email_template, email_subject,
    inactivity_days, sort_order
) VALUES (
    'inactivity', 'proposal_sent', NULL, 'keep_current',
    true, 'task', 'Follow-up: nabídka bez odpovědi 3 dny', 1,
    true, 'activity_reminder', 'Připomínka: nabídka čeká na odpověď',
    3, 110
);
