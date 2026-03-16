-- ============================================================================
-- VITALSPACE - Oprava storage politik (bezpečnost)
-- ============================================================================
-- Nahrazení veřejných politik za authenticated-only
-- ============================================================================

-- Smazat staré veřejné politiky
DROP POLICY IF EXISTS "Allow public read access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access to documents bucket" ON storage.objects;

-- Nové politiky jen pro přihlášené uživatele
CREATE POLICY "Allow authenticated read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow authenticated delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
