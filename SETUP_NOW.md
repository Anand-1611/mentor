# 🚀 Setup Your Database NOW (2 Steps)

## Your Issues

- ❌ No tables found
- ❌ Bucket not found for profile pictures
- ❌ App not working

## ✅ Fix in 2 Steps (5 minutes)

---

## Step 1: Set Up Database Tables (2 minutes)

### Using Terminal:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref kdtcwnnddukdbgkylmxq

# Push migrations (creates all tables)
supabase db push
```

**Done!** ✅ All tables created

---

## Step 2: Set Up Storage Buckets (3 minutes)

### Go to SQL Editor:

```
https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new
```

### Copy and paste this entire script:

```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/*']),
  ('notes', 'notes', true, 52428800, ARRAY['application/pdf']),
  ('watermarked-notes', 'watermarked-notes', false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies (to avoid conflicts)
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

-- Avatars policies
CREATE POLICY "avatars_public_read"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_user_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_user_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Notes policies
CREATE POLICY "notes_public_read"
ON storage.objects FOR SELECT USING (bucket_id = 'notes');

CREATE POLICY "notes_authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');

CREATE POLICY "notes_owner_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "notes_owner_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Watermarked notes policies
CREATE POLICY "watermarked_buyer_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'watermarked-notes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "watermarked_system_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'watermarked-notes');
```

### Click "Run" button

**Done!** ✅ All buckets and policies created

---

## Step 3: Test Your App

```bash
# Restart dev server
npm run dev
```

### Test These:

1. ✅ Sign up / Login
2. ✅ Upload profile picture (should work now!)
3. ✅ Browse notes (should work now!)
4. ✅ Upload a note
5. ✅ Try mock payment

---

## Verify Setup

### Check Tables:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;
```

Should see: profiles, notes, transactions, bookings, etc.

### Check Buckets:

```sql
SELECT id, name, public FROM storage.buckets;
```

Should see:
- avatars (public: true)
- notes (public: true)
- watermarked-notes (public: false)

---

## That's It!

**Total time**: 5 minutes
**Result**: Fully working app! 🎉

---

## Quick Links

- **SQL Editor**: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new
- **Storage**: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/storage/buckets
- **Tables**: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/editor

---

**Status**: Ready to set up
**Time**: 5 minutes
**Difficulty**: Easy (just copy-paste!)
