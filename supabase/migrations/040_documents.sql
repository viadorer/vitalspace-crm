-- CRM Documents & Presentations table
-- Note: Using 'crm_documents' to avoid conflict with existing 'documents' table for deals
DROP TABLE IF EXISTS crm_documents CASCADE;

CREATE TABLE crm_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'document',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  page_count INTEGER,
  tags TEXT[] DEFAULT '{}',
  uploaded_by TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_crm_documents_category ON crm_documents(category);
CREATE INDEX idx_crm_documents_is_active ON crm_documents(is_active);
CREATE INDEX idx_crm_documents_created_at ON crm_documents(created_at DESC);

-- RLS
ALTER TABLE crm_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_documents_select" ON crm_documents FOR SELECT USING (true);
CREATE POLICY "crm_documents_insert" ON crm_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "crm_documents_update" ON crm_documents FOR UPDATE USING (true);
CREATE POLICY "crm_documents_delete" ON crm_documents FOR DELETE USING (true);

-- IMPORTANT: Storage bucket 'documents' must be created manually in Supabase Dashboard
-- 
-- Steps:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Settings:
--    - Name: documents
--    - Public bucket: ON (checked)
--    - File size limit: 50 MB
--    - Allowed MIME types: application/pdf
-- 4. Click "Create bucket"
--
-- Note: Bucket cannot be created via SQL migration due to RLS policies
