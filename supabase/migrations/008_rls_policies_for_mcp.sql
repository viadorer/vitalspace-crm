-- ============================================================================
-- VITALSPACE - RLS Policies pro MCP Server
-- ============================================================================
-- Povolení INSERT/UPDATE operací přes anon key pro MCP server
-- Service role key má plný přístup, ale pro anon key potřebujeme explicitní policies
-- ============================================================================

-- Povolit INSERT pro prospects přes anon key
CREATE POLICY "Allow anon insert prospects" ON prospects
    FOR INSERT
    WITH CHECK (true);

-- Povolit SELECT pro prospects přes anon key
CREATE POLICY "Allow anon select prospects" ON prospects
    FOR SELECT
    USING (true);

-- Povolit UPDATE pro prospects přes anon key
CREATE POLICY "Allow anon update prospects" ON prospects
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Povolit INSERT pro prospect_contacts přes anon key
CREATE POLICY "Allow anon insert prospect_contacts" ON prospect_contacts
    FOR INSERT
    WITH CHECK (true);

-- Povolit SELECT pro prospect_contacts přes anon key
CREATE POLICY "Allow anon select prospect_contacts" ON prospect_contacts
    FOR SELECT
    USING (true);

-- Povolit UPDATE pro prospect_contacts přes anon key
CREATE POLICY "Allow anon update prospect_contacts" ON prospect_contacts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Povolit INSERT pro client_contacts přes anon key
CREATE POLICY "Allow anon insert client_contacts" ON client_contacts
    FOR INSERT
    WITH CHECK (true);

-- Povolit SELECT pro client_contacts přes anon key
CREATE POLICY "Allow anon select client_contacts" ON client_contacts
    FOR SELECT
    USING (true);

-- Povolit UPDATE pro client_contacts přes anon key
CREATE POLICY "Allow anon update client_contacts" ON client_contacts
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Povolit SELECT pro clients přes anon key
CREATE POLICY "Allow anon select clients" ON clients
    FOR SELECT
    USING (true);

-- Povolit SELECT pro company_segments přes anon key
CREATE POLICY "Allow anon select segments" ON company_segments
    FOR SELECT
    USING (true);

-- Enable RLS na prospect_contacts a client_contacts pokud ještě není
ALTER TABLE prospect_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;

-- Komentáře
COMMENT ON POLICY "Allow anon insert prospects" ON prospects IS 'MCP server může vytvářet nové prospekty';
COMMENT ON POLICY "Allow anon insert prospect_contacts" ON prospect_contacts IS 'MCP server může přidávat kontakty k prospektům';
COMMENT ON POLICY "Allow anon insert client_contacts" ON client_contacts IS 'MCP server může přidávat kontakty ke klientům';
