-- Storage RLS Policies for 'documents' bucket
-- Allows public access to upload, view, update, and delete files

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update access to documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete access to documents bucket" ON storage.objects;

-- Policy: Allow anyone to SELECT (view/download) files from 'documents' bucket
CREATE POLICY "Allow public read access to documents bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Policy: Allow anyone to INSERT (upload) files to 'documents' bucket
CREATE POLICY "Allow public insert access to documents bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anyone to UPDATE files in 'documents' bucket
CREATE POLICY "Allow public update access to documents bucket"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Policy: Allow anyone to DELETE files from 'documents' bucket
CREATE POLICY "Allow public delete access to documents bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'documents');
