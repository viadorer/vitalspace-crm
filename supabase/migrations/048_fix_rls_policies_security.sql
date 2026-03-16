-- ============================================================================
-- VITALSPACE - Oprava RLS politik (bezpečnost)
-- ============================================================================
-- Nahrazení otevřených anon policies za authenticated-only
-- Původní políčka z 008_rls_policies_for_mcp.sql povolovala USING(true)
-- pro anonymní uživatele = kdokoli s anon key měl plný přístup
-- ============================================================================

-- ==================== PROSPECTS ====================
DROP POLICY IF EXISTS "Allow anon insert prospects" ON prospects;
DROP POLICY IF EXISTS "Allow anon select prospects" ON prospects;
DROP POLICY IF EXISTS "Allow anon update prospects" ON prospects;

CREATE POLICY "Allow authenticated select prospects" ON prospects
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert prospects" ON prospects
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update prospects" ON prospects
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete prospects" ON prospects
    FOR DELETE TO authenticated
    USING (true);

-- ==================== PROSPECT_CONTACTS ====================
DROP POLICY IF EXISTS "Allow anon insert prospect_contacts" ON prospect_contacts;
DROP POLICY IF EXISTS "Allow anon select prospect_contacts" ON prospect_contacts;
DROP POLICY IF EXISTS "Allow anon update prospect_contacts" ON prospect_contacts;

CREATE POLICY "Allow authenticated select prospect_contacts" ON prospect_contacts
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert prospect_contacts" ON prospect_contacts
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update prospect_contacts" ON prospect_contacts
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete prospect_contacts" ON prospect_contacts
    FOR DELETE TO authenticated
    USING (true);

-- ==================== CLIENT_CONTACTS ====================
DROP POLICY IF EXISTS "Allow anon insert client_contacts" ON client_contacts;
DROP POLICY IF EXISTS "Allow anon select client_contacts" ON client_contacts;
DROP POLICY IF EXISTS "Allow anon update client_contacts" ON client_contacts;

CREATE POLICY "Allow authenticated select client_contacts" ON client_contacts
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert client_contacts" ON client_contacts
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update client_contacts" ON client_contacts
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete client_contacts" ON client_contacts
    FOR DELETE TO authenticated
    USING (true);

-- ==================== CLIENTS ====================
DROP POLICY IF EXISTS "Allow anon select clients" ON clients;

CREATE POLICY "Allow authenticated select clients" ON clients
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert clients" ON clients
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update clients" ON clients
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete clients" ON clients
    FOR DELETE TO authenticated
    USING (true);

-- ==================== COMPANY_SEGMENTS ====================
DROP POLICY IF EXISTS "Allow anon select segments" ON company_segments;

-- Zapnout RLS na company_segments (chybělo)
ALTER TABLE company_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select segments" ON company_segments
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert segments" ON company_segments
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update segments" ON company_segments
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete segments" ON company_segments
    FOR DELETE TO authenticated
    USING (true);

-- ==================== DEALS ====================
-- Zajistit, že deals mají RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select deals" ON deals;
DROP POLICY IF EXISTS "Allow authenticated insert deals" ON deals;
DROP POLICY IF EXISTS "Allow authenticated update deals" ON deals;

CREATE POLICY "Allow authenticated select deals" ON deals
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert deals" ON deals
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update deals" ON deals
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==================== PRODUCTS ====================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated select products" ON products;

CREATE POLICY "Allow authenticated select products" ON products
    FOR SELECT TO authenticated
    USING (true);

-- ==================== SPECIAL: Leads API (veřejný endpoint) ====================
-- Leads API potřebuje vkládat do prospects a prospect_contacts
-- Ale používá server-side createClient s cookie session, takže
-- pro neautentizované uživatele přidáme omezenou INSERT-only policy
-- s omezením na status 'not_contacted'
CREATE POLICY "Allow anon insert leads" ON prospects
    FOR INSERT TO anon
    WITH CHECK (status = 'not_contacted');

CREATE POLICY "Allow anon insert lead contacts" ON prospect_contacts
    FOR INSERT TO anon
    WITH CHECK (true);

-- ==================== KOMENTÁŘE ====================
COMMENT ON POLICY "Allow authenticated select prospects" ON prospects IS 'Přihlášení uživatelé mohou číst prospekty';
COMMENT ON POLICY "Allow authenticated insert prospects" ON prospects IS 'Přihlášení uživatelé mohou vytvářet prospekty';
COMMENT ON POLICY "Allow anon insert leads" ON prospects IS 'Veřejný lead formulář může vkládat pouze not_contacted prospekty';
