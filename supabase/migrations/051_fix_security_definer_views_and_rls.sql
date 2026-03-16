-- ============================================================================
-- Migration 051: Fix SECURITY DEFINER views + enable RLS on missing tables
-- ============================================================================
-- Fixes 10 Supabase linter errors:
--   7x security_definer_view -> recreate as SECURITY INVOKER
--   3x rls_disabled_in_public -> enable RLS + add authenticated policies
-- ============================================================================

-- ============================================================================
-- 1. RECREATE VIEWS WITH SECURITY INVOKER
-- ============================================================================
-- By default PostgreSQL views use SECURITY INVOKER, but Supabase linter
-- flags any view owned by a superuser role as SECURITY DEFINER.
-- Explicitly setting SECURITY INVOKER resolves this.

-- 1a. v_hot_prospects
DROP VIEW IF EXISTS v_hot_prospects;
CREATE VIEW v_hot_prospects WITH (security_invoker = on) AS
SELECT
    p.id,
    p.company_name,
    p.region,
    p.city,
    cs.name AS segment,
    cs.target_pain_point,
    p.employees_count_est,
    p.priority,
    p.source,
    p.assigned_consultant,
    (SELECT COUNT(*) FROM touchpoints t WHERE t.prospect_id = p.id) AS touchpoint_count,
    (SELECT MAX(t.created_at) FROM touchpoints t WHERE t.prospect_id = p.id) AS last_contact
FROM prospects p
LEFT JOIN company_segments cs ON cs.id = p.segment_id
WHERE p.status = 'not_contacted'
  AND p.priority <= 2
ORDER BY p.priority ASC, p.created_at ASC;

-- 1b. v_pipeline_overview
DROP VIEW IF EXISTS v_pipeline_overview;
CREATE VIEW v_pipeline_overview WITH (security_invoker = on) AS
SELECT
    d.id,
    d.deal_number,
    d.title,
    d.stage,
    COALESCE(c.company_name, p.company_name) AS company,
    d.final_price_czk,
    d.estimated_close_date,
    d.assigned_consultant,
    d.created_at,
    (SELECT COUNT(*) FROM deal_items di WHERE di.deal_id = d.id) AS item_count,
    (SELECT COALESCE(SUM(di.line_total_czk), 0) FROM deal_items di WHERE di.deal_id = d.id) AS calculated_total
FROM deals d
LEFT JOIN clients c ON c.id = d.client_id
LEFT JOIN prospects p ON p.id = d.prospect_id
WHERE d.stage NOT IN ('closed_won', 'closed_lost')
ORDER BY
    CASE d.stage
        WHEN 'contract_signed' THEN 1
        WHEN 'negotiation' THEN 2
        WHEN 'proposal_sent' THEN 3
        WHEN 'technical_audit' THEN 4
        WHEN 'installation' THEN 5
        WHEN 'handover' THEN 6
        WHEN 'lead' THEN 7
    END;

-- 1c. v_building_ozone_requirements
DROP VIEW IF EXISTS v_building_ozone_requirements;
CREATE VIEW v_building_ozone_requirements WITH (security_invoker = on) AS
SELECT
    d.id AS deal_id,
    d.title AS deal_title,
    COALESCE(c.company_name, p.company_name) AS company,
    ta.building_name,
    COUNT(ta.id) AS rooms_audited,
    ROUND(SUM(ta.volume_m3)::numeric, 1) AS total_volume_m3,
    SUM(ta.recommended_quantity) AS total_devices_recommended,
    ROUND(SUM(ta.recommended_quantity * COALESCE(pr.ozone_output_gh, 0))::numeric, 1) AS total_ozone_gh_needed
FROM technical_audits ta
JOIN deals d ON d.id = ta.deal_id
LEFT JOIN clients c ON c.id = d.client_id
LEFT JOIN prospects p ON p.id = d.prospect_id
LEFT JOIN products pr ON pr.id = ta.recommended_product_id
GROUP BY d.id, d.title, c.company_name, p.company_name, ta.building_name;

-- 1d. v_monthly_revenue
DROP VIEW IF EXISTS v_monthly_revenue;
CREATE VIEW v_monthly_revenue WITH (security_invoker = on) AS
SELECT
    DATE_TRUNC('month', d.closed_at) AS month,
    COUNT(*) AS deals_closed,
    SUM(d.final_price_czk) AS revenue_czk,
    ROUND(AVG(d.final_price_czk)::numeric, 0) AS avg_deal_czk
FROM deals d
WHERE d.stage = 'closed_won'
  AND d.closed_at IS NOT NULL
GROUP BY DATE_TRUNC('month', d.closed_at)
ORDER BY month DESC;

