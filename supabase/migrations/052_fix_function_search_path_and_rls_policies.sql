-- ============================================================================
-- Migration 052: Fix function search_path + tighten RLS policies
-- ============================================================================
-- Fixes:
--   8x function_search_path_mutable -> add SET search_path = public
--   Many rls_policy_always_true -> restrict to TO authenticated
--   Note: auth_leaked_password_protection must be enabled in Supabase Dashboard
-- ============================================================================

-- ============================================================================
-- 1. RECREATE FUNCTIONS WITH search_path SET
-- ============================================================================

-- 1a. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1b. fn_recalculate_deal_total
CREATE OR REPLACE FUNCTION public.fn_recalculate_deal_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.deals SET
        total_hardware_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM public.deal_items di
            JOIN public.products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category IN ('nastropni', 'mobilni', 'box', 'prislusenstvi')
        ),
        total_installation_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM public.deal_items di
            JOIN public.products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category = 'sluzba'
              AND p.sku LIKE 'SRV-INST%'
        ),
        total_service_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM public.deal_items di
            JOIN public.products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category = 'sluzba'
              AND p.sku NOT LIKE 'SRV-INST%'
        ),
        total_value_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM public.deal_items di
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
        ),
        final_price_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM public.deal_items di
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
        ) * (1 - COALESCE(
            (SELECT d2.discount_percent FROM public.deals d2 WHERE d2.id = COALESCE(NEW.deal_id, OLD.deal_id)),
            0
        ) / 100),
        updated_at = now()
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1c. fn_log_stage_change
CREATE OR REPLACE FUNCTION public.fn_log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO public.deal_stage_history (deal_id, from_stage, to_stage, changed_by)
        VALUES (NEW.id, OLD.stage, NEW.stage, NEW.assigned_consultant);

        IF NEW.stage IN ('closed_won', 'closed_lost') THEN
            NEW.closed_at = now();
        END IF;

        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1d. fn_calc_room_volume
CREATE OR REPLACE FUNCTION public.fn_calc_room_volume()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.area_m2 IS NOT NULL AND NEW.ceiling_height_m IS NOT NULL THEN
        NEW.volume_m3 = NEW.area_m2 * NEW.ceiling_height_m;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1e. fn_app_users_updated_at
CREATE OR REPLACE FUNCTION public.fn_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1f. fn_handle_new_user (SECURITY DEFINER — needs search_path pinned)
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.app_users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        'consultant'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1g. fn_handle_user_login (SECURITY DEFINER — needs search_path pinned)
CREATE OR REPLACE FUNCTION public.fn_handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
        UPDATE public.app_users
        SET last_login_at = NEW.last_sign_in_at
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1h. fn_deal_stage_entered
CREATE OR REPLACE FUNCTION public.fn_deal_stage_entered()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        NEW.stage_entered_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ============================================================================
-- 2. FIX RLS POLICIES — restrict anonymous USING(true) to TO authenticated
-- ============================================================================
-- The linter flags policies that use USING(true)/WITH CHECK(true) without
-- specifying TO authenticated. We drop the old open policies and recreate
-- them restricted to authenticated role only.

-- 2a. activities (was open to everyone including anon)
DROP POLICY IF EXISTS "Activities can be created by everyone" ON activities;
CREATE POLICY "activities_insert_authenticated"
    ON activities FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Activities can be updated by everyone" ON activities;
CREATE POLICY "activities_update_authenticated"
    ON activities FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Activities can be deleted by everyone" ON activities;
CREATE POLICY "activities_delete_authenticated"
    ON activities FOR DELETE
    TO authenticated
    USING (true);

-- Keep SELECT open for authenticated (linter doesn't flag SELECT USING(true))
DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
CREATE POLICY "activities_select_authenticated"
    ON activities FOR SELECT
    TO authenticated
    USING (true);

-- 2b. crm_documents (was open to all roles including anon)
DROP POLICY IF EXISTS "crm_documents_insert" ON crm_documents;
CREATE POLICY "crm_documents_insert_auth"
    ON crm_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "crm_documents_update" ON crm_documents;
CREATE POLICY "crm_documents_update_auth"
    ON crm_documents FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "crm_documents_delete" ON crm_documents;
CREATE POLICY "crm_documents_delete_auth"
    ON crm_documents FOR DELETE
    TO authenticated
    USING (true);

-- Keep SELECT
DROP POLICY IF EXISTS "crm_documents_select" ON crm_documents;
CREATE POLICY "crm_documents_select_auth"
    ON crm_documents FOR SELECT
    TO authenticated
    USING (true);

-- 2c. documents (was open to all roles including anon)
DROP POLICY IF EXISTS "documents_insert" ON documents;
CREATE POLICY "documents_insert_auth"
    ON documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "documents_update" ON documents;
CREATE POLICY "documents_update_auth"
    ON documents FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "documents_delete" ON documents;
CREATE POLICY "documents_delete_auth"
    ON documents FOR DELETE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "documents_select" ON documents;
CREATE POLICY "documents_select_auth"
    ON documents FOR SELECT
    TO authenticated
    USING (true);

-- 2d. prospect_contacts — restrict anon INSERT (was WITH CHECK(true) to anon)
-- Keep the anon insert for leads API but restrict what can be inserted
DROP POLICY IF EXISTS "Allow anon insert lead contacts" ON prospect_contacts;
CREATE POLICY "anon_insert_lead_contacts"
    ON prospect_contacts FOR INSERT
    TO anon
    WITH CHECK (
        -- Only allow inserting contacts for prospects with status 'not_contacted'
        EXISTS (
            SELECT 1 FROM public.prospects p
            WHERE p.id = prospect_id
              AND p.status = 'not_contacted'
        )
    );
