-- ============================================================================
-- VITALSPACE CRM — Kompletní SQL schéma pro Supabase (PostgreSQL)
-- ============================================================================
-- Hybridní model: Prodej technologických řešení (B2B) + SaaS monitoring
-- Tři pilíře: Nástropní (Clean Up) / Mobilní (PRO I PLUS) / Box (Clean Box DRY)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMERACE A TYPY
-- ============================================================================

CREATE TYPE client_type AS ENUM ('B2B', 'B2C');
CREATE TYPE deal_stage AS ENUM (
    'lead',                 -- Prvotní poptávka / studený kontakt
    'technical_audit',      -- Zaměření prostor, výpočet m³, měření VOC/PM2.5/CO2
    'proposal_sent',        -- Odeslaná kalkulace na míru
    'negotiation',          -- Ladění technických detailů, ceny, montáže
    'contract_signed',      -- Potvrzená objednávka
    'installation',         -- Probíhá montáž (Clean Up do podhledů, rozmístění mobilních)
    'handover',             -- Předání, zaškolení obsluhy, výstupní měření
    'closed_won',           -- Úspěšně dokončeno
    'closed_lost'           -- Neúspěch
);
CREATE TYPE product_category AS ENUM (
    'nastropni',            -- Clean Up moduly
    'mobilni',              -- PRO I PLUS
    'box',                  -- Clean Box DRY
    'prislusenstvi',        -- Senzory, filtry, náhradní díly
    'sluzba'                -- Montáž, servis, měření
);
CREATE TYPE prospect_status AS ENUM (
    'not_contacted',
    'contacted',
    'meeting_scheduled',
    'refused',
    'qualified'             -- Přechází do deals
);
CREATE TYPE touchpoint_type AS ENUM (
    'call', 'email', 'linkedin', 'personal_visit', 'demo', 'webinar', 'referral'
);
CREATE TYPE audit_measurement_type AS ENUM (
    'voc', 'pm25', 'co2', 'formaldehyde', 'ozone_residual'
);

-- ============================================================================
-- 2. SEGMENTACE FIREM
-- ============================================================================

CREATE TABLE company_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,                      -- 'Školství', 'Kanceláře', 'Zdravotnictví', 'Průmysl'
    target_pain_point TEXT,                         -- Hlavní bolest segmentu
    recommended_approach TEXT,                      -- Doporučený prodejní přístup
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. DATABÁZE PROSPEKTŮ (Firmy k oslovení)
-- ============================================================================

CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    ico TEXT UNIQUE,
    dic TEXT,
    segment_id UUID REFERENCES company_segments(id) ON DELETE SET NULL,
    region TEXT DEFAULT 'Plzeňský kraj'
        CHECK (region IN ('Plzeňský kraj', 'Praha', 'Středočeský kraj', 'Ostatní')),
    city TEXT,
    address TEXT,
    website TEXT,
    employees_count_est INTEGER,                    -- Odhad velikosti (koreluje s plochou)
    estimated_floor_area_m2 FLOAT,                  -- Odhad celkové plochy prostor
    source TEXT,                                    -- 'Firmy.cz', 'LinkedIn', 'Referral', 'Web', 'ARES'
    priority INTEGER DEFAULT 3                      -- 1 = highest, 5 = lowest
        CHECK (priority BETWEEN 1 AND 5),
    status prospect_status DEFAULT 'not_contacted',
    notes TEXT,
    assigned_consultant TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospects_status ON prospects(status);
CREATE INDEX idx_prospects_region ON prospects(region);
CREATE INDEX idx_prospects_priority ON prospects(priority);
CREATE INDEX idx_prospects_segment ON prospects(segment_id);

-- ============================================================================
-- 4. KONTAKTNÍ OSOBY PROSPEKTŮ
-- ============================================================================

CREATE TABLE prospect_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT NOT NULL,
    position TEXT,                                  -- 'Facility Manager', 'Ředitel', 'HR', 'BOZP'
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    is_decision_maker BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_prospect_contacts_prospect ON prospect_contacts(prospect_id);

-- ============================================================================
-- 5. HISTORIE KOMUNIKACE S PROSPEKTY (Touchpoints)
-- ============================================================================

