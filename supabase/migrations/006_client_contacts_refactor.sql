-- ============================================================================
-- VITALSPACE - Refaktoring: Client Contacts
-- ============================================================================
-- Úprava struktury clients aby podporovala více kontaktních osob
-- Přidání segmentu a lokace ke klientům
-- ============================================================================

-- 1. VYTVOŘENÍ TABULKY PRO KONTAKTNÍ OSOBY KLIENTŮ
-- ============================================================================

CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    linkedin_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_decision_maker BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX idx_client_contacts_primary ON client_contacts(is_primary) WHERE is_primary = true;

-- 2. PŘIDÁNÍ SLOUPCŮ DO CLIENTS
-- ============================================================================

ALTER TABLE clients ADD COLUMN segment_id UUID REFERENCES company_segments(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN region TEXT DEFAULT 'Plzeňský kraj'
    CHECK (region IN ('Plzeňský kraj', 'Praha', 'Středočeský kraj', 'Ostatní'));
ALTER TABLE clients ADD COLUMN city TEXT;
ALTER TABLE clients ADD COLUMN address TEXT;
ALTER TABLE clients ADD COLUMN website TEXT;
ALTER TABLE clients ADD COLUMN notes TEXT;

CREATE INDEX idx_clients_segment ON clients(segment_id);
CREATE INDEX idx_clients_region ON clients(region);

-- 3. MIGRACE EXISTUJÍCÍCH DAT
-- ============================================================================
-- Pokud existují klienti s contact_person, vytvoříme pro ně kontakt

DO $$
DECLARE
    client_record RECORD;
BEGIN
    FOR client_record IN 
        SELECT id, contact_person, email, phone 
        FROM clients 
        WHERE contact_person IS NOT NULL OR email IS NOT NULL OR phone IS NOT NULL
    LOOP
        INSERT INTO client_contacts (
            client_id,
            first_name,
            last_name,
            email,
            phone,
            is_primary,
            is_decision_maker
        ) VALUES (
            client_record.id,
            split_part(client_record.contact_person, ' ', 1),
            COALESCE(split_part(client_record.contact_person, ' ', 2), client_record.contact_person),
            client_record.email,
            client_record.phone,
            true,
            true
        );
    END LOOP;
END $$;

-- 4. ODSTRANĚNÍ ZÁVISLÝCH VIEWS
-- ============================================================================

DROP VIEW IF EXISTS v_upcoming_services;

-- 5. ODSTRANĚNÍ STARÝCH SLOUPCŮ
-- ============================================================================

ALTER TABLE clients DROP COLUMN IF EXISTS contact_person;
ALTER TABLE clients DROP COLUMN IF EXISTS email;
ALTER TABLE clients DROP COLUMN IF EXISTS phone;

-- 6. ZNOVU VYTVOŘENÍ VIEW (bez email a phone sloupců)
-- ============================================================================

CREATE VIEW v_upcoming_services AS
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

-- 7. KOMENTÁŘE PRO DOKUMENTACI
-- ============================================================================

COMMENT ON TABLE client_contacts IS 'Kontaktní osoby klientů - jedna firma může mít více kontaktů s různými funkcemi';
COMMENT ON COLUMN client_contacts.is_primary IS 'Primární kontakt pro běžnou komunikaci';
COMMENT ON COLUMN client_contacts.is_decision_maker IS 'Má rozhodovací pravomoc pro nákupy';
COMMENT ON COLUMN clients.segment_id IS 'Segment firmy (převzatý z prospectu nebo přiřazený manuálně)';
