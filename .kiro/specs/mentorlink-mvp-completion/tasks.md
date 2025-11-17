# Implementation Plan

- [x] 1. Set up file storage and payment infrastructure





  - Configure Supabase Storage buckets (notes, thumbnails, grades, avatars) with size limits and MIME type restrictions
  - Set up Stripe account and obtain API keys for test and production environments
  - Create Stripe webhook endpoint in Supabase Edge Functions to handle payment events
  - Configure environment variables for storage URLs and payment keys
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Implement notes upload system





  - [x] 2.1 Create NotesUploadDialog component with file input, drag-and-drop, and metadata form


    - Build form with react-hook-form and zod validation for title, description, subject, price (₹10-₹5000), and tags
    - Implement file validation to reject files over 50MB and non-PDF types
    - Add progress bar component to show upload percentage
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 2.2 Create Supabase Edge Function for PDF upload and thumbnail generation


    - Write upload-note function that accepts file and metadata
    - Implement PDF upload to storage bucket with user-scoped paths (notes/{userId}/{noteId}/original.pdf)
    - Generate thumbnail from first page using pdf-lib or similar library
    - Create notes table record with file URLs and metadata
    - Return noteId, fileUrl, and thumbnailUrl in response
    - _Requirements: 1.1, 1.3_

  - [x] 2.3 Integrate upload component into Notes page with success/error handling


    - Add "Upload Notes" button to Notes page header
    - Display upload dialog on button click
    - Show success toast with link to uploaded note on completion
    - Handle errors with user-friendly messages and retry option
    - _Requirements: 1.1_

- [x] 3. Implement notes preview and purchase flow





  - [x] 3.1 Create NotePreviewModal component with PDF viewer


    - Build modal using shadcn Dialog component
    - Integrate react-pdf library to display first 3 pages of PDF
    - Display note metadata (title, description, subject, price, tags, uploader name)
    - Add purchase button that shows price or "Free Download" for free notes
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Implement Stripe checkout session creation


    - Create createCheckoutSession function that calls Supabase Edge Function
    - Build Edge Function that creates Stripe checkout session with note price
    - Store payment_sessions record with pending status
    - Redirect user to Stripe Checkout page
    - _Requirements: 3.1_

  - [x] 3.3 Create Stripe webhook handler for payment completion


    - Write stripe-webhook Edge Function with signature verification
    - Handle checkout.session.completed event
    - Create transaction record with buyer_id, note_id, amount, and 15% commission calculation
    - Update payment_sessions status to completed
    - Trigger watermarking job for purchased PDF
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 3.4 Implement PDF watermarking service


    - Create watermark-pdf Edge Function that accepts transaction details
    - Use pdf-lib to embed buyer email and transaction ID as text watermark
    - Save watermarked PDF to storage at notes/{userId}/{noteId}/watermarked/{transactionId}.pdf
    - Generate signed download URL with 7-day expiration
    - Send email with download link to buyer
    - _Requirements: 3.4, 3.5_

  - [x] 3.5 Add download functionality for purchased notes


    - Create MyPurchases page showing all user transactions
    - Display purchased notes with download buttons
    - Implement download link generation with expiration check
    - Increment downloads counter on each download
    - _Requirements: 2.5, 3.5_

