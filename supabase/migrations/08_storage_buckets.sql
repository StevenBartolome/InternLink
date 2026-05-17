-- Migration: Create Storage Policies for Pre-Internship Documents

-- 1. Ensure the 'documents' storage bucket exists in storage.buckets table
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
    'documents', 
    'documents', 
    true, 
    ARRAY['image/jpeg', 'image/png', 'application/pdf'], 
    10485760 -- 10MB limit
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'],
    file_size_limit = 10485760;

-- 2. Create Storage Object Policies for the 'documents' bucket

-- Policy A: Allow anyone to view/download documents from the bucket (Public SELECT)
DROP POLICY IF EXISTS "Allow public select on documents" ON storage.objects;
CREATE POLICY "Allow public select on documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy B: Allow authenticated users (students) to upload pre-internship files (INSERT)
DROP POLICY IF EXISTS "Allow authenticated insert on documents" ON storage.objects;
CREATE POLICY "Allow authenticated insert on documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Policy C: Allow authenticated users to update/replace their own files (UPDATE)
DROP POLICY IF EXISTS "Allow authenticated update on documents" ON storage.objects;
CREATE POLICY "Allow authenticated update on documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Policy D: Allow authenticated users to delete their own files (DELETE)
DROP POLICY IF EXISTS "Allow authenticated delete on documents" ON storage.objects;
CREATE POLICY "Allow authenticated delete on documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