CREATE TABLE touchpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES prospect_contacts(id) ON DELETE SET NULL,
    type touchpoint_type NOT NULL,
    subject TEXT,                                    -- Předmět / téma komunikace
    summary TEXT,                                    -- Co se řešilo
    outcome TEXT,                                    -- Výsledek ('Poslat materiály', 'Nemají zájem - cena')
    next_action TEXT,                                -- Co udělat příště
    next_action_date DATE,
    consultant_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_touchpoints_prospect ON touchpoints(prospect_id);
CREATE INDEX idx_touchpoints_next_action ON touchpoints(next_action_date);

-- ============================================================================
-- 6. KLIENTI (Konvertovaní z prospektů nebo přímí)
-- ============================================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,   -- Odkaz na původní prospekt
    company_name TEXT NOT NULL,
    type client_type DEFAULT 'B2B',
    ico TEXT,
    dic TEXT,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    billing_address JSONB,                          -- {street, city, zip, country}
    delivery_address JSONB,                         -- Může se lišit od fakturační
    payment_terms_days INTEGER DEFAULT 14,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_ico ON clients(ico);

-- ============================================================================
-- 7. KATALOG PRODUKTŮ A SLUŽEB
-- ============================================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,                        -- 'VC-CLEAN-UP-20', 'VC-PRO-I-40', 'VC-BOX-DRY-10'
    name TEXT NOT NULL,
    category product_category NOT NULL,
    ozone_output_gh FLOAT,                          -- Výkon v g/h (0 pro služby)
    coverage_m3_max FLOAT,                          -- Max. objem místnosti pro efektivní sanitaci
    dimensions TEXT,                                 -- '595x595x150 mm'
    weight_kg FLOAT,
    power_consumption_w INTEGER,
    description TEXT,
    base_price_czk DECIMAL(12,2) NOT NULL,
    installation_required BOOLEAN DEFAULT false,     -- True pro nástropní Clean Up
    installation_price_czk DECIMAL(12,2) DEFAULT 0,
    warranty_months INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 8. OBCHODNÍ PŘÍPADY (Deals / Pipeline)
-- ============================================================================

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,   -- Může existovat deal i bez klienta (fáze lead)
    deal_number TEXT UNIQUE,                         -- Číslo nabídky: 'VS-2025-0001'
    title TEXT NOT NULL,
    stage deal_stage DEFAULT 'lead',
    
    -- Finanční souhrn
    total_hardware_czk DECIMAL(12,2) DEFAULT 0,
    total_installation_czk DECIMAL(12,2) DEFAULT 0,
    total_service_czk DECIMAL(12,2) DEFAULT 0,
    total_value_czk DECIMAL(12,2) DEFAULT 0,        -- Celková hodnota = HW + instalace + služby
    discount_percent DECIMAL(5,2) DEFAULT 0,
    final_price_czk DECIMAL(12,2) DEFAULT 0,
    
    -- Plánování
    estimated_close_date DATE,
    estimated_installation_date DATE,
    installation_deadline DATE,
    
    -- Přiřazení
    assigned_consultant TEXT,
    
    -- Důvod ztráty (pokud closed_lost)
    lost_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_prospect ON deals(prospect_id);

-- ============================================================================
-- 9. POLOŽKY NABÍDKY (Deal Items)
-- ============================================================================
-- Jedna nabídka = N zařízení + montáže + služby

CREATE TABLE deal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    unit_price_czk DECIMAL(12,2) NOT NULL,           -- Cena v době nabídky (fixovaná)
    discount_percent DECIMAL(5,2) DEFAULT 0,
    line_total_czk DECIMAL(12,2) GENERATED ALWAYS AS (
        quantity * unit_price_czk * (1 - discount_percent / 100)
    ) STORED,
    
    -- Technické detaily pro konkrétní umístění
    target_room TEXT,                                -- 'Učebna 3.A', 'Sklad B', 'Recepce'
    installation_notes TEXT,                         -- 'Podhled Armstrong, výška 2.7m'
    serial_number TEXT,                              -- Vyplní se po dodání
    
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deal_items_deal ON deal_items(deal_id);

