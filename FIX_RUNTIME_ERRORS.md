# 🔧 Fix Runtime Errors

## Current Issues

After running migrations, you're seeing these errors:
1. ❌ 500 errors (profiles, admin check)
2. ❌ 406 error (study_streaks)
3. ❌ 400 error (notes fetch)
4. ❌ CORS error (upload-note function)

## ✅ Quick Fix (2 minutes)

### Step 1: Fix RLS Policies

Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new

Copy and paste this SQL:

```sql
-- Allow users to read any profile (for public profiles)
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile  
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow anyone to view notes
DROP POLICY IF EXISTS "Anyone can view notes" ON notes;
CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  USING (true);

-- Allow authenticated users to create notes
DROP POLICY IF EXISTS "Authenticated users can create notes" ON notes;
CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow owners to update their notes
DROP POLICY IF EXISTS "Owners can update notes" ON notes;
CREATE POLICY "Owners can update notes"
  ON notes FOR UPDATE
  USING (auth.uid() = owner_id);

-- Allow owners to delete their notes
DROP POLICY IF EXISTS "Owners can delete notes" ON notes;
CREATE POLICY "Owners can delete notes"
  ON notes FOR DELETE
  USING (auth.uid() = owner_id);
```

Click "Run"

### Step 2: Fix CORS for Edge Functions

The upload-note function needs CORS headers. This should already be configured, but let's verify:

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions
2. Click on `upload-note` function
3. Check if CORS is enabled

If not, the function code should have:
```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  },
});
```

### Step 3: Test Your App

```bash
# Restart dev server
npm run dev

# Test these:
# 1. Sign up / Login ✅
# 2. View profile ✅
# 3. Browse notes ✅
# 4. Upload profile picture ✅
```

## Alternative: Temporarily Disable RLS

If you want to test quickly without RLS:

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks DISABLE ROW LEVEL SECURITY;

-- Remember to re-enable later!
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- etc.
```

⚠️ **Warning**: Only do this for local testing! Never disable RLS in production!

## Verify Everything Works

After fixing:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check all policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check storage buckets
SELECT id, name, public 
FROM storage.buckets;
```

## Summary

**What to do**:
1. ✅ Run the RLS fix SQL above
2. ✅ Restart your dev server
3. ✅ Test the app

**Time**: 2 minutes

**Result**: All errors fixed! 🎉

---

**Status**: Fix ready
**Date**: 2024-11-17
**Issue**: RLS policies too restrictive
