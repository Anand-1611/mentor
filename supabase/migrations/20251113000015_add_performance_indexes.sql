-- Migration: Add performance indexes for common queries
-- This migration adds indexes to optimize frequently accessed queries

-- Notes table indexes
-- Index for filtering by subject (used in marketplace filters)
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);

-- Index for filtering by owner (used in user profile pages)
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);

-- Index for filtering by price range (used in marketplace filters)
CREATE INDEX IF NOT EXISTS idx_notes_price ON notes(price);

-- Composite index for subject and price filtering together
CREATE INDEX IF NOT EXISTS idx_notes_subject_price ON notes(subject, price);

-- Index for ordering by creation date (used in marketplace listing)
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Mentors table indexes
-- Index for filtering by subject (used in mentor search)
CREATE INDEX IF NOT EXISTS idx_mentors_subject ON mentors(subject);

-- Index for filtering by status (used to show only verified mentors)
CREATE INDEX IF NOT EXISTS idx_mentors_status ON mentors(status);

-- Index for ordering by test score (used in mentor ranking)
CREATE INDEX IF NOT EXISTS idx_mentors_test_score ON mentors(test_score DESC NULLS LAST);

-- Composite index for verified mentors by subject
CREATE INDEX IF NOT EXISTS idx_mentors_status_subject ON mentors(status, subject) WHERE status = 'verified';

-- Index for hourly rate filtering
CREATE INDEX IF NOT EXISTS idx_mentors_hourly_rate ON mentors(hourly_rate);

-- Bookings table indexes
-- Index for student bookings (used in "My Bookings" page)
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);

-- Index for mentor bookings (used in mentor dashboard)
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);

-- Composite index for checking mentor availability
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_slot ON bookings(mentor_id, slot);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Index for ordering by slot time
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot);

-- Composite index for active bookings by mentor
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_active ON bookings(mentor_id, slot, status) 
  WHERE status IN ('pending', 'confirmed');

-- Transactions table indexes
-- Index for buyer transactions (used in purchase history)
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);

-- Index for note transactions (used to check if user purchased a note)
CREATE INDEX IF NOT EXISTS idx_transactions_note_id ON transactions(note_id);

-- Composite index for buyer-note lookup (check if user owns a note)
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_note ON transactions(buyer_id, note_id);

-- Index for transaction date (used in analytics)
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Flashcards table indexes
-- Index for user flashcards (used in study interface)
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);

-- Index for flashcards by source note
CREATE INDEX IF NOT EXISTS idx_flashcards_source_note_id ON flashcards(source_note_id);

-- Index for flashcards by topic
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);

-- Composite index for user flashcards by topic
CREATE INDEX IF NOT EXISTS idx_flashcards_user_topic ON flashcards(user_id, topic);

-- Quizzes table indexes
-- Index for creator quizzes (used in "My Quizzes" page)
CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);

-- Index for topic filtering
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);

-- Quiz attempts table indexes
-- Index for user quiz attempts (used in progress tracking)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- Index for quiz attempts by quiz
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);

-- Composite index for subject performance analytics
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_subject ON quiz_attempts(user_id, subject);

-- Index for completion date (used in analytics)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- PDF chunks table indexes
-- Index for note chunks (used in chat with PDF)
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_note_id ON pdf_chunks(note_id);

-- Index for indexed chunks (used to check if note is indexed)
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_embedding_indexed ON pdf_chunks(embedding_indexed);

-- Composite index for retrieving indexed chunks by note
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_note_indexed ON pdf_chunks(note_id, embedding_indexed) 
  WHERE embedding_indexed = true;

-- Profiles table indexes
-- Index for college filtering (used in user search)
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);

-- Index for year filtering
CREATE INDEX IF NOT EXISTS idx_profiles_year ON profiles(year);

-- Study streaks table indexes
-- Index for user streak lookup
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON study_streaks(user_id);

-- Index for last activity date (used in streak calculation)
CREATE INDEX IF NOT EXISTS idx_study_streaks_last_activity ON study_streaks(last_activity_date);

-- Mentor availability table indexes
-- Index for mentor availability lookup
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON mentor_availability(mentor_id);

-- Composite index for day and time lookup
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day_time ON mentor_availability(mentor_id, day_of_week, is_available) 
  WHERE is_available = true;

-- Content flags table indexes (for admin moderation)
-- Content flags and email logs indexes will be added in their respective migrations
-- (Skipped here as tables don't exist yet at this point in migration order)

-- Add comments for documentation
COMMENT ON INDEX idx_notes_subject IS 'Optimizes filtering notes by subject in marketplace';
COMMENT ON INDEX idx_bookings_mentor_slot IS 'Optimizes availability queries for mentor booking calendar';
COMMENT ON INDEX idx_transactions_buyer_note IS 'Optimizes checking if user has purchased a specific note';
