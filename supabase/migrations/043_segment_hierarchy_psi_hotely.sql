-- ============================================================================
-- Přidání hierarchie segmentů a přesunutí "Psí a kočičí hotely" pod "Hotely"
-- ============================================================================

-- Krok 1: Přidat sloupec parent_id do company_segments (pokud neexistuje)
ALTER TABLE company_segments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES company_segments(id) ON DELETE SET NULL;

-- Krok 2: Vytvořit index pro rychlejší dotazy na hierarchii
CREATE INDEX IF NOT EXISTS idx_company_segments_parent_id ON company_segments(parent_id);

-- Krok 3: Nastavit "Psí a kočičí hotely / útulky" jako child segment "Hotelů"
UPDATE company_segments
SET parent_id = (
  SELECT id FROM company_segments WHERE name = 'Hotely' LIMIT 1
)
WHERE name = 'Psí a kočičí hotely / útulky';

-- Poznámka: Tato migrace přidává možnost hierarchie segmentů
-- parent_id = NULL znamená top-level segment
-- parent_id = <uuid> znamená child segment