- [x] 4. Build mentor verification system




  - [x] 4.1 Create MentorApplicationForm component


    - Build multi-step form with subject selection, grade upload, hourly rate input
    - Add file upload for grade transcripts (JPG, PNG, CSV up to 5MB)
    - Validate hourly rate is between ₹100 and ₹5000
    - Store grade document in grades storage bucket
    - Create mentor record with pending status
    - _Requirements: 4.1, 4.2_

  - [x] 4.2 Create test_questions table and seed with subject-specific questions


    - Write migration to create test_questions table with subject, question, options, correct_answer, difficulty fields
    - Seed database with 100+ questions across 5 subjects (Math, Physics, Chemistry, CS, English)
    - Create questions with easy (40%), medium (40%), hard (20%) distribution
    - _Requirements: 4.3_

  - [x] 4.3 Build MentorVerificationTest component


    - Fetch 20 random questions for selected subject from test_questions table
    - Display questions one at a time with multiple choice options
    - Add 30-minute countdown timer
    - Implement progress indicator showing question number
    - Store answers in component state
    - _Requirements: 4.3_

  - [x] 4.4 Implement test scoring and mentor verification


    - Calculate score by comparing user answers to correct_answer field
    - Require minimum 70% (14/20) to pass
    - Update mentor record with test_score, test_answers, test_taken_at, and status='verified' if passed
    - Set verified_at timestamp on success
    - Display results page with score and pass/fail status
    - Show verification badge on mentor profile if verified
    - _Requirements: 4.4, 4.5_

- [x] 5. Implement booking system





  - [x] 5.1 Create mentor_availability table and availability management UI


    - Write migration for mentor_availability table with day_of_week, start_time, end_time fields
    - Build AvailabilitySettings component for mentors to set weekly schedule
    - Allow mentors to toggle availability per day and set time ranges
    - _Requirements: 5.1_

  - [x] 5.2 Build MentorBookingCalendar component


    - Create calendar view using react-day-picker showing next 14 days
    - Fetch mentor availability and existing bookings
    - Display available time slots as clickable buttons
    - Show booked slots as disabled
    - Handle time zone conversion using date-fns-tz
    - _Requirements: 5.1_

  - [x] 5.3 Implement booking creation with payment


    - Create booking confirmation dialog showing mentor, date, time, duration, and price
    - Calculate total price based on hourly rate and duration
    - Create Stripe checkout session for booking payment
    - Create booking record with pending status after payment
    - Send email notifications to both student and mentor
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 5.4 Integrate video call functionality


    - Sign up for Daily.co API and obtain API key
    - Create video room when booking is confirmed
    - Store meeting URL in bookings table
    - Build VideoCallInterface component with Daily.co React SDK
    - Add "Join Call" button that appears 10 minutes before scheduled time
    - Implement basic video/audio controls and screen sharing
    - _Requirements: 5.5_

- [x] 6. Set up AI services infrastructure





  - [x] 6.1 Create Python FastAPI project for AI microservices


    - Initialize FastAPI project with poetry for dependency management
    - Set up project structure with routers for flashcards, quiz, chat endpoints
    - Configure CORS to allow requests from frontend domain
    - Add authentication middleware to verify Supabase JWT tokens
    - _Requirements: 6.1, 7.1, 8.1_

  - [x] 6.2 Implement PDF text extraction service


    - Install PyMuPDF (fitz) library for PDF processing
    - Create extract_text_from_pdf function that downloads PDF from storage and extracts text
    - Implement text chunking function with configurable chunk size and overlap
    - Add OCR fallback using pytesseract for scanned PDFs
    - _Requirements: 6.2, 7.2_

  - [x] 6.3 Set up vector database for semantic search


    - Install sentence-transformers and faiss-cpu libraries
    - Create FAISS index initialization with 384-dimensional embeddings (all-MiniLM-L6-v2 model)
    - Implement index persistence to disk for recovery
    - Create pdf_chunks table to store chunk metadata
    - _Requirements: 7.2_

  - [x] 6.4 Configure LLM provider for text generation


    - Set up OpenAI API client with API key from environment
    - Implement fallback to Anthropic Claude if OpenAI fails
    - Create generate_text helper function with retry logic and rate limiting
    - Add prompt templates for flashcards, quiz, and chat use cases
    - _Requirements: 6.3, 7.3, 8.2_

