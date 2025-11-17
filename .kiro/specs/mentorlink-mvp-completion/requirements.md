# Requirements Document

## Introduction

MentorLink is an academic ecosystem platform that combines a notes marketplace, verified senior mentorship, and AI-enhanced study tools. The current implementation has basic UI scaffolding and database schema but lacks core functionality including: AI features (flashcards, quiz generation, chat-with-PDF), mentor verification system, notes upload/preview/purchase flow, payment integration, file storage, and advanced dashboard analytics. This requirements document defines the essential features needed to complete the MVP and align with the product vision outlined in the comprehensive XML documentation.

## Glossary

- **MentorLink System**: The complete web application including frontend, backend, database, and AI services
- **Student User**: A registered user with 'student' role who can purchase notes, book mentors, and use AI study tools
- **Mentor User**: A verified senior student who has passed subject tests and can offer tutoring sessions
- **Notes Marketplace**: The platform feature allowing upload, preview, purchase, and download of academic PDF notes
- **AI Study Engine**: The collection of AI-powered features including flashcard generation, quiz creation, and PDF chat
- **Verification Test**: A proctored subject-specific assessment that mentors must pass to gain verified status
- **Payment Gateway**: The integrated payment processing system (Stripe/Razorpay) for transactions
- **File Storage Service**: S3-compatible storage for PDFs, images, and other user-uploaded content
- **Watermarking Service**: Automated system that embeds buyer metadata into purchased PDF files
- **Vector Database**: Specialized database (FAISS/Milvus) for storing document embeddings for semantic search

## Requirements

### Requirement 1

**User Story:** As a student user, I want to upload my notes as PDFs to the marketplace, so that I can monetize my academic work and help other students

#### Acceptance Criteria

1. WHEN a Student User selects a PDF file and provides title, description, subject, price, and tags, THE MentorLink System SHALL upload the file to File Storage Service and create a notes record in the database
2. WHILE the PDF is uploading, THE MentorLink System SHALL display a progress indicator showing upload percentage
3. THE MentorLink System SHALL generate a thumbnail preview image from the first page of the uploaded PDF
4. IF the uploaded file exceeds 50MB in size, THEN THE MentorLink System SHALL reject the upload and display an error message
5. WHERE the Student User sets a price greater than zero, THE MentorLink System SHALL validate the price is between ₹10 and ₹5000

### Requirement 2

**User Story:** As a student user, I want to preview notes before purchasing, so that I can make informed decisions about which notes to buy

#### Acceptance Criteria

1. WHEN a Student User clicks on a note in the marketplace, THE MentorLink System SHALL display a preview modal showing the first 3 pages of the PDF
2. THE MentorLink System SHALL display note metadata including title, description, subject, price, tags, and uploader name
3. WHEN a Student User clicks the purchase button, THE MentorLink System SHALL initiate the Payment Gateway checkout flow
4. IF the note is free (price equals zero), THEN THE MentorLink System SHALL allow immediate download without payment processing
5. THE MentorLink System SHALL increment the downloads counter by one after each successful purchase or free download

### Requirement 3

**User Story:** As a student user, I want to purchase notes securely through integrated payment, so that I can access premium study materials

#### Acceptance Criteria

1. WHEN a Student User confirms purchase, THE MentorLink System SHALL create a Payment Gateway session with the note price and redirect to checkout
2. WHEN the Payment Gateway confirms successful payment, THE MentorLink System SHALL create a transaction record linking buyer, note, and amount
3. THE MentorLink System SHALL apply a 15% platform commission to each transaction and calculate seller payout
4. AFTER successful payment, THE MentorLink System SHALL generate a watermarked version of the PDF containing buyer email and transaction ID
5. THE MentorLink System SHALL provide a download link for the watermarked PDF that expires after 7 days

### Requirement 4

**User Story:** As a senior student, I want to apply as a mentor by uploading my grades and taking a subject test, so that I can offer verified tutoring services

#### Acceptance Criteria

1. WHEN a Student User navigates to the mentor application page, THE MentorLink System SHALL display a form requesting subject selection, grade upload, and hourly rate
2. THE MentorLink System SHALL accept grade transcripts as image files (JPG, PNG) or CSV format up to 5MB
3. AFTER grade submission, THE MentorLink System SHALL present a proctored subject-specific test with 20 questions
4. THE MentorLink System SHALL calculate the test score and require a minimum of 70% to grant verified mentor status
5. WHEN the test score meets the threshold, THE MentorLink System SHALL update the mentor status to 'verified' and display a verification badge

