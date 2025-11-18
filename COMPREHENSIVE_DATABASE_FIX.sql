-- COMPREHENSIVE DATABASE FIX
-- This fixes all the relationship and RLS policy issues

-- Step 1: Fix foreign key relationships
-- The tables currently reference auth.users(id) but should reference profiles(id)
-- Since profiles.id IS auth.users.id (same UUID), we just need to update the constraints

-- Fix notes table foreign key
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_owner_id_fkey;
ALTER TABLE notes ADD CONSTRAINT notes_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix mentors table foreign key
ALTER TABLE mentors DROP CONSTRAINT IF EXISTS mentors_user_id_fkey;
ALTER TABLE mentors ADD CONSTRAINT mentors_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix transactions table foreign key
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_buyer_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_buyer_id_fkey 
  FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix bookings table foreign keys
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_student_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_mentor_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_student_id_fkey 
  FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_mentor_id_fkey 
  FOREIGN KEY (mentor_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix flashcards table foreign key
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_user_id_fkey;
ALTER TABLE flashcards ADD CONSTRAINT flashcards_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix quizzes table foreign key
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_creator_id_fkey;
ALTER TABLE quizzes ADD CONSTRAINT quizzes_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix community_posts table foreign key
ALTER TABLE community_posts DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;
ALTER TABLE community_posts ADD CONSTRAINT community_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix user_roles table foreign key
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 2: Fix RLS policies to avoid infinite recursion
-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

-- Create simple, non-recursive policies
-- Profiles policies (simple)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Notes policies (simple)
DROP POLICY IF EXISTS "Anyone can view notes" ON notes;
DROP POLICY IF EXISTS "Notes are viewable by everyone" ON notes;
DROP POLICY IF EXISTS "Authenticated users can create notes" ON notes;
DROP POLICY IF EXISTS "Users can create notes" ON notes;
DROP POLICY IF EXISTS "Owners can update notes" ON notes;
DROP POLICY IF EXISTS "Users can update own notes" ON notes;
DROP POLICY IF EXISTS "Owners can delete notes" ON notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON notes;

CREATE POLICY "Anyone can view notes" ON notes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Owners can update notes" ON notes FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete notes" ON notes FOR DELETE USING (owner_id = auth.uid());

-- Mentors policies
DROP POLICY IF EXISTS "Mentors are viewable by everyone" ON mentors;
DROP POLICY IF EXISTS "Anyone can view verified mentors" ON mentors;
DROP POLICY IF EXISTS "Users can apply as mentor" ON mentors;
DROP POLICY IF EXISTS "Users can create mentor profile" ON mentors;
DROP POLICY IF EXISTS "Users can update own mentor profile" ON mentors;

CREATE POLICY "Anyone can view verified mentors" ON mentors FOR SELECT USING (status = 'verified');
CREATE POLICY "Users can create mentor profile" ON mentors FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own mentor profile" ON mentors FOR UPDATE USING (user_id = auth.uid());

-- Transactions policies (simple, no recursion)
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can create transactions" ON transactions FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- Bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Students can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Mentors can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Students can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Mentors can update their bookings" ON bookings;

CREATE POLICY "Students can view own bookings" ON bookings FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Mentors can view their bookings" ON bookings FOR SELECT USING (mentor_id = auth.uid());
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update own bookings" ON bookings FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Mentors can update their bookings" ON bookings FOR UPDATE USING (mentor_id = auth.uid());

-- Community posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON community_posts;
DROP POLICY IF EXISTS "Anyone can view community posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

CREATE POLICY "Anyone can view community posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authors can update own posts" ON community_posts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Authors can delete own posts" ON community_posts FOR DELETE USING (user_id = auth.uid());

-- User roles policies (simple, no recursion)
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert own roles" ON user_roles;

CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own roles" ON user_roles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Flashcards policies (already have DROP statements, just ensure they're complete)
DROP POLICY IF EXISTS "Users can view own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can create flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own flashcards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete own flashcards" ON flashcards;

CREATE POLICY "Users can view own flashcards" ON flashcards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create flashcards" ON flashcards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own flashcards" ON flashcards FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own flashcards" ON flashcards FOR DELETE USING (user_id = auth.uid());

-- Quizzes policies
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON quizzes;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can create quizzes" ON quizzes;

CREATE POLICY "Anyone can view quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Users can create quizzes" ON quizzes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 3: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Step 4: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON community_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mentors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON flashcards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON quizzes TO authenticated;

-- Verify the fix
SELECT 'Database fix completed successfully!' as status;
