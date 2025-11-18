# 🚨 Fix Production Issues - Complete Guide

## Issues Found After Database Fix

After running the database fix, we now have two remaining issues:

### Issue 1: 406 Error on Admin Check
**Error**: `user_roles?select=role&user_id=eq.82aabd6b...&role=eq.admin:1 Failed to load resource: the server responded with a status of 406`

**Cause**: The RLS policy on `user_roles` is blocking the query because it only allows users to see their own roles, but the query is checking for admin role.

**Fix**: Update the RLS policy to allow checking for admin roles.

### Issue 2: CORS Error on upload-note Function
**Error**: `Access to fetch at 'https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/upload-note' has been blocked by CORS policy`

**Cause**: The Edge Function might not be deployed or is returning an error before CORS headers are set.

---

## ✅ Complete Fix (10 minutes)

### Step 1: Fix Admin Role Check (SQL)

Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new

Run this SQL:

```sql
-- Fix user_roles RLS policy to allow admin checks
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admin role checks" ON user_roles;

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles" ON user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow checking if any user is an admin (needed for admin UI)
CREATE POLICY "Allow admin role checks" ON user_roles 
  FOR SELECT 
  USING (role = 'admin');

-- Allow users to insert their own roles (for signup)
CREATE POLICY "Users can insert own roles" ON user_roles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Add yourself as admin (replace with your user ID)
INSERT INTO user_roles (user_id, role) 
VALUES ('82aabd6b-5766-439c-8312-6148046aebea', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 2: Redeploy upload-note Edge Function

The Edge Function needs to be redeployed. You have two options:

#### Option A: Deploy via Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref kdtcwnnddukdbgkylmxq

# Deploy the upload-note function
supabase functions deploy upload-note
```

#### Option B: Deploy via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions
2. Click on `upload-note` function
3. Click "Deploy" or "Redeploy"
4. Make sure these environment variables are set:
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key

### Step 3: Verify Edge Function Environment Variables

Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions/upload-note/details

Make sure these are set:
- `SUPABASE_URL`: `https://kdtcwnnddukdbgkylmxq.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY`: (your service role key from project settings)

### Step 4: Test the Fixes

1. **Test Admin Check**:
   - Refresh your Netlify site
   - The admin check should work without 406 errors

2. **Test Note Upload**:
   - Go to Notes page
   - Try uploading a PDF
   - Should work without CORS errors

---

## Alternative: Quick Fix for Upload (If Edge Function Won't Deploy)

If you can't deploy the Edge Function, you can temporarily use direct storage upload:

### Update Frontend to Use Direct Upload

This would require modifying `src/components/notes/NotesUploadDialog.tsx` to upload directly to Supabase Storage instead of using the Edge Function.

**Pros**: 
- No Edge Function needed
- Simpler deployment

**Cons**: 
- Less validation
- No server-side processing
- Less secure

Let me know if you want me to implement this alternative approach.

---

## Troubleshooting

### Still getting 406 on admin check?

Check if the policy was created:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_roles';
```

### Still getting CORS errors?

1. Check Edge Function logs:
   ```
   https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions/upload-note/logs
   ```

2. Check if function is deployed:
   ```
   https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions
   ```

3. Test the function directly:
   ```bash
   curl -i --location --request POST 'https://kdtcwnnddukdbgkylmxq.supabase.co/functions/v1/upload-note' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"test": true}'
   ```

### Edge Function returns 500?

Check the function logs for errors. Common issues:
- Missing environment variables
- Incorrect service role key
- Storage bucket not created

---

## Summary

**What to do**:
1. ✅ Run the SQL fix for admin role check
2. ✅ Redeploy the upload-note Edge Function
3. ✅ Verify environment variables are set
4. ✅ Test both admin check and note upload

**Time**: 10 minutes

**Result**: All production errors fixed! 🎉

---

**Status**: Ready to fix
**Date**: 2024-11-18
**Issues**: Admin role check 406, CORS on upload-note
