# Debug PDF Preview Issue

## Problem
PDF preview is showing "Invalid PDF structure" error with warnings about invalid hex characters. This typically means the PDF viewer is receiving HTML instead of a PDF file.

## Possible Causes

### 1. Storage Bucket Not Public
The `notes` storage bucket might not be configured as public.

**Fix**: Make the bucket public in Supabase
1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/storage/buckets
2. Click on the `notes` bucket
3. Make sure "Public bucket" is enabled
4. Or run this SQL:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE name = 'notes';
```

### 2. No PDF Files Uploaded Yet
There might not be any actual PDF files in the database/storage.

**Check**: Query the database
```sql
SELECT id, title, file_path, created_at 
FROM notes 
ORDER BY created_at DESC 
LIMIT 5;
```

If no notes exist, you need to upload a test PDF first.

### 3. File Path Format Issue
The file path in the database might not match the actual storage path.

**Expected format**: `notes/user-id/note-id/original.pdf`
**Check**: Look at the `file_path` column in the notes table

### 4. CORS Issue
The storage bucket might have CORS restrictions.

**Fix**: Configure CORS for the storage bucket
```sql
-- This should already be set, but verify
SELECT * FROM storage.buckets WHERE name = 'notes';
```

## Quick Test

### Test 1: Check if bucket exists and is public
```sql
SELECT name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name = 'notes';
```

Should return:
- `public`: true
- `allowed_mime_types`: should include 'application/pdf'

### Test 2: Check if any files exist in storage
```sql
SELECT name, bucket_id, owner, created_at 
FROM storage.objects 
WHERE bucket_id = 'notes' 
LIMIT 5;
```

### Test 3: Try accessing a PDF URL directly
1. Get a file path from the notes table
2. Construct the URL: `https://kdtcwnnddukdbgkylmxq.supabase.co/storage/v1/object/public/notes/[file_path]`
3. Open it in a browser
4. Should download/show a PDF, not an HTML error page

## Solutions

### Solution 1: Make Storage Bucket Public
```sql
UPDATE storage.buckets 
SET public = true 
WHERE name = 'notes';
```

### Solution 2: Upload a Test PDF
1. Go to Notes page
2. Click "Upload Note"
3. Upload a valid PDF file
4. Try previewing it

### Solution 3: Check Storage Policies
```sql
-- Check RLS policies on storage.objects
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

Make sure there's a policy allowing public reads:
```sql
CREATE POLICY "Public Access for notes bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');
```

### Solution 4: Verify File Upload Process
The upload-note Edge Function should be:
1. Uploading files to the correct path
2. Storing the correct path in the database
3. Setting proper content-type (application/pdf)

Check Edge Function logs:
https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/functions/upload-note/logs

## Testing Steps

1. **Verify bucket is public**:
   - Go to Storage in Supabase Dashboard
   - Check if `notes` bucket shows "Public" badge

2. **Upload a test PDF**:
   - Use the app's upload feature
   - Check if file appears in storage

3. **Test direct URL access**:
   - Get the public URL from a note
   - Open in browser
   - Should show/download PDF

4. **Check browser console**:
   - Look for the actual URL being requested
   - Check if it returns 200 or 404
   - Check response content-type

## Current Status

The PDF preview is trying to load files but receiving HTML (likely a 404 page) instead of PDF content. This is why you see hex parsing errors - it's trying to parse HTML as PDF binary data.

**Most likely cause**: Storage bucket is not public or files don't exist yet.

**Quick fix**: Make the storage bucket public and upload a test PDF.

---

**Next Steps**:
1. Check if storage bucket is public
2. Upload a test PDF if none exist
3. Try preview again