### Requirement 5

**User Story:** As a student user, I want to book 1:1 tutoring sessions with verified mentors, so that I can get personalized academic help

#### Acceptance Criteria

1. WHEN a Student User views a verified mentor profile, THE MentorLink System SHALL display available time slots for the next 14 days
2. WHEN a Student User selects a time slot and confirms booking, THE MentorLink System SHALL create a booking record with 'pending' status
3. THE MentorLink System SHALL send email notifications to both student and mentor about the booking
4. THE MentorLink System SHALL process payment for the session at the mentor's hourly rate through the Payment Gateway
5. WHEN the booking time arrives, THE MentorLink System SHALL provide a video call link for both participants

### Requirement 6

**User Story:** As a student user, I want to generate AI flashcards from my notes, so that I can efficiently review key concepts

#### Acceptance Criteria

1. WHEN a Student User uploads or views a PDF note, THE MentorLink System SHALL display an "Generate Flashcards" button
2. WHEN the button is clicked, THE AI Study Engine SHALL extract text from the PDF and identify key concepts
3. THE AI Study Engine SHALL generate between 10 and 50 question-answer pairs based on the content complexity
4. THE MentorLink System SHALL save the generated flashcards to the flashcards table linked to the user and source note
5. THE MentorLink System SHALL display the flashcards in a spaced-repetition study interface with flip animation

### Requirement 7

**User Story:** As a student user, I want to chat with my PDF notes using AI, so that I can quickly find answers to specific questions

#### Acceptance Criteria

1. WHEN a Student User opens a PDF note, THE MentorLink System SHALL display a "Chat with PDF" sidebar interface
2. WHEN the user types a question and submits, THE AI Study Engine SHALL retrieve relevant text chunks from the Vector Database
3. THE AI Study Engine SHALL generate a contextual answer using the retrieved chunks and cite specific page numbers
4. THE MentorLink System SHALL display the answer with clickable page references that scroll to the relevant section
5. THE MentorLink System SHALL maintain conversation history for the current session and allow follow-up questions

### Requirement 8

**User Story:** As a student user, I want to generate custom quizzes from my study materials, so that I can test my knowledge

#### Acceptance Criteria

1. WHEN a Student User selects a topic or PDF, THE MentorLink System SHALL display quiz generation options (MCQ, short answer, long form)
2. WHEN the user configures quiz parameters and clicks generate, THE AI Study Engine SHALL create 5 to 30 questions based on the selected difficulty
3. THE MentorLink System SHALL save the generated quiz to the quizzes table with questions stored as JSONB
4. WHEN the user takes the quiz, THE MentorLink System SHALL track answers and calculate a score for objective questions
5. THE MentorLink System SHALL display results with correct answers and explanations after quiz completion

### Requirement 9

**User Story:** As a student user, I want to view my academic progress dashboard, so that I can track my learning journey and identify weak areas

#### Acceptance Criteria

1. WHEN a Student User navigates to the dashboard, THE MentorLink System SHALL display statistics including notes purchased, flashcards created, quizzes taken, and sessions booked
2. THE MentorLink System SHALL calculate and display subject-wise performance metrics based on quiz scores
3. THE MentorLink System SHALL identify weak topics where quiz scores are below 60% and display them prominently
4. THE MentorLink System SHALL recommend relevant mentors based on the user's weak subjects
5. THE MentorLink System SHALL display a study streak counter showing consecutive days of platform activity

### Requirement 10

**User Story:** As a platform administrator, I want to monitor marketplace activity and mentor quality, so that I can maintain platform trust and safety

#### Acceptance Criteria

1. WHERE a user has admin role, THE MentorLink System SHALL display an admin dashboard with platform-wide metrics
2. THE MentorLink System SHALL track and display daily active users, notes uploaded, transactions completed, and mentor sessions booked
3. THE MentorLink System SHALL allow admins to review flagged content and suspend mentors or remove notes
4. THE MentorLink System SHALL run plagiarism detection on uploaded notes and flag potential violations
5. THE MentorLink System SHALL generate monthly revenue reports showing transaction volumes and commission earnings
