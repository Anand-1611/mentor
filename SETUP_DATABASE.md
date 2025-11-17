# 🗄️ Database Setup Guide

## Problem

Your Supabase project (`kdtcwnnddukdbgkylmxq`) doesn't have the database tables yet. You need to run the migrations.

## ✅ Quick Solution (5 minutes)

### Option 1: Using Supabase CLI (Recommended)

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
supabase link --project-ref kdtcwnnddukdbgkylmxq

# 4. Push all migrations
supabase db push

# 5. Done! ✅
```

### Option 2: Using Supabase Dashboard (Manual)

1. **Go to SQL Editor**:
   ```
   https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql
   ```

2. **Run migrations in order**:
   
   Open each file in `supabase/migrations/` and run them one by one:
   
   - ✅ `20251112191710_ec7743e7-ad70-4e49-9e77-878395483511.sql` (main schema)
   - ✅ `20251113000000_create_quiz_attempts.sql`
   - ✅ `20251113000001_setup_storage_buckets.sql`
   - ✅ `20251113000002_add_payment_tables.sql`
   - ✅ `20251113000003_add_increment_downloads_function.sql`
   - ✅ `20251113000004_create_test_questions.sql`
   - ✅ `20251113000005_create_mentor_availability.sql`
   - ✅ `20251113000006_create_pdf_chunks_table.sql`
   - ✅ `20251113000007_create_analytics_functions.sql`
   - ✅ `20251113000008_create_study_streaks.sql`
   - ✅ `20251113000009_add_admin_support.sql`
   - ✅ `20251113000010_create_platform_metrics_function.sql`
   - ✅ `20251113000011_create_content_flags_table.sql`
   - ✅ `20251113000012_add_plagiarism_detection.sql`
   - ✅ `20251113000013_create_email_logs_table.sql`
   - ✅ `20251113000014_add_notes_fulltext_search.sql`
   - ✅ `20251113000015_add_performance_indexes.sql`

3. **For each file**:
   - Open the file in your code editor
   - Copy all the SQL
   - Paste in Supabase SQL Editor
   - Click "Run"
   - Wait for success message
   - Move to next file

## Verify Setup

After running migrations, verify tables exist:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these tables:
- ✅ profiles
- ✅ notes
- ✅ transactions
- ✅ bookings
- ✅ messages
- ✅ reviews
- ✅ quiz_attempts
- ✅ test_questions
- ✅ mentor_availability
- ✅ pdf_chunks
- ✅ study_streaks
- ✅ content_flags
- ✅ email_logs
- And more...

## Test Your App

After setup:

```bash
# 1. Restart dev server
npm run dev

# 2. Open app in browser
# http://localhost:5173

# 3. Check console
# Should see no database errors

# 4. Test features
# - Browse notes
# - Upload a note
# - Try mock payment
```

## Troubleshooting

### "Permission denied" errors

**Solution**: Check RLS (Row Level Security) policies

```sql
-- Disable RLS temporarily for testing
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

### "Function does not exist" errors

**Solution**: Make sure you ran ALL migration files in order

### "Relation does not exist" errors

**Solution**: The table wasn't created. Re-run the first migration file.

## Storage Buckets

Don't forget to set up storage buckets:

1. Go to: https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/storage/buckets

2. Create these buckets:
   - ✅ `notes` (for PDF files)
   - ✅ `avatars` (for profile pictures)
   - ✅ `watermarked-notes` (for purchased PDFs)

3. Set bucket policies:
   - `notes`: Public read, authenticated write
   - `avatars`: Public read, authenticated write
   - `watermarked-notes`: Private (only owner can read)

## Quick Commands

```bash
# Check if Supabase CLI is installed
supabase --version

# Install if needed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref kdtcwnnddukdbgkylmxq

# Push migrations
supabase db push

# Check status
supabase db diff

# Reset database (⚠️ DANGER: Deletes all data)
supabase db reset
```

## Summary

**What you need to do**:
1. ✅ Install Supabase CLI
2. ✅ Link to your project
3. ✅ Push migrations
4. ✅ Create storage buckets
5. ✅ Test the app

**Time required**: 5-10 minutes

**After this**: Your app will work perfectly! 🎉

---

**Status**: Instructions ready
**Date**: 2024-11-17
**Priority**: Critical - App won't work without database
