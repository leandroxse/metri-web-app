-- Fix Storage Policies para permitir upload de contratos gerados
-- Execute no Supabase SQL Editor

-- 1. Policies para bucket 'documents'
CREATE POLICY "Allow authenticated uploads to documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read from documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Allow authenticated delete from documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- 2. Policies para bucket 'contract-templates'
CREATE POLICY "Allow authenticated uploads to contract-templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contract-templates');

CREATE POLICY "Allow public read from contract-templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'contract-templates');

-- 3. Policies para bucket 'filled-contracts'
CREATE POLICY "Allow authenticated uploads to filled-contracts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'filled-contracts');

CREATE POLICY "Allow public read from filled-contracts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'filled-contracts');

CREATE POLICY "Allow authenticated delete from filled-contracts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'filled-contracts');