-- ============================================================================
-- 10. TECHNICKÝ AUDIT PROSTOR
-- ============================================================================
-- Klíčová diferenciace Vitalspace: měříme PŘED a PO

CREATE TABLE technical_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Identifikace místnosti
    building_name TEXT,                              -- 'Budova A'
    floor_number INTEGER,
    room_name TEXT NOT NULL,                         -- 'Učebna 3.A'
    room_purpose TEXT,                               -- 'Výuka', 'Sklad', 'Kancelář'
    
    -- Rozměry
    area_m2 FLOAT,
    ceiling_height_m FLOAT DEFAULT 2.7,
    volume_m3 FLOAT,                                 -- = area_m2 * ceiling_height_m
    
    -- Stavební specifika pro montáž
    has_suspended_ceiling BOOLEAN DEFAULT false,      -- Kazetový podhled pro Clean Up
    ceiling_type TEXT,                               -- 'Armstrong', 'Rockfon', 'SDK', 'Beton'
    ceiling_load_capacity_kg_m2 FLOAT,               -- Min 20 kg/m² pro Clean Up
    has_230v_nearby BOOLEAN DEFAULT true,
    ventilation_type TEXT,                            -- 'Přirozená', 'Nucená', 'Rekuperace'
    
    -- Doporučení
    recommended_product_id UUID REFERENCES products(id),
    recommended_quantity INTEGER DEFAULT 1,
    
    auditor_name TEXT,
    audit_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audits_deal ON technical_audits(deal_id);

-- ============================================================================
-- 11. MĚŘENÍ KVALITY VZDUCHU (Před / Po sanitaci)
-- ============================================================================

CREATE TABLE air_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES technical_audits(id) ON DELETE CASCADE,
    measurement_type audit_measurement_type NOT NULL,
    value_before FLOAT,                              -- Naměřená hodnota PŘED zásahem
    value_after FLOAT,                               -- Naměřená hodnota PO zásahu
    unit TEXT DEFAULT 'µg/m³',                       -- Jednotka měření
    threshold_safe FLOAT,                            -- Bezpečnostní limit
    measured_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT
);

CREATE INDEX idx_measurements_audit ON air_measurements(audit_id);

-- ============================================================================
-- 12. INSTALACE A SERVISNÍ ZÁZNAMY
-- ============================================================================

CREATE TABLE installations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    deal_item_id UUID REFERENCES deal_items(id) ON DELETE SET NULL,
    
    status TEXT DEFAULT 'planned'
        CHECK (status IN ('planned', 'in_progress', 'completed', 'issue')),
    
    technician_name TEXT,
    scheduled_date DATE,
    completed_date DATE,
    
    -- Technické údaje
    device_serial_number TEXT,
    device_model TEXT,
    installation_location TEXT,                      -- 'Podhled nad pozicí C3'
    
    -- Bezpečnostní protokol
    safety_check_passed BOOLEAN DEFAULT false,       -- Kontrola před spuštěním
    organisms_removed_confirmed BOOLEAN DEFAULT false,-- Potvrzení evakuace živých organismů
    
    -- Výstupní měření po instalaci
    ozone_concentration_max FLOAT,
    ozone_decay_minutes INTEGER,                     -- Čas rozpadu na bezpečnou úroveň
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_installations_deal ON installations(deal_id);
CREATE INDEX idx_installations_status ON installations(status);

-- ============================================================================
-- 13. HISTORIE ZMĚN PIPELINE STAGE (Audit Trail)
-- ============================================================================

CREATE TABLE deal_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    from_stage deal_stage,
    to_stage deal_stage NOT NULL,
    changed_by TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stage_history_deal ON deal_stage_history(deal_id);

-- ============================================================================
-- 14. POZNÁMKY A AKTIVITY K DEALU
-- ============================================================================

CREATE TABLE deal_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'note'
        CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'document')),
    subject TEXT,
    body TEXT,
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_deal_activities_deal ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_due ON deal_activities(due_date) WHERE NOT is_completed;

