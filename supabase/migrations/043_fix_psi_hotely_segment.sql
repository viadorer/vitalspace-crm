-- ============================================================================
-- Oprava špatně přiřazeného segmentu u prospektů
-- ============================================================================
-- Prospects s "Psí a kočičí hotely / útulky" mají správně mít segment "Hotely"
-- ============================================================================

UPDATE prospects
SET segment_id = (
  SELECT id FROM company_segments WHERE name = 'Hotely' LIMIT 1
)
WHERE segment_id = (
  SELECT id FROM company_segments WHERE name = 'Psí a kočičí hotely / útulky' LIMIT 1
);

-- Poznámka: Tato migrace opravuje chybně přiřazený segment
-- Segment "Psí a kočičí hotely / útulky" byl použit omylem místo "Hotely"
