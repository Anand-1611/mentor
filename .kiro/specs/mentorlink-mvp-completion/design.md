# Design Document

## Overview

MentorLink MVP completion requires implementing a full-stack architecture that integrates file storage, payment processing, AI services, and real-time communication. The design leverages the existing React + Supabase foundation and extends it with new microservices for AI processing, file management, and payment handling. The system follows a modular architecture where the frontend communicates with Supabase for data persistence and authentication, while specialized backend services handle compute-intensive operations like PDF processing, AI inference, and watermarking.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│  - Pages: Notes, Mentors, Dashboard, Community, Profile         │
│  - Components: Upload, Preview, Chat, Flashcards, Quiz          │
│  - State: React Query + Zustand                                 │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Supabase     │  │  File Storage│  │   Payment    │  │  AI Services │
│   (Postgres)   │  │   (S3/R2)    │  │   Gateway    │  │   (Python)   │
│                │  │              │  │  (Stripe)    │  │              │
│ - Auth         │  │ - PDFs       │  │              │  │ - Embeddings │
│ - Database     │  │ - Images     │  │ - Checkout   │  │ - Chat LLM   │
│ - RLS          │  │ - Thumbnails │  │ - Webhooks   │  │ - Quiz Gen   │
│ - Edge Funcs   │  │              │  │              │  │ - Flashcards │
└────────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
             │              │              │              │
             └──────────────┴──────────────┴──────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Vector Database │
                   │   (FAISS/Milvus) │
                   │                  │
                   │ - Document Chunks│
                   │ - Embeddings     │
                   └──────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui components
- React Query for server state
- Zustand for client state
- React Router for navigation
- Framer Motion for animations

**Backend:**
- Supabase (Postgres + Auth + Storage + Edge Functions)
- Python FastAPI microservices for AI
- Cloudflare R2 or AWS S3 for file storage
- Stripe for payment processing
- Redis for caching and job queues

**AI Stack:**
- Sentence-Transformers for embeddings
- FAISS for vector search
- OpenAI GPT-4 or Anthropic Claude for chat/generation
- PyMuPDF for PDF processing
- Celery for background job processing

## Components and Interfaces

### 1. Notes Upload System

**Component: NotesUploadDialog**
- File input with drag-and-drop support
- Form fields: title, description, subject, price, tags
- Progress bar for upload status
- Preview generation trigger

**API Endpoints:**
```typescript
// Supabase Edge Function: upload-note
POST /functions/v1/upload-note
Request: {
  file: File,
  metadata: {
    title: string,
    description: string,
    subject: string,
    price: number,
    tags: string[]
  }
}
Response: {
  noteId: string,
  fileUrl: string,
  thumbnailUrl: string
}
```

**Storage Structure:**
```
notes/
  ├── {userId}/
  │   ├── {noteId}/
  │   │   ├── original.pdf
  │   │   ├── thumbnail.png
  │   │   └── watermarked/
  │   │       └── {transactionId}.pdf
```

### 2. Notes Preview & Purchase

**Component: NotePreviewModal**
- PDF viewer showing first 3 pages
- Metadata display panel
- Purchase button with price
- Related notes suggestions

**Payment Flow:**
```typescript
// Frontend initiates checkout
const { sessionId } = await createCheckoutSession({
  noteId: string,
  userId: string,
  amount: number
});

// Redirect to Stripe Checkout
stripe.redirectToCheckout({ sessionId });

// Webhook handler (Supabase Edge Function)
POST /functions/v1/stripe-webhook
- Verify signature
- Create transaction record
- Trigger watermarking job
- Send download email
```

### 3. Mentor Verification System

**Component: MentorApplicationForm**
- Subject selection dropdown
- Grade upload (image/CSV)
- Hourly rate input
- Terms acceptance

**Component: MentorVerificationTest**
- Question display with timer
- Multiple choice interface
- Progress indicator
- Score calculation

**Database Schema Extension:**
```sql
-- Add to mentors table
ALTER TABLE mentors ADD COLUMN grade_document_url TEXT;
ALTER TABLE mentors ADD COLUMN test_questions JSONB;
ALTER TABLE mentors ADD COLUMN test_answers JSONB;
ALTER TABLE mentors ADD COLUMN test_taken_at TIMESTAMP;

-- Create test_questions table
CREATE TABLE test_questions (
  id UUID PRIMARY KEY,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard'))
);
```

### 4. Booking System

**Component: MentorBookingCalendar**
- Calendar view with available slots
- Time zone handling
- Booking confirmation dialog
- Payment integration

**Component: VideoCallInterface**
- WebRTC video/audio
- Screen sharing
- Chat sidebar
- Session recording (optional)

**Integration:**
- Use Daily.co or Agora for video calls
- Store meeting room URLs in bookings table
- Send calendar invites via email

**API Endpoints:**
```typescript
POST /api/bookings/create
Request: {
  mentorId: string,
  slot: ISO8601DateTime,
  duration: number
}
Response: {
  bookingId: string,
  meetingUrl: string,
  paymentRequired: boolean
}
```

