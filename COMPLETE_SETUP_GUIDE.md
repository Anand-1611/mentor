# 🚀 Complete Supabase Setup Guide

## Current Issues

1. ❌ No database tables found
2. ❌ Storage bucket not found for profile pictures
3. ❌ App not working

## ✅ Complete Fix (10 minutes)

Follow these steps **in order**:

---

## Step 1: Set Up Database Tables

### Option A: Using Supabase CLI (Fastest - 2 minutes)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref kdtcwnnddukdbgkylmxq

# Push all migrations (creates all tables)
supabase db push
```

### Option B: Using Supabase Dashboard (Manual - 10 minutes)

1. **Go to SQL Editor**:
   ```
   https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new
   ```

2. **Copy and run the main schema** from:
   ```
   supabase/migrations/20251112191710_ec7743e7-ad70-4e49-9e77-878395483511.sql
   ```

3. **Then run each additional migration** in order (files in `supabase/migrations/`)

---

## Step 2: Create Storage Buckets

### Go to Storage Settings

```
https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/storage/buckets
```

### Create These 3 Buckets:

#### Bucket 1: `avatars` (Profile Pictures)

1. Click **"New bucket"**
2. **Name**: `avatars`
3. **Public bucket**: ✅ YES (check this box)
4. **File size limit**: 2 MB
5. **Allowed MIME types**: `image/*`
6. Click **"Create bucket"**

#### Bucket 2: `notes` (PDF Files)

1. Click **"New bucket"**
2. **Name**: `notes`
3. **Public bucket**: ✅ YES (check this box)
4. **File size limit**: 50 MB
5. **Allowed MIME types**: `application/pdf`
6. Click **"Create bucket"**

#### Bucket 3: `watermarked-notes` (Purchased PDFs)

1. Click **"New bucket"**
2. **Name**: `watermarked-notes`
3. **Public bucket**: ❌ NO (leave unchecked - private)
4. **File size limit**: 50 MB
5. **Allowed MIME types**: `application/pdf`
6. Click **"Create bucket"**

---

## Step 3: Set Bucket Policies

For each bucket, you need to set access policies.

### For `avatars` bucket:

1. Click on `avatars` bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Custom"**
5. Add these policies:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Users can update their own**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Users can delete their own**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### For `notes` bucket:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notes' 
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Owners can update**
```sql
CREATE POLICY "Owners can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: Owners can delete**
```sql
CREATE POLICY "Owners can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### For `watermarked-notes` bucket:

**Policy 1: Buyers can read their purchases**
```sql
CREATE POLICY "Buyers can read purchased notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'watermarked-notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: System can insert**
```sql
CREATE POLICY "System can insert watermarked files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'watermarked-notes');
```

---

## Step 4: Quick Setup Using SQL (Fastest!)

Instead of clicking through the UI, you can run this SQL in the SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/*']),
  ('notes', 'notes', true, 52428800, ARRAY['application/pdf']),
  ('watermarked-notes', 'watermarked-notes', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Avatars bucket policies
CREATE POLICY IF NOT EXISTS "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Notes bucket policies
CREATE POLICY IF NOT EXISTS "Public read notes"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');

CREATE POLICY IF NOT EXISTS "Authenticated upload notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'notes' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Owners update notes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Owners delete notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Watermarked notes bucket policies
CREATE POLICY IF NOT EXISTS "Buyers read watermarked"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'watermarked-notes'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "System insert watermarked"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'watermarked-notes');
```

---

## Step 5: Verify Setup

### Check Tables

Run this in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ✅ profiles
- ✅ notes
- ✅ transactions
- ✅ bookings
- ✅ messages
- ✅ reviews
- ✅ And more...

### Check Buckets

Run this in SQL Editor:

```sql
SELECT id, name, public 
FROM storage.buckets;
```

You should see:
- ✅ avatars (public: true)
- ✅ notes (public: true)
- ✅ watermarked-notes (public: false)

---

## Step 6: Test Your App

```bash
# Restart dev server
npm run dev

# Open in browser
# http://localhost:5173

# Test these features:
# 1. Sign up / Login ✅
# 2. Upload profile picture ✅
# 3. Browse notes ✅
# 4. Upload a note ✅
# 5. Try mock payment ✅
```

---

## Troubleshooting

### "Bucket not found" error

**Solution**: Make sure you created all 3 buckets with exact names:
- `avatars` (not `avatar`)
- `notes` (not `note`)
- `watermarked-notes` (not `watermarked_notes`)

### "Permission denied" error

**Solution**: Check bucket policies are set correctly

### "Table does not exist" error

**Solution**: Run database migrations first

### Still having issues?

1. **Check Supabase project URL** is correct in `.env`
2. **Check API key** is correct
3. **Clear browser cache** and reload
4. **Check Supabase logs**:
   ```
   https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/logs/explorer
   ```

---

## Quick Commands Reference

```bash
# Database setup
supabase login
supabase link --project-ref kdtcwnnddukdbgkylmxq
supabase db push

# Check status
supabase db diff

# View remote changes
supabase db pull

# Reset database (⚠️ DANGER: Deletes all data)
supabase db reset
```

---

## Summary

**What you need to do**:

1. ✅ **Database**: Run `supabase db push` OR run migrations manually
2. ✅ **Storage**: Create 3 buckets (avatars, notes, watermarked-notes)
3. ✅ **Policies**: Set access policies for each bucket
4. ✅ **Test**: Restart app and test all features

**Time required**: 10 minutes

**After this**: Everything will work! 🎉

---

## Need Help?

**Supabase Dashboard**:
- Project: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq
- SQL Editor: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql
- Storage: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/storage/buckets
- Logs: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/logs/explorer

**Documentation**:
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase CLI: https://supabase.com/docs/guides/cli

---

**Status**: Complete setup guide ready
**Date**: 2024-11-17
**Priority**: Critical - Required for app to work