-- 1e. v_upcoming_services (was redefined in 006, use that version)
DROP VIEW IF EXISTS v_upcoming_services;
CREATE VIEW v_upcoming_services WITH (security_invoker = on) AS
SELECT
    s.id AS subscription_id,
    c.company_name,
    s.plan_name,
    s.next_service_date,
    s.next_service_date - CURRENT_DATE AS days_until_service,
    (
        SELECT cc.email
        FROM client_contacts cc
        WHERE cc.client_id = c.id AND cc.is_primary = true
        LIMIT 1
    ) as primary_email,
    (
        SELECT cc.phone
        FROM client_contacts cc
        WHERE cc.client_id = c.id AND cc.is_primary = true
        LIMIT 1
    ) as primary_phone
FROM subscriptions s
JOIN clients c ON c.id = s.client_id
WHERE s.status = 'active'
  AND s.next_service_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY s.next_service_date ASC;

-- 1f. deal_activities_view
DROP VIEW IF EXISTS deal_activities_view;
CREATE VIEW deal_activities_view WITH (security_invoker = on) AS
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

-- 1g. callcenter_prospect_overview
DROP VIEW IF EXISTS callcenter_prospect_overview;
CREATE VIEW callcenter_prospect_overview WITH (security_invoker = on) AS
SELECT
    p.id,
    p.company_name,
    p.city,
    p.region,
    p.status,
    p.priority,
    p.callcenter_status,
    p.callcenter_total_calls,
    p.callcenter_last_called_at,
    p.callcenter_next_contact_at,
    cs.name AS segment_name,
    (
        SELECT jsonb_build_object(
            'id', pc.id,
            'first_name', pc.first_name,
            'last_name', pc.last_name,
            'phone', pc.phone,
            'email', pc.email,
            'position', pc.position,
            'is_decision_maker', pc.is_decision_maker
        )
        FROM prospect_contacts pc
        WHERE pc.prospect_id = p.id
        ORDER BY pc.is_decision_maker DESC, pc.created_at ASC
        LIMIT 1
    ) AS primary_contact,
    (SELECT COUNT(*) FROM prospect_contacts pc WHERE pc.prospect_id = p.id) AS contact_count,
    (
        SELECT jsonb_build_object(
            'result_type', cr.result_type,
            'note', cr.note,
            'created_at', cr.created_at,
            'operator_name', cr.operator_name
        )
        FROM callcenter_call_results cr
        WHERE cr.prospect_id = p.id
        ORDER BY cr.created_at DESC
        LIMIT 1
    ) AS last_call_result
FROM prospects p
LEFT JOIN company_segments cs ON cs.id = p.segment_id
WHERE p.callcenter_status IS NOT NULL;


-- ============================================================================
-- 2. ENABLE RLS ON TABLES MISSING IT
-- ============================================================================

-- 2a. air_measurements
ALTER TABLE air_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "air_measurements_select_authenticated" ON air_measurements;
CREATE POLICY "air_measurements_select_authenticated"
    ON air_measurements FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "air_measurements_insert_authenticated" ON air_measurements;
CREATE POLICY "air_measurements_insert_authenticated"
    ON air_measurements FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "air_measurements_update_authenticated" ON air_measurements;
CREATE POLICY "air_measurements_update_authenticated"
    ON air_measurements FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "air_measurements_delete_authenticated" ON air_measurements;
CREATE POLICY "air_measurements_delete_authenticated"
    ON air_measurements FOR DELETE
    TO authenticated
    USING (true);

-- 2b. deal_stage_history
ALTER TABLE deal_stage_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_stage_history_select_authenticated" ON deal_stage_history;
CREATE POLICY "deal_stage_history_select_authenticated"
    ON deal_stage_history FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "deal_stage_history_insert_authenticated" ON deal_stage_history;
CREATE POLICY "deal_stage_history_insert_authenticated"
    ON deal_stage_history FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "deal_stage_history_update_authenticated" ON deal_stage_history;
CREATE POLICY "deal_stage_history_update_authenticated"
    ON deal_stage_history FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "deal_stage_history_delete_authenticated" ON deal_stage_history;
CREATE POLICY "deal_stage_history_delete_authenticated"
    ON deal_stage_history FOR DELETE
    TO authenticated
    USING (true);

-- 2c. deal_activities
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_activities_select_authenticated" ON deal_activities;
CREATE POLICY "deal_activities_select_authenticated"
    ON deal_activities FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "deal_activities_insert_authenticated" ON deal_activities;
CREATE POLICY "deal_activities_insert_authenticated"
    ON deal_activities FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "deal_activities_update_authenticated" ON deal_activities;
CREATE POLICY "deal_activities_update_authenticated"
    ON deal_activities FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "deal_activities_delete_authenticated" ON deal_activities;
CREATE POLICY "deal_activities_delete_authenticated"
    ON deal_activities FOR DELETE
    TO authenticated
    USING (true);
