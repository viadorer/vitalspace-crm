-- ============================================================================
-- Zpřísnění storage RLS politik
-- READ: všichni přihlášení (dokumenty jsou sdílené v rámci organizace)
-- INSERT: všichni přihlášení (každý může nahrávat)
-- UPDATE/DELETE: pouze vlastník souboru nebo admin/superadmin
-- ============================================================================

-- Smazat staré příliš volné politiky
DROP POLICY IF EXISTS "Allow authenticated update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete documents" ON storage.objects;

-- UPDATE: pouze vlastník nebo admin
CREATE POLICY "storage_update_owner_or_admin" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM app_users
                WHERE id = auth.uid()
                AND role IN ('superadmin', 'admin')
                AND is_active = true
            )
        )
    )
    WITH CHECK (bucket_id = 'documents');

-- DELETE: pouze vlastník nebo admin
CREATE POLICY "storage_delete_owner_or_admin" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'documents'
        AND (
            (storage.foldername(name))[1] = auth.uid()::text
            OR EXISTS (
                SELECT 1 FROM app_users
                WHERE id = auth.uid()
                AND role IN ('superadmin', 'admin')
                AND is_active = true
            )
        )
    );
