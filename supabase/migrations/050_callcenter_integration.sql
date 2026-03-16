-- ============================================================================
-- VITALSPACE - Callcenter integrace (varianta C)
-- ============================================================================
-- API klíče pro Web-nabídky callcentrum
-- Tabulka call_results pro výsledky hovorů
-- Žádné kontakty se nekopírují — Web-nabídky pouze volá VitalSpace API
-- ============================================================================

-- ==================== API KLÍČE ====================
CREATE TABLE IF NOT EXISTS callcenter_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,                          -- např. "Web-nabídky production"
    key_hash TEXT NOT NULL UNIQUE,               -- SHA-256 hash API klíče
    permissions TEXT[] NOT NULL DEFAULT '{}',     -- ['prospects:read', 'callresult:write']
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES app_users(id)
);

ALTER TABLE callcenter_api_keys ENABLE ROW LEVEL SECURITY;

-- Jen service role má přístup k API klíčům
CREATE POLICY "Service role only for api_keys" ON callcenter_api_keys
    FOR ALL TO authenticated
    USING (false);

-- ==================== VÝSLEDKY HOVORŮ ====================
CREATE TABLE IF NOT EXISTS callcenter_call_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Vazba na VitalSpace data
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    prospect_contact_id UUID REFERENCES prospect_contacts(id) ON DELETE SET NULL,

    -- Kdo volal (operátor z Web-nabídky)
    operator_name TEXT NOT NULL,
    operator_id TEXT,                            -- ID operátora ve Web-nabídky systému

    -- Výsledek hovoru
    result_type TEXT NOT NULL CHECK (result_type IN (
        'no_answer',          -- nezvedl
        'unavailable',        -- nedostupný
        'interested',         -- projevil zájem
        'meeting_scheduled',  -- schůzka domluvena
        'meeting_completed',  -- schůzka proběhla
        'not_interested',     -- nemá zájem
        'call_later',         -- zavolat později
        'wrong_number',       -- špatné číslo
        'consent_offers',     -- souhlas se zasíláním nabídek
        'other'               -- jiné
    )),

    -- Detaily
    note TEXT,                                   -- poznámka operátora
    call_duration_seconds INTEGER,               -- délka hovoru
    next_contact_at TIMESTAMPTZ,                 -- kdy znovu zavolat
    meeting_date TIMESTAMPTZ,                    -- datum schůzky (pokud domluvena)
    attempt_number INTEGER NOT NULL DEFAULT 1,   -- kolikátý pokus

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_results_prospect ON callcenter_call_results(prospect_id);
CREATE INDEX idx_call_results_created ON callcenter_call_results(created_at DESC);
CREATE INDEX idx_call_results_type ON callcenter_call_results(result_type);
CREATE INDEX idx_call_results_next_contact ON callcenter_call_results(next_contact_at)
    WHERE next_contact_at IS NOT NULL;

ALTER TABLE callcenter_call_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read call results" ON callcenter_call_results
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert call results" ON callcenter_call_results
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- ==================== CALLCENTER STATUS na prospects ====================
-- Přidat sloupce pro callcenter tracking na existující tabulku prospects

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS callcenter_status TEXT
    CHECK (callcenter_status IN ('queued', 'in_progress', 'completed', 'paused'))
    DEFAULT NULL;

ALTER TABLE prospects ADD COLUMN IF NOT EXISTS callcenter_assigned_at TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS callcenter_last_called_at TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS callcenter_total_calls INTEGER DEFAULT 0;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS callcenter_next_contact_at TIMESTAMPTZ;

CREATE INDEX idx_prospects_callcenter_status ON prospects(callcenter_status)
    WHERE callcenter_status IS NOT NULL;
CREATE INDEX idx_prospects_callcenter_next ON prospects(callcenter_next_contact_at)
    WHERE callcenter_next_contact_at IS NOT NULL;

-- ==================== VIEW pro callcenter přehled ====================
CREATE OR REPLACE VIEW callcenter_prospect_overview AS
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
    -- Primární kontakt
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
    -- Počet kontaktů
    (SELECT COUNT(*) FROM prospect_contacts pc WHERE pc.prospect_id = p.id) AS contact_count,
    -- Poslední výsledek hovoru
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
LEFT JOIN company_segments cs ON p.segment_id = cs.id
WHERE p.callcenter_status IS NOT NULL;

-- ==================== KOMENTÁŘE ====================
COMMENT ON TABLE callcenter_api_keys IS 'API klíče pro externí callcentrum systémy (Web-nabídky)';
COMMENT ON TABLE callcenter_call_results IS 'Výsledky hovorů z callcentra — žádná duplikace kontaktů';
COMMENT ON COLUMN prospects.callcenter_status IS 'Status prospektu v callcentru: queued/in_progress/completed/paused';
COMMENT ON VIEW callcenter_prospect_overview IS 'Přehled prospektů pro callcentrum s primárním kontaktem a posledním výsledkem';