- [x] 7. Implement AI flashcard generation





  - [x] 7.1 Create flashcard generation API endpoint


    - Build POST /ai/generate-flashcards endpoint accepting note_id and user_id
    - Fetch PDF from storage and extract text using PDF extraction service
    - Chunk text into 500-word segments with 50-word overlap
    - _Requirements: 6.1_

  - [x] 7.2 Implement LLM-based Q&A extraction

    - Create prompt template: "Extract 3-5 key concepts as question-answer pairs from the following text: {chunk}"
    - Call LLM for each chunk and parse JSON response
    - Validate generated flashcards have both question and answer fields
    - Limit total flashcards to 50 per note
    - _Requirements: 6.3_

  - [x] 7.3 Save flashcards to database and return to frontend

    - Insert generated flashcards into flashcards table with user_id and source_note_id
    - Return array of flashcard objects with id, question, answer
    - Handle errors and return partial results if some chunks fail
    - _Requirements: 6.4_

  - [x] 7.4 Build FlashcardGenerator component and study interface


    - Add "Generate Flashcards" button to note preview modal
    - Show loading state with progress indicator during generation
    - Display generated flashcards in preview list
    - Build FlashcardStudy component with flip animation using framer-motion
    - Implement spaced repetition logic with "Easy", "Medium", "Hard" buttons
    - Track flashcard mastery in local state
    - _Requirements: 6.5_

- [x] 8. Implement chat with PDF feature





  - [x] 8.1 Create PDF indexing endpoint


    - Build POST /ai/index-pdf endpoint accepting note_id
    - Extract text and chunk into 300-word segments with 50-word overlap
    - Generate embeddings for each chunk using sentence-transformers
    - Store embeddings in FAISS index with chunk IDs
    - Save chunk metadata (content, page_number) to pdf_chunks table
    - Mark note as indexed in notes table
    - _Requirements: 7.2_

  - [x] 8.2 Build chat endpoint with semantic search


    - Create POST /ai/chat-pdf endpoint accepting note_id, question, and conversation history
    - Generate embedding for user question
    - Search FAISS index for top 5 most similar chunks
    - Retrieve chunk content and page numbers from pdf_chunks table
    - _Requirements: 7.2, 7.3_

  - [x] 8.3 Implement LLM answer generation with citations

    - Build context string from retrieved chunks
    - Create prompt: "Context: {context}\n\nConversation history: {history}\n\nQuestion: {question}\n\nProvide a detailed answer based on the context."
    - Call LLM with prompt and parse response
    - Extract page numbers from source chunks
    - Return answer with page references array
    - _Requirements: 7.3, 7.4_

  - [x] 8.4 Create PDFChatSidebar component


    - Build chat UI with message history display
    - Add chat input with send button
    - Show loading indicator while waiting for response
    - Display AI responses with clickable page reference badges
    - Implement page navigation that scrolls PDF viewer to referenced page
    - Store conversation history in component state
    - _Requirements: 7.1, 7.4, 7.5_


- [x] 9. Implement quiz generation and taking



  - [x] 9.1 Create quiz generation API endpoint


    - Build POST /ai/generate-quiz endpoint accepting note_id, quiz_type (mcq/short/long), count, difficulty
    - Extract text from PDF and select relevant sections based on difficulty
    - _Requirements: 8.1_

  - [x] 9.2 Implement LLM-based question generation

    - Create prompt template for each quiz type with JSON output format
    - For MCQ: generate question, 4 options, correct answer, and explanation
    - For short answer: generate question and model answer
    - For long form: generate essay prompt and grading rubric
    - Call LLM and parse JSON response with error handling
    - _Requirements: 8.2_

  - [x] 9.3 Save quiz to database

    - Insert quiz record into quizzes table with creator_id, topic, and questions JSONB
    - Return quiz_id and questions array
    - _Requirements: 8.3_

  - [x] 9.4 Build QuizGenerator component


    - Create configuration form with quiz type dropdown, question count slider (5-30), and difficulty radio buttons
    - Add "Generate Quiz" button that calls API endpoint
    - Show loading state during generation
    - Display generated quiz preview with edit capability
    - Allow saving quiz for later or starting immediately
    - _Requirements: 8.1_

  - [x] 9.5 Create QuizTaking component


    - Build quiz interface showing one question at a time
    - For MCQ: display radio buttons for options
    - For short/long: display textarea for answer input
    - Add progress bar and question counter
    - Implement timer if quiz has time limit
    - Store answers in component state
    - _Requirements: 8.4_

  - [x] 9.6 Implement quiz scoring and results


    - Create quiz_attempts table to store user attempts
    - Calculate score for MCQ questions by comparing to correct_answer
    - For subjective questions, store answer for manual grading
    - Insert quiz_attempt record with user_id, quiz_id, subject, score, answers
    - Display results page with score, correct answers, and explanations
    - _Requirements: 8.4, 8.5_