### 5. AI Flashcard Generation

**Component: FlashcardGenerator**
- Trigger button on note view
- Loading state with progress
- Generated cards preview
- Edit/save interface

**AI Pipeline:**
```python
# FastAPI endpoint
@app.post("/ai/generate-flashcards")
async def generate_flashcards(note_id: str, user_id: str):
    # 1. Fetch PDF from storage
    pdf_content = await storage.download(note_id)
    
    # 2. Extract text
    text = extract_text_from_pdf(pdf_content)
    
    # 3. Chunk text (500 words per chunk)
    chunks = chunk_text(text, chunk_size=500)
    
    # 4. Generate Q&A pairs using LLM
    flashcards = []
    for chunk in chunks:
        prompt = f"Extract 3-5 key concepts as Q&A pairs from: {chunk}"
        response = await llm.generate(prompt)
        flashcards.extend(parse_qa_pairs(response))
    
    # 5. Save to database
    await db.flashcards.insert_many(flashcards)
    
    return {"flashcards": flashcards, "count": len(flashcards)}
```

### 6. Chat with PDF

**Component: PDFChatSidebar**
- Chat input with send button
- Message history display
- Page reference links
- Loading indicators

**AI Pipeline:**
```python
# Vector database setup
@app.post("/ai/index-pdf")
async def index_pdf(note_id: str):
    # 1. Extract and chunk text
    text = extract_text_from_pdf(note_id)
    chunks = chunk_text(text, chunk_size=300, overlap=50)
    
    # 2. Generate embeddings
    embeddings = sentence_transformer.encode(chunks)
    
    # 3. Store in FAISS
    index.add_with_ids(embeddings, chunk_ids)
    
    # 4. Store metadata
    await db.pdf_chunks.insert({
        "note_id": note_id,
        "chunks": chunks,
        "chunk_ids": chunk_ids
    })

# Chat endpoint
@app.post("/ai/chat-pdf")
async def chat_pdf(note_id: str, question: str, history: list):
    # 1. Generate question embedding
    q_embedding = sentence_transformer.encode([question])
    
    # 2. Search similar chunks
    distances, indices = index.search(q_embedding, k=5)
    relevant_chunks = [chunks[i] for i in indices[0]]
    
    # 3. Build context
    context = "\n\n".join(relevant_chunks)
    
    # 4. Generate answer with LLM
    prompt = f"Context: {context}\n\nQuestion: {question}\n\nAnswer:"
    answer = await llm.generate(prompt, history=history)
    
    # 5. Extract page references
    pages = extract_page_numbers(relevant_chunks)
    
    return {
        "answer": answer,
        "pages": pages,
        "sources": relevant_chunks
    }
```

### 7. Quiz Generation

**Component: QuizGenerator**
- Configuration form (type, count, difficulty)
- Generated quiz preview
- Quiz taking interface
- Results display with explanations

**AI Pipeline:**
```python
@app.post("/ai/generate-quiz")
async def generate_quiz(
    note_id: str,
    quiz_type: str,  # mcq, short, long
    count: int,
    difficulty: str
):
    # 1. Fetch PDF content
    text = extract_text_from_pdf(note_id)
    
    # 2. Generate questions using LLM
    prompt = f"""Generate {count} {quiz_type} questions at {difficulty} difficulty from:
    {text[:3000]}
    
    Format as JSON:
    [
      {{
        "question": "...",
        "options": ["A", "B", "C", "D"],  // for MCQ
        "correct_answer": "...",
        "explanation": "..."
      }}
    ]
    """
    
    response = await llm.generate(prompt)
    questions = parse_json(response)
    
    # 3. Save quiz
    quiz_id = await db.quizzes.insert({
        "creator_id": user_id,
        "topic": note_id,
        "questions": questions
    })
    
    return {"quiz_id": quiz_id, "questions": questions}
```

### 8. Dashboard Analytics

**Component: AnalyticsDashboard**
- Stats cards (notes, flashcards, quizzes, sessions)
- Subject performance chart
- Weak topics list
- Recommended mentors
- Study streak calendar

**Data Aggregation:**
```typescript
// Supabase RPC function
CREATE OR REPLACE FUNCTION get_user_analytics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'notes_purchased', (SELECT COUNT(*) FROM transactions WHERE buyer_id = user_uuid),
    'flashcards_created', (SELECT COUNT(*) FROM flashcards WHERE user_id = user_uuid),
    'quizzes_taken', (SELECT COUNT(*) FROM quiz_attempts WHERE user_id = user_uuid),
    'sessions_booked', (SELECT COUNT(*) FROM bookings WHERE student_id = user_uuid),
    'subject_performance', (
      SELECT json_object_agg(subject, avg_score)
      FROM (
        SELECT subject, AVG(score) as avg_score
        FROM quiz_attempts
        WHERE user_id = user_uuid
        GROUP BY subject
      ) subq
    ),
    'weak_topics', (
      SELECT json_agg(subject)
      FROM (
        SELECT subject
        FROM quiz_attempts
        WHERE user_id = user_uuid
        GROUP BY subject
        HAVING AVG(score) < 60
      ) subq
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## Data Models

### Extended Database Schema

```sql
-- Add quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add pdf_chunks table for vector search
CREATE TABLE pdf_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  page_number INTEGER,
  embedding_indexed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add payment_sessions table
