-- Quick fix for RLS policy issues
-- Run this in Supabase SQL Editor to fix the 500/406/400 errors

-- Fix 1: Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Fix 2: Allow users to read any profile (for public profiles)
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT
  USING (true);

-- Fix 3: Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Fix 4: Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Fix 5: Allow authenticated users to read all notes
DROP POLICY IF EXISTS "Anyone can view notes" ON notes;
CREATE POLICY "Anyone can view notes"
  ON notes FOR SELECT
  USING (true);

-- Fix 6: Allow authenticated users to insert notes
DROP POLICY IF EXISTS "Authenticated users can create notes" ON notes;
CREATE POLICY "Authenticated users can create notes"
  ON notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Fix 7: Allow owners to update their notes
DROP POLICY IF EXISTS "Owners can update notes" ON notes;
CREATE POLICY "Owners can update notes"
  ON notes FOR UPDATE
  USING (auth.uid() = owner_id);

-- Fix 8: Allow owners to delete their notes
DROP POLICY IF EXISTS "Owners can delete notes" ON notes;
CREATE POLICY "Owners can delete notes"
  ON notes FOR DELETE
  USING (auth.uid() = owner_id);

-- Fix 9: Study streaks policies
DROP POLICY IF EXISTS "Users can view their own study streaks" ON study_streaks;
CREATE POLICY "Users can view their own study streaks"
  ON study_streaks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own study streaks" ON study_streaks;
CREATE POLICY "Users can insert their own study streaks"
  ON study_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own study streaks" ON study_streaks;
CREATE POLICY "Users can update their own study streaks"
  ON study_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Fix 10: Allow service role to bypass RLS for edge functions
-- This is needed for the upload-note edge function
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE notes FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE study_streaks FORCE ROW LEVEL SECURITY;

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
