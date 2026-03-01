-- Documents & Presentations table
-- Drop existing table if it exists (clean restart)
DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
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

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_is_active ON documents(is_active);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON documents FOR SELECT USING (true);
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (true);
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (true);
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (true);

-- Storage bucket 'documents' must be created via Supabase Dashboard or API
-- Go to Supabase Dashboard → Storage → New Bucket → name: "documents", public: true
