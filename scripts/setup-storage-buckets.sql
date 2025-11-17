-- ============================================
-- Complete Storage Bucket Setup for MentorLink
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/*']),
  ('notes', 'notes', true, 52428800, ARRAY['application/pdf']),
  ('watermarked-notes', 'watermarked-notes', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
DROP POLICY IF EXISTS "avatars_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
DROP POLICY IF EXISTS "notes_public_read" ON storage.objects;
DROP POLICY IF EXISTS "notes_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "notes_owner_update" ON storage.objects;
DROP POLICY IF EXISTS "notes_owner_delete" ON storage.objects;
DROP POLICY IF EXISTS "watermarked_buyer_read" ON storage.objects;
DROP POLICY IF EXISTS "watermarked_system_insert" ON storage.objects;

-- Step 3: Avatars bucket policies
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "avatars_user_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "avatars_user_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 4: Notes bucket policies
CREATE POLICY "notes_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');

CREATE POLICY "notes_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notes' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "notes_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "notes_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Watermarked notes bucket policies
CREATE POLICY "watermarked_buyer_read"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'watermarked-notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "watermarked_system_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'watermarked-notes');

-- Verify setup
SELECT 
  id, 
  name, 
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;
