-- ============================================================================
-- VITALSPACE - MCP API klíče
-- ============================================================================
-- Tabulka pro API klíče používané MCP serverem (mcp-server/src/index.ts)
-- a dalšími backendovými integracemi, které volají CRM endpointy
-- (/api/clients, /api/prospects, /api/segments) bez Supabase session.
--
-- Oddělené od callcenter_api_keys, protože callcenter má jiný scope
-- (pouze /api/callcenter/*) a jiné provozní vlastnosti (CORS allowlist
-- a omezená oprávnění).
-- ============================================================================

CREATE TABLE IF NOT EXISTS mcp_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,                           -- např. "Claude MCP production"
    key_hash TEXT NOT NULL UNIQUE,                -- HMAC-SHA256(pepper, raw_key)
    permissions TEXT[] NOT NULL DEFAULT '{}',     -- ['crm:read', 'crm:write']
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES app_users(id)
);

ALTER TABLE mcp_api_keys ENABLE ROW LEVEL SECURITY;

-- Pouze service role má přístup k API klíčům (přes createAdminClient)
CREATE POLICY "Service role only for mcp_api_keys" ON mcp_api_keys
    FOR ALL TO authenticated
    USING (false);

CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_key_hash ON mcp_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_mcp_api_keys_is_active ON mcp_api_keys(is_active);

COMMENT ON TABLE mcp_api_keys IS
    'API klíče pro MCP server a backendové integrace volající CRM endpointy. '
    'Ověřuje se přes X-API-Key header (viz lib/supabase/mcp-auth.ts).';
