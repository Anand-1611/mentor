-- Fix Admin Role Check and Related Issues
-- Run this in Supabase SQL Editor after running COMPREHENSIVE_DATABASE_FIX.sql

-- Step 1: Fix user_roles RLS policy to allow admin checks
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admin role checks" ON user_roles;

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles" ON user_roles 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Allow checking if any user is an admin (needed for admin UI)
-- This allows the query: user_roles?select=role&user_id=eq.XXX&role=eq.admin
CREATE POLICY "Allow admin role checks" ON user_roles 
  FOR SELECT 
  USING (role = 'admin');

-- Allow users to insert their own roles (for signup)
CREATE POLICY "Users can insert own roles" ON user_roles 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Step 2: Add yourself as admin
-- Replace '82aabd6b-5766-439c-8312-6148046aebea' with your actual user ID if different
INSERT INTO user_roles (user_id, role) 
VALUES ('82aabd6b-5766-439c-8312-6148046aebea', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify the fix
SELECT 'Admin role check fix completed!' as status;

-- Check if admin role exists
SELECT * FROM user_roles WHERE role = 'admin';
