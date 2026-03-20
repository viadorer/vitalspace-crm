-- Fix: Add missing INSERT/UPDATE/DELETE RLS policies for products table
-- Only SELECT existed, causing 406 errors on save/create/delete

DROP POLICY IF EXISTS "Allow authenticated insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated delete products" ON products;

CREATE POLICY "Allow authenticated insert products" ON products
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update products" ON products
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated delete products" ON products
    FOR DELETE TO authenticated
    USING (true);
