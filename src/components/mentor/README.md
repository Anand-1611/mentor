# Mentor Verification System

This directory contains components for the mentor verification system.

## Components

### MentorApplicationForm
Multi-step form for mentor applications with:
- Subject selection (Math, Physics, Chemistry, Computer Science, English)
- Hourly rate input (₹100 - ₹5000)
- Grade transcript upload (JPG, PNG, CSV up to 5MB)
- File upload to Supabase storage (grades bucket)
- Creates mentor record with 'pending' status

### MentorVerificationTest
Interactive test component featuring:
- 20 random questions from test_questions table
- Distribution: 8 easy (40%), 8 medium (40%), 4 hard (20%)
- 30-minute countdown timer
- Question navigation (previous/next)
- Progress indicator
- Auto-submit on time expiration
- Stores answers and calculates score

### TestResults
Results display component showing:
- Pass/fail status (70% minimum required)
- Score percentage and correct answer count
- Verification badge for passed tests
- Next steps and recommendations
- Navigation to mentor dashboard or retake option

## Database Schema

### test_questions table
- id: UUID (primary key)
- subject: TEXT (Math, Physics, Chemistry, Computer Science, English)
- question: TEXT
- options: JSONB (array of 4 options)
- correct_answer: TEXT
- difficulty: TEXT (easy, medium, hard)
- created_at: TIMESTAMP

### mentors table (extended)
- grade_document_url: TEXT (URL to uploaded grade transcript)
- test_answers: JSONB (stores user's answers)
- test_taken_at: TIMESTAMP
- test_score: NUMERIC (percentage score)
- status: mentor_status (pending, verified, suspended)
- verified_at: TIMESTAMP (set when test is passed)

## Usage

1. User navigates to `/become-mentor`
2. Completes application form with subject, rate, and grade upload
3. Takes 20-question verification test
4. Receives results with pass/fail status
5. If passed (≥70%), status changes to 'verified' and badge appears on profile

## Routes

- `/become-mentor` - Main mentor application and test flow
- `/mentors` - View all verified mentors (includes "Become a Mentor" button)

## Seeded Questions

The database is seeded with 125 questions:
- Math: 25 questions
- Physics: 25 questions
- Chemistry: 25 questions
- Computer Science: 25 questions
- English: 25 questions

Each subject has the proper distribution of easy (40%), medium (40%), and hard (20%) questions.
