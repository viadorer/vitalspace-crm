-- Add deal_id column to crm_documents so documents can be linked to deals
ALTER TABLE crm_documents ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL;
ALTER TABLE crm_documents ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'other';
ALTER TABLE crm_documents ADD COLUMN IF NOT EXISTS file_size_bytes INTEGER;

CREATE INDEX IF NOT EXISTS idx_crm_documents_deal_id ON crm_documents(deal_id);

-- Add missing RLS policies for deal_items
DROP POLICY IF EXISTS "Allow authenticated select deal_items" ON deal_items;
DROP POLICY IF EXISTS "Allow authenticated insert deal_items" ON deal_items;
DROP POLICY IF EXISTS "Allow authenticated update deal_items" ON deal_items;
DROP POLICY IF EXISTS "Allow authenticated delete deal_items" ON deal_items;

ALTER TABLE deal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select deal_items" ON deal_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert deal_items" ON deal_items
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update deal_items" ON deal_items
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete deal_items" ON deal_items
    FOR DELETE TO authenticated USING (true);