-

- [x] 10. Build enhanced dashboard with analytics



  - [x] 10.1 Create get_user_analytics Supabase RPC function


    - Write SQL function that aggregates notes_purchased, flashcards_created, quizzes_taken, sessions_booked
    - Calculate subject-wise average quiz scores
    - Identify weak topics where average score < 60%
    - Return JSON object with all analytics data
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 10.2 Implement study streak tracking


    - Create study_streaks table with current_streak, longest_streak, last_activity_date
    - Write update_study_streak function that increments streak if activity today, resets if gap > 1 day
    - Call function on any user activity (note view, flashcard study, quiz attempt)
    - _Requirements: 9.5_

  - [x] 10.3 Build AnalyticsDashboard component


    - Fetch analytics data using get_user_analytics RPC
    - Display stats cards for notes, flashcards, quizzes, sessions
    - Create subject performance bar chart using recharts
    - Show weak topics list with red badges
    - Display study streak with calendar heatmap
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 10.4 Implement mentor recommendations based on weak topics


    - Query mentors table for verified mentors matching user's weak subjects
    - Sort by test_score and rating
    - Display top 3 recommended mentors with "Book Session" CTA
    - _Requirements: 9.4_

- [x] 11. Implement admin dashboard and moderation





  - [x] 11.1 Create admin role check and protected routes


    - Add admin role to user_roles table for designated users
    - Create useIsAdmin hook that checks user role
    - Build ProtectedRoute component that redirects non-admins
    - Create /admin route with nested routes for different admin views
    - _Requirements: 10.1_

  - [x] 11.2 Build platform metrics dashboard


    - Create get_platform_metrics RPC function aggregating daily_active_users, notes_uploaded, transactions, bookings
    - Build AdminDashboard component with metric cards and trend charts
    - Add date range selector to filter metrics
    - Display revenue calculations with commission breakdown
    - _Requirements: 10.2, 10.5_

  - [x] 11.3 Implement content moderation queue


    - Create content_flags table for user-reported content
    - Build moderation queue UI showing flagged notes and posts
    - Add approve/reject actions that update content status
    - Implement suspend mentor functionality
    - _Requirements: 10.3_

  - [x] 11.4 Integrate plagiarism detection for uploaded notes


    - Research and integrate plagiarism detection API (Copyleaks or similar)
    - Call API when note is uploaded and store similarity score
    - Flag notes with >70% similarity for manual review
    - Display plagiarism score in admin moderation view
    - _Requirements: 10.4_
-

- [x] 12. Add email notifications system


  - [x] 12.1 Set up email service provider


    - Sign up for Resend or SendGrid and obtain API key
    - Create email templates for: purchase confirmation, booking confirmation, mentor verification, download link
    - Configure sender domain and verify DNS records
    - _Requirements: 3.5, 5.4_

  - [x] 12.2 Create send-email Edge Function


    - Build reusable function accepting template_id, recipient, and template variables
    - Implement email sending with error handling and retry logic
    - Log email sends to email_logs table for debugging
    - _Requirements: 3.5, 5.4_

  - [x] 12.3 Integrate email triggers throughout application


    - Send purchase confirmation email after successful payment
    - Send booking confirmation to student and mentor
    - Send download link email with watermarked PDF
    - Send mentor verification success/failure email
    - _Requirements: 3.5, 5.4_

