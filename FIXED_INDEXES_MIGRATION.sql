-- Migration: Add performance indexes for common queries
-- This migration adds indexes to optimize frequently accessed queries
-- FIXED VERSION - Only includes columns that exist in the schema

-- Notes table indexes
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);
CREATE INDEX IF NOT EXISTS idx_notes_owner_id ON notes(owner_id);
CREATE INDEX IF NOT EXISTS idx_notes_price ON notes(price);
CREATE INDEX IF NOT EXISTS idx_notes_subject_price ON notes(subject, price);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Mentors table indexes
CREATE INDEX IF NOT EXISTS idx_mentors_subject ON mentors(subject);
CREATE INDEX IF NOT EXISTS idx_mentors_status ON mentors(status);
CREATE INDEX IF NOT EXISTS idx_mentors_test_score ON mentors(test_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_mentors_status_subject ON mentors(status, subject) WHERE status = 'verified';
CREATE INDEX IF NOT EXISTS idx_mentors_hourly_rate ON mentors(hourly_rate);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_student_id ON bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_slot ON bookings(mentor_id, slot);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_active ON bookings(mentor_id, slot, status) WHERE status IN ('pending', 'confirmed');

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_note_id ON transactions(note_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_note ON transactions(buyer_id, note_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Flashcards table indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_source_note_id ON flashcards(source_note_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_topic ON flashcards(topic);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_topic ON flashcards(user_id, topic);

-- Quizzes table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_topic ON quizzes(topic);

-- Quiz attempts table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_subject ON quiz_attempts(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- PDF chunks table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_note_id ON pdf_chunks(note_id);
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_embedding_indexed ON pdf_chunks(embedding_indexed);
CREATE INDEX IF NOT EXISTS idx_pdf_chunks_note_indexed ON pdf_chunks(note_id, embedding_indexed) WHERE embedding_indexed = true;

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_college ON profiles(college);
CREATE INDEX IF NOT EXISTS idx_profiles_year ON profiles(year);

-- Study streaks table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id ON study_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_streaks_last_activity ON study_streaks(last_activity_date);

-- Mentor availability table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day_time ON mentor_availability(mentor_id, day_of_week, is_available) WHERE is_available = true;

-- Content flags table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_content_flags_content_type ON content_flags(content_type);
CREATE INDEX IF NOT EXISTS idx_content_flags_resolved ON content_flags(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_content_flags_moderation ON content_flags(resolved, created_at DESC) WHERE resolved = false;

-- Email logs table indexes (if table exists)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_notes_subject IS 'Optimizes filtering notes by subject in marketplace';
COMMENT ON INDEX idx_bookings_mentor_slot IS 'Optimizes availability queries for mentor booking calendar';
COMMENT ON INDEX idx_transactions_buyer_note IS 'Optimizes checking if user has purchased a specific note';
COMMENT ON INDEX idx_quiz_attempts_user_subject IS 'Optimizes subject performance analytics queries';
COMMENT ON INDEX idx_pdf_chunks_note_indexed IS 'Optimizes retrieving indexed chunks for chat with PDF feature';
