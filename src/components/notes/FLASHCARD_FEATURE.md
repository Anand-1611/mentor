# AI Flashcard Generation Feature

## Overview

The AI Flashcard Generation feature allows users to automatically generate study flashcards from PDF notes using AI. The system extracts text from PDFs, chunks it intelligently, and uses LLM to create question-answer pairs.

## Components

### Backend (AI Services)

**Location:** `ai-services/app/routers/flashcards.py`

**Endpoint:** `POST /ai/generate-flashcards`

**Request:**
```json
{
  "note_id": "uuid",
  "max_flashcards": 50
}
```

**Response:**
```json
{
  "flashcards": [
    {
      "id": "uuid",
      "question": "What is...",
      "answer": "...",
      "topic": "Page 1"
    }
  ],
  "count": 25,
  "note_id": "uuid"
}
```

**Process:**
1. Downloads PDF from Supabase storage
2. Extracts text using PyMuPDF
3. Chunks text into 500-word segments with 50-word overlap
4. Sends each chunk to LLM with prompt template
5. Parses JSON responses and validates flashcards
6. Saves to database with user_id and source_note_id
7. Returns generated flashcards

### Frontend Components

#### 1. FlashcardGenerator
**Location:** `src/components/notes/FlashcardGenerator.tsx`

- Trigger button to generate flashcards
- Progress indicator during generation
- Preview of generated flashcards (first 5)
- Success/error handling

#### 2. FlashcardStudy
**Location:** `src/components/notes/FlashcardStudy.tsx`

- Interactive flashcard study interface
- Flip animation using Framer Motion
- Spaced repetition with Easy/Medium/Hard buttons
- Progress tracking
- Results summary with mastery statistics

#### 3. FlashcardStudyDialog
**Location:** `src/components/notes/FlashcardStudyDialog.tsx`

- Dialog wrapper for the study interface
- Integrates with NotePreviewModal

#### 4. NotePreviewModal (Updated)
**Location:** `src/components/notes/NotePreviewModal.tsx`

- Added tabs for Preview and AI Flashcards
- Integrated FlashcardGenerator component
- "Start Studying" button to launch study interface

### Services

**Location:** `src/services/ai.ts`

- `generateFlashcards()` - Calls AI service endpoint
- `getUserFlashcards()` - Fetches flashcards from database
- Authentication token handling

## Usage

### For Users

1. Open any note in the Notes page
2. Click on the note to open the preview modal
3. Switch to the "AI Flashcards" tab
4. Click "Generate Flashcards"
5. Wait for AI to process the PDF (progress bar shows status)
6. Review generated flashcards
7. Click "Start Studying" to begin study session
8. Click cards to flip between question and answer
9. Rate each card as Easy, Medium, or Hard
10. View results summary at the end

### For Developers

**Environment Variables:**
```env
VITE_AI_SERVICE_URL=http://localhost:8000
```

**Starting AI Services:**
```bash
cd ai-services
poetry install
poetry run uvicorn app.main:app --reload
```

**Required Dependencies:**
- Frontend: framer-motion (for animations)
- Backend: PyMuPDF, sentence-transformers, openai, httpx

## Features

### Spaced Repetition Logic
- Easy: Card is mastered, won't need much review
- Medium: Card needs some review
- Hard: Card needs more practice

### Error Handling
- Partial results if some chunks fail
- Graceful degradation
- User-friendly error messages
- Retry capability

### Performance
- Chunks processed in sequence to avoid rate limits
- Progress updates during generation
- Limits to 50 flashcards per note
- Processes only necessary chunks

## Database Schema

```sql
CREATE TABLE public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  source_note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Future Enhancements

- [ ] Save study progress and mastery levels
- [ ] Implement actual spaced repetition algorithm (SM-2)
- [ ] Allow manual editing of flashcards
- [ ] Export flashcards to Anki format
- [ ] Share flashcard decks with other users
- [ ] Add images to flashcards
- [ ] Voice narration for flashcards
- [ ] Mobile-optimized study interface
