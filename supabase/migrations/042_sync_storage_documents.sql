-- Sync existing files from storage.objects to crm_documents table
-- This migration creates records in crm_documents for files that were uploaded before the table existed

-- Insert records for all files in 'documents' bucket that don't have a corresponding record
INSERT INTO crm_documents (
  title,
  description,
  category,
  file_name,
  file_path,
  file_size,
  mime_type,
  is_active,
  created_at,
  updated_at
)
SELECT 
  -- Extract filename without path and timestamp
  REGEXP_REPLACE(name, '^[^/]+/\d+_', '') as title,
  NULL as description,
  -- Extract category from path (first part before /)
  SPLIT_PART(name, '/', 1) as category,
  -- Extract filename
  REGEXP_REPLACE(name, '^[^/]+/\d+_', '') as file_name,
  -- Full path in storage
  name as file_path,
  -- File size from metadata
  COALESCE((metadata->>'size')::integer, 0) as file_size,
  -- MIME type from metadata
  COALESCE(metadata->>'mimetype', 'application/pdf') as mime_type,
  true as is_active,
  created_at,
  created_at as updated_at
FROM storage.objects
WHERE bucket_id = 'documents'
  -- Only insert if not already in crm_documents
  AND NOT EXISTS (
    SELECT 1 FROM crm_documents 
    WHERE crm_documents.file_path = storage.objects.name
  );
