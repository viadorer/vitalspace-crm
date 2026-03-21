-- ============================================================================
-- Zpřísnění RLS politik pro tabulku products
-- Omezení INSERT/UPDATE/DELETE na admin a superadmin role
-- SELECT zůstává otevřený pro všechny přihlášené uživatele
-- ============================================================================

-- Smazat staré příliš volné politiky
DROP POLICY IF EXISTS "Allow authenticated insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete products" ON products;

-- INSERT: pouze admin a superadmin
CREATE POLICY "products_insert_admin_only" ON products
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid()
            AND role IN ('superadmin', 'admin')
            AND is_active = true
        )
    );

-- UPDATE: pouze admin a superadmin
CREATE POLICY "products_update_admin_only" ON products
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid()
            AND role IN ('superadmin', 'admin')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid()
            AND role IN ('superadmin', 'admin')
            AND is_active = true
        )
    );

-- DELETE: pouze superadmin
CREATE POLICY "products_delete_superadmin_only" ON products
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app_users
            WHERE id = auth.uid()
            AND role = 'superadmin'
            AND is_active = true
        )
    );