CREATE TABLE payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add mentor_availability table
CREATE TABLE mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES mentors(user_id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- Add study_streaks table
CREATE TABLE study_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### File Storage Schema

```typescript
// Storage buckets configuration
const STORAGE_BUCKETS = {
  notes: {
    public: false,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['application/pdf']
  },
  thumbnails: {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg']
  },
  grades: {
    public: false,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'text/csv']
  },
  avatars: {
    public: true,
    fileSizeLimit: 2097152, // 2MB
    allowedMimeTypes: ['image/png', 'image/jpeg']
  }
};
```

## Error Handling

### Frontend Error Boundaries

```typescript
// Global error boundary for React
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service (Sentry)
    logError(error, errorInfo);
    
    // Show user-friendly message
    this.setState({ hasError: true });
  }
}

// API error handling
const handleApiError = (error: any) => {
  if (error.code === 'PGRST116') {
    return 'Resource not found';
  } else if (error.code === '23505') {
    return 'Duplicate entry';
  } else if (error.message?.includes('JWT')) {
    return 'Session expired. Please login again.';
  }
  return 'An unexpected error occurred';
};
```

### Backend Error Handling

```python
# FastAPI exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": exc.errors()}
    )

@app.exception_handler(StorageError)
async def storage_exception_handler(request, exc):
    logger.error(f"Storage error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "File operation failed"}
    )

@app.exception_handler(AIServiceError)
async def ai_exception_handler(request, exc):
    logger.error(f"AI service error: {exc}")
    return JSONResponse(
        status_code=503,
        content={"error": "AI service temporarily unavailable"}
    )
```

### Retry Logic

```typescript
// Exponential backoff for failed operations
const retryWithBackoff = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};
```

## Testing Strategy

### Unit Testing

**Frontend:**
- Component testing with React Testing Library
- Hook testing with @testing-library/react-hooks
- Utility function testing with Jest
- Mock Supabase client for isolated tests

**Backend:**
- FastAPI endpoint testing with pytest
- AI pipeline testing with mock LLM responses
- Database operation testing with test fixtures

### Integration Testing

- End-to-end user flows with Playwright
- Payment flow testing with Stripe test mode
- File upload/download testing with test storage
- AI service integration with staging endpoints

### Test Coverage Goals

- Frontend components: 70% coverage
- Backend API endpoints: 85% coverage
- Critical paths (payment, auth): 95% coverage

### Testing Approach

```typescript
// Example: Notes upload test
describe('NotesUpload', () => {
  it('should upload PDF and create note record', async () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const metadata = {
      title: 'Test Note',
      subject: 'Math',
      price: 100
    };
    
    const { noteId } = await uploadNote(file, metadata);
    
    expect(noteId).toBeDefined();
    const note = await supabase.from('notes').select().eq('id', noteId).single();
    expect(note.data.title).toBe('Test Note');
  });
});
```

## Security Considerations

### Authentication & Authorization

- JWT tokens with 1-hour expiration
- Refresh token rotation
- Row Level Security (RLS) on all tables
- Role-based access control (RBAC)

### Data Protection

- Encryption at rest for file storage
- TLS 1.3 for data in transit
- Watermarking for purchased PDFs
- PII anonymization in logs

### Payment Security

- PCI DSS compliance via Stripe
- No credit card data stored locally
- Webhook signature verification
- Idempotency keys for transactions

### Content Security

- PDF malware scanning before storage
- Rate limiting on AI endpoints (10 req/min)
- CAPTCHA on mentor application
- Content moderation queue for flagged items

## Performance Optimization

### Frontend

- Code splitting by route
- Lazy loading for heavy components
- Image optimization with WebP
- React Query caching (5-minute stale time)

### Backend

- Redis caching for frequently accessed data
- Database query optimization with indexes
- CDN for static assets
- Connection pooling for database

### AI Services

- Batch processing for flashcard generation
- Embedding caching for indexed PDFs
- Model quantization for faster inference
- Queue system for long-running jobs

## Deployment Architecture

```
Production Environment:
- Frontend: Vercel (Edge Network)
- Database: Supabase (Managed Postgres)
- Storage: Cloudflare R2
- AI Services: Railway or Render (Docker containers)
- Vector DB: Hosted Milvus or embedded FAISS
- Monitoring: Sentry + Vercel Analytics
- Logging: Better Stack
```

## Migration Strategy

1. Deploy new database tables (zero downtime)
2. Deploy AI services to staging
3. Deploy frontend with feature flags
4. Gradually enable features per user cohort
5. Monitor error rates and rollback if needed
6. Full rollout after 48 hours of stability
