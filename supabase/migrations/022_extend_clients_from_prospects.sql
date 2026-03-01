-- ============================================================================
-- Rozšíření clients tabulky o sloupce z prospects
-- ============================================================================
-- Při konverzi prospect→klient zachováme všechna důležitá data

ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES company_segments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Plzeňský kraj',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS employees_count_est INTEGER,
ADD COLUMN IF NOT EXISTS estimated_floor_area_m2 FLOAT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS assigned_consultant TEXT;

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_clients_segment ON clients(segment_id);
CREATE INDEX IF NOT EXISTS idx_clients_region ON clients(region);
CREATE INDEX IF NOT EXISTS idx_clients_consultant ON clients(assigned_consultant);

COMMENT ON COLUMN clients.segment_id IS 'Segment firmy (převzato z prospectu)';
COMMENT ON COLUMN clients.region IS 'Region působnosti';
COMMENT ON COLUMN clients.city IS 'Město sídla';
COMMENT ON COLUMN clients.address IS 'Adresa (ulice a číslo)';
COMMENT ON COLUMN clients.website IS 'Webová stránka';
COMMENT ON COLUMN clients.employees_count_est IS 'Odhad počtu zaměstnanců';
COMMENT ON COLUMN clients.estimated_floor_area_m2 IS 'Odhad plochy prostor v m²';
COMMENT ON COLUMN clients.source IS 'Zdroj získání (Firmy.cz, LinkedIn, Referral...)';
COMMENT ON COLUMN clients.notes IS 'Poznámky ke klientovi';
COMMENT ON COLUMN clients.assigned_consultant IS 'Přiřazený konzultant';
