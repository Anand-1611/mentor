# 🔧 Run Database Migrations Manually

## Issue

The Supabase CLI can't connect due to network/firewall issues. Let's run migrations manually through the dashboard.

## ✅ Solution: Run Migrations in Supabase Dashboard

### Step 1: Go to SQL Editor

Open this link:
```
https://supabase.com/dashboard/project/kdtcwnnddukdbgkylmxq/sql/new
```

### Step 2: Run Each Migration File

Run these files **in order** (one at a time):

#### Migration 1: Main Schema (MOST IMPORTANT)

Open: `supabase/migrations/20251112191710_ec7743e7-ad70-4e49-9e77-878395483511.sql`

Copy ALL the content and paste in SQL Editor, then click "Run"

#### Migration 2-17: Additional Features

After the first migration succeeds, run these in order:

1. `20251113000000_create_quiz_attempts.sql`
2. `20251113000001_setup_storage_buckets.sql`
3. `20251113000002_add_payment_tables.sql`
4. `20251113000003_add_increment_downloads_function.sql`
5. `20251113000004_create_test_questions.sql`
6. `20251113000005_create_mentor_availability.sql`
7. `20251113000006_create_pdf_chunks_table.sql`
8. `20251113000007_create_analytics_functions.sql`
9. `20251113000008_create_study_streaks.sql`
10. `20251113000009_add_admin_support.sql`
11. `20251113000010_create_platform_metrics_function.sql`
12. `20251113000011_create_content_flags_table.sql`
13. `20251113000012_add_plagiarism_detection.sql`
14. `20251113000013_create_email_logs_table.sql`
15. `20251113000014_add_notes_fulltext_search.sql`
16. `20251113000015_add_performance_indexes.sql`

### Step 3: Verify Tables Created

After running all migrations, verify with:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see tables like:
- profiles
- notes
- transactions
- bookings
- messages
- reviews
- etc.

### Step 4: Storage Buckets (Already Done!)

You already ran the storage bucket script, so this is complete! ✅

## Quick Alternative: Run All at Once

If you want to run all migrations at once:

1. Open each migration file in your code editor
2. Copy all content from all files into one big SQL script
3. Paste in SQL Editor
4. Click "Run"

**Note**: This might fail if there are dependencies between migrations. Better to run one by one.

## Verify Everything Works

After running migrations:

```bash
# Restart your dev server
npm run dev

# Test the app
# - Sign up/Login
# - Upload profile picture
# - Browse notes
# - Upload a note
# - Try mock payment
```

## Summary

**What to do**:
1. ✅ Go to SQL Editor
2. ✅ Run migration files one by one
3. ✅ Verify tables exist
4. ✅ Test your app

**Time**: 10-15 minutes (copying and pasting)

**Result**: Fully working database! 🎉

---

**Status**: Manual migration guide
**Date**: 2024-11-17
**Reason**: CLI connection timeout