- [x] 13. Implement search and filtering




  - [x] 13.1 Add full-text search to notes


    - Create GIN index on notes table for title, description, subject, tags
    - Implement search query using Postgres full-text search
    - Add search input to Notes page with debounced API calls
    - _Requirements: 2.1_

  - [x] 13.2 Add filters for notes marketplace


    - Create filter sidebar with subject checkboxes, price range slider, and sort options
    - Implement filter query logic combining multiple conditions
    - Add "Clear Filters" button to reset
    - _Requirements: 2.1_

  - [x] 13.3 Add mentor search and filters


    - Implement search by subject and name on Mentors page
    - Add filters for hourly rate range and availability
    - Sort mentors by rating, price, or verification score
    - _Requirements: 5.1_

- [x] 14. Add profile management features





  - [x] 14.1 Build profile edit form


    - Create ProfileEdit component with fields for full_name, bio, college, year
    - Add avatar upload with image cropping using react-easy-crop
    - Implement form submission that updates profiles table
    - Show success toast on save
    - _Requirements: 9.1_

  - [x] 14.2 Create public profile view


    - Build PublicProfile page showing user's uploaded notes and mentor status
    - Display avatar, bio, college, and stats
    - Add "Book Session" button if user is verified mentor
    - _Requirements: 9.1_

  - [x] 14.3 Implement account settings


    - Create Settings page with sections for account, notifications, privacy
    - Add email notification preferences toggle
    - Implement password change functionality
    - Add account deletion with confirmation dialog
    - _Requirements: 9.1_

- [x] 15. Optimize performance and add monitoring









  - [x] 15.1 Implement code splitting and lazy loading



    - Use React.lazy for route-based code splitting
    - Add Suspense boundaries with loading skeletons
    - Lazy load heavy components like PDF viewer and video call
    - _Requirements: All_

  - [x] 15.2 Add React Query caching configuration



    - Configure staleTime to 5 minutes for notes and mentors
    - Implement optimistic updates for flashcards and bookings
    - Add query invalidation on mutations
    - _Requirements: All_

  - [x] 15.3 Set up error monitoring with Sentry



    - Install @sentry/react and configure DSN
    - Add error boundary with Sentry integration
    - Configure source maps for production debugging
    - Set up performance monitoring for slow queries
    - _Requirements: All_



  - [x] 15.4 Add database indexes for common queries

    - Create indexes on notes(subject), notes(owner_id), mentors(subject), bookings(student_id), transactions(buyer_id)
    - Add composite index on bookings(mentor_id, slot) for availability queries
    - Analyze slow queries and add indexes as needed
    - _Requirements: All_

- [-] 16. Deploy to production


  - [x] 16.1 Set up production environment


    - Create production Supabase project and run migrations
    - Configure production storage buckets with CORS
    - Set up production Stripe account and webhooks
    - Deploy AI services to Railway or Render with auto-scaling
    - _Requirements: All_

  - [x] 16.2 Configure environment variables


    - Set all API keys and secrets in Vercel environment variables
    - Configure Supabase connection strings
    - Set up CORS allowed origins
    - _Requirements: All_

  - [x] 16.3 Deploy frontend to Vercel


    - Connect GitHub repository to Vercel
    - Configure build settings and environment variables
    - Set up custom domain and SSL
    - Enable Vercel Analytics
    - _Requirements: All_

  - [x] 16.4 Set up monitoring and logging









    - Configure Sentry for error tracking
    - Set up Better Stack for log aggregation
    - Create uptime monitoring for critical endpoints
    - Set up alerts for error rate spikes
    - _Requirements: All_
