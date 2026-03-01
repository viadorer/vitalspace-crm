-- ============================================================================
-- Přidání chybějících polí do company_segments
-- ============================================================================

ALTER TABLE company_segments 
ADD COLUMN IF NOT EXISTS objections_handling JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_stories TEXT[] DEFAULT '{}';

COMMENT ON COLUMN company_segments.objections_handling IS 'Námitky a jejich řešení (JSONB objekt)';
COMMENT ON COLUMN company_segments.success_stories IS 'Úspěšné případové studie (array stringů)';