-- ============================================================================
-- 15. DOKUMENTY A PŘÍLOHY
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    doc_type TEXT CHECK (doc_type IN (
        'proposal',          -- Nabídka PDF
        'contract',          -- Smlouva
        'technical_report',  -- Technický audit
        'certificate',       -- Protokol o environmentální detoxikaci
        'invoice',           -- Faktura
        'photo',             -- Fotodokumentace
        'other'
    )),
    title TEXT NOT NULL,
    file_path TEXT,                                   -- Supabase Storage path
    file_size_bytes BIGINT,
    mime_type TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_deal ON documents(deal_id);

-- ============================================================================
-- 16. SaaS SUBSCRIPTIONS (Pro paušální model)
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    
    plan_name TEXT NOT NULL,                          -- 'SaaS Monthly', 'Quarterly Service'
    monthly_fee_czk DECIMAL(12,2),
    billing_start DATE,
    billing_end DATE,                                 -- NULL = ongoing
    next_service_date DATE,                           -- Automatický ticket pro plánovaný servis
    
    status TEXT DEFAULT 'active'
        CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    
    includes_monitoring BOOLEAN DEFAULT false,        -- IoT real-time monitoring
    includes_seasonal_sanitation BOOLEAN DEFAULT true, -- Sezónní servis
    
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_next_service ON subscriptions(next_service_date);

-- ============================================================================
-- 17. VIEWS — Užitečné pohledy pro obchodníky
-- ============================================================================

-- Pondělní přehled: Neoslovené firmy s vysokou prioritou
CREATE VIEW v_hot_prospects AS
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

-- Pipeline overview: Aktuální stav obchodních případů
CREATE VIEW v_pipeline_overview AS
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

-- Technický audit: Kolik g/h ozonu potřebujeme pro budovu
CREATE VIEW v_building_ozone_requirements AS
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

-- Měsíční výkon: Uzavřené dealy
CREATE VIEW v_monthly_revenue AS
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

-- Nadcházející servis (SaaS subscribers)
CREATE VIEW v_upcoming_services AS
SELECT 
    s.id AS subscription_id,
    c.company_name,
    c.email,
    c.phone,
    s.plan_name,
    s.next_service_date,
    s.next_service_date - CURRENT_DATE AS days_until_service
FROM subscriptions s
JOIN clients c ON c.id = s.client_id
WHERE s.status = 'active'
  AND s.next_service_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY s.next_service_date ASC;

-- ============================================================================
-- 18. FUNKCE — Automatická kalkulace deal total
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_recalculate_deal_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deals SET
        total_hardware_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM deal_items di
            JOIN products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category IN ('nastropni', 'mobilni', 'box', 'prislusenstvi')
        ),
        total_installation_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM deal_items di
            JOIN products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category = 'sluzba'
              AND p.sku LIKE 'SRV-INST%'
        ),
        total_service_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM deal_items di
            JOIN products p ON p.id = di.product_id
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
              AND p.category = 'sluzba'
              AND p.sku NOT LIKE 'SRV-INST%'
        ),
        total_value_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM deal_items di
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
        ),
        final_price_czk = (
            SELECT COALESCE(SUM(di.line_total_czk), 0)
            FROM deal_items di
            WHERE di.deal_id = COALESCE(NEW.deal_id, OLD.deal_id)
        ) * (1 - COALESCE(
            (SELECT d2.discount_percent FROM deals d2 WHERE d2.id = COALESCE(NEW.deal_id, OLD.deal_id)),
            0
        ) / 100),
        updated_at = now()
    WHERE id = COALESCE(NEW.deal_id, OLD.deal_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deal_items_recalc
AFTER INSERT OR UPDATE OR DELETE ON deal_items
FOR EACH ROW EXECUTE FUNCTION fn_recalculate_deal_total();

-- ============================================================================
-- 19. FUNKCE — Automatický audit trail pro stage změny
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_log_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO deal_stage_history (deal_id, from_stage, to_stage, changed_by)
        VALUES (NEW.id, OLD.stage, NEW.stage, NEW.assigned_consultant);
        
        -- Automaticky nastavit closed_at
        IF NEW.stage IN ('closed_won', 'closed_lost') THEN
            NEW.closed_at = now();
        END IF;
        
        NEW.updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deal_stage_change
BEFORE UPDATE ON deals
FOR EACH ROW EXECUTE FUNCTION fn_log_stage_change();

-- ============================================================================
-- 20. FUNKCE — Auto-výpočet objemu místnosti
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calc_room_volume()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.area_m2 IS NOT NULL AND NEW.ceiling_height_m IS NOT NULL THEN
        NEW.volume_m3 = NEW.area_m2 * NEW.ceiling_height_m;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_volume
BEFORE INSERT OR UPDATE ON technical_audits
FOR EACH ROW EXECUTE FUNCTION fn_calc_room_volume();

-- ============================================================================
-- 21. ROW LEVEL SECURITY (Supabase RLS)
-- ============================================================================

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Základní politika: authenticated users mají přístup ke všemu
-- (upřesnit dle rolí: admin, consultant, technician)
CREATE POLICY "Authenticated access" ON prospects FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON clients FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON deals FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON deal_items FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON technical_audits FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON touchpoints FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON installations FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON documents FOR ALL
    USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access" ON subscriptions FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================================================
-- 22. SEED DATA — Produkty a segmenty
-- ============================================================================

INSERT INTO products (sku, name, category, ozone_output_gh, coverage_m3_max, dimensions, weight_kg, power_consumption_w, base_price_czk, installation_required, installation_price_czk, description)
VALUES 
    ('VC-CLEAN-UP-20', 'Vitalspace Clean Up', 'nastropni', 20.0, 80, '595×595×150 mm', 8.5, 65, 45000.00, true, 5000.00,
     'Nástropní modul do kazetových podhledů. Dvojitý režim: Osvěžovač (bezpečný za přítomnosti lidí) + Cleaner (totální dezinfekce mimo provoz).'),
    ('VC-PRO-I-40', 'Vitalspace PRO I PLUS', 'mobilni', 40.0, 200, '480×380×650 mm', 21.0, 150, 58000.00, false, 0,
     'Mobilní průmyslový generátor. Mikropočítačem řízený cyklus, automatické chlazení a cirkulace po skončení generování O3.'),
    ('VC-BOX-DRY-10', 'Vitalspace Clean Box DRY', 'box', 10.0, NULL, '800×600×500 mm', 12.0, 45, 32000.00, false, 0,
     'Dezinfekční box pro předměty a oděvy. Cykly 15-45 min dle typu předmětů.'),
    ('SRV-INST-CEILING', 'Montáž Clean Up do podhledu', 'sluzba', NULL, NULL, NULL, NULL, NULL, 5000.00, false, 0,
     'Odborná montáž nástropního modulu včetně elektrického zapojení a revize.'),
    ('SRV-AUDIT', 'Technický audit prostor', 'sluzba', NULL, NULL, NULL, NULL, NULL, 3500.00, false, 0,
     'Profesionální zaměření prostor, měření VOC/PM2.5/CO2, návrh řešení.'),
    ('SRV-CERT', 'Certifikace a protokol', 'sluzba', NULL, NULL, NULL, NULL, NULL, 2000.00, false, 0,
     'Výstupní měření po sanitaci, Protokol o environmentální detoxikaci.');

INSERT INTO company_segments (name, target_pain_point, recommended_approach) VALUES 
    ('Školství a školky', 'Vysoká nemocnost v kolektivech, dezinfekce hraček a učeben', 'Clean Up do tříd + Clean Box do sborovny. Argumentovat snížením absence.'),
    ('Kanceláře a IT centra', 'Formaldehyd z nábytku, sick building syndrom, únava zaměstnanců', 'Clean Up do open-space + PRO I PLUS pro zasedací místnosti. ROI přes produktivitu.'),
    ('Zdravotnictví', 'Sterilní vzduch mezi pacienty, legislativní požadavky', 'Kompletní řešení s certifikací. Důraz na bezpečnostní protokoly.'),
    ('Průmysl a sklady', 'VOC z výroby, zápachy, kontaminace produktů', 'PRO I PLUS pro velké prostory. Kalkulace dle m³.'),
    ('Hotely a wellness', 'Zápachy v pokojích, kvalita vzduchu pro hosty', 'Clean Up do pokojů + PRO I PLUS pro lobby a konferenční sály.'),
    ('Sport a fitness', 'Zápachy v šatnách, dezinfekce přístrojů', 'PRO I PLUS pro haly + Clean Box pro vybavení.');
