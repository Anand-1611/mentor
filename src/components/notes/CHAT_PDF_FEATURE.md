# Chat with PDF Feature

## Overview
The Chat with PDF feature allows users to have AI-powered conversations with their PDF documents using semantic search and LLM-based question answering.

## Implementation Details

### Backend (AI Services)

#### 1. PDF Indexing Endpoint (`POST /ai/index-pdf`)
- **Location**: `ai-services/app/routers/chat.py`
- **Functionality**:
  - Extracts text from PDF and chunks it (300 words with 50-word overlap)
  - Generates embeddings using sentence-transformers (all-MiniLM-L6-v2)
  - Stores embeddings in FAISS index
  - Saves chunk metadata to `pdf_chunks` table
  - Marks note as indexed

#### 2. Chat Endpoint (`POST /ai/chat-pdf`)
- **Location**: `ai-services/app/routers/chat.py`
- **Functionality**:
  - Generates embedding for user question
  - Searches FAISS index for top 5 most similar chunks
  - Retrieves chunk content and page numbers from database
  - Builds context string from retrieved chunks
  - Calls LLM to generate answer with citations
  - Returns answer with page references

#### 3. Vector Database Service
- **Location**: `ai-services/app/services/vector_db.py`
- **Features**:
  - FAISS-based vector storage
  - Sentence transformer embeddings
  - Persistent index storage
  - Metadata management

#### 4. Supabase Client Updates
- **Location**: `ai-services/app/utils/supabase_client.py`
- **New Methods**:
  - `insert_pdf_chunks()`: Save chunk metadata to database
  - `mark_note_as_indexed()`: Mark note as indexed
  - `get_pdf_chunks()`: Retrieve chunks from database

### Frontend (React)

#### 1. PDFChatSidebar Component
- **Location**: `src/components/notes/PDFChatSidebar.tsx`
- **Features**:
  - Chat UI with message history display
  - Index PDF button (one-time operation)
  - Chat input with send button
  - Loading indicators
  - Message bubbles (user vs assistant)
  - Auto-scroll to latest message

#### 2. AI Service API Client
- **Location**: `src/services/ai.ts`
- **New Functions**:
  - `indexPDF()`: Index a PDF for semantic search
  - `chatWithPDF()`: Send a question and get AI response
- **Types**:
  - `ChatMessage`: Message format (role, content)
  - `IndexPDFRequest/Response`: Indexing API types
  - `ChatPDFRequest/Response`: Chat API types

#### 3. NotePreviewModal Integration
- **Location**: `src/components/notes/NotePreviewModal.tsx`
- **Changes**:
  - Added "Chat with PDF" tab
  - Integrated PDFChatSidebar component
  - Tab navigation between Preview, Flashcards, and Chat

## Database Schema

### pdf_chunks Table
```sql
CREATE TABLE pdf_chunks (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id),
  chunk_index INTEGER,
  content TEXT,
  page_number INTEGER,
  embedding_indexed BOOLEAN,
  created_at TIMESTAMP
);
```

## Usage Flow

1. **User opens a note in preview modal**
2. **User navigates to "Chat with PDF" tab**
3. **User clicks "Index PDF for Chat" button** (first time only)
   - Backend extracts text and creates embeddings
   - Chunks are stored in FAISS and database
4. **User types a question and sends**
   - Question is embedded and searched against FAISS
   - Top 5 relevant chunks are retrieved
   - LLM generates answer based on context
   - Answer is displayed with page references
5. **User can continue conversation**
   - History is maintained in component state
   - Each question uses previous context

## Environment Variables

### AI Services (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key (optional)
FAISS_INDEX_PATH=./data/faiss_index
```

### Frontend (.env)
```
VITE_AI_SERVICE_URL=http://localhost:8000
```

## Testing

### Backend Testing
```bash
cd ai-services

# Test PDF indexing
curl -X POST http://localhost:8000/ai/index-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"note_id": "your-note-id"}'

# Test chat
curl -X POST http://localhost:8000/ai/chat-pdf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "note_id": "your-note-id",
    "question": "What is the main topic?",
    "history": []
  }'
```

### Frontend Testing
1. Start the AI services: `cd ai-services && uvicorn app.main:app --reload`
2. Start the frontend: `npm run dev`
3. Upload a PDF note
4. Open the note preview
5. Navigate to "Chat with PDF" tab
6. Click "Index PDF for Chat"
7. Ask questions about the PDF content

## Features Implemented

✅ PDF text extraction with chunking (300 words, 50-word overlap)
✅ Embedding generation using sentence-transformers
✅ FAISS vector database for semantic search
✅ Chunk metadata storage in Supabase
✅ LLM-based answer generation with context
✅ Page reference citations
✅ Conversation history support
✅ Chat UI with message bubbles
✅ Loading states and error handling
✅ Integration with NotePreviewModal

## Future Enhancements

- [ ] Clickable page badges that scroll PDF viewer to referenced page
- [ ] Highlight relevant text in PDF viewer
- [ ] Export chat history
- [ ] Share chat conversations
- [ ] Multi-language support
- [ ] Voice input for questions
- [ ] Suggested follow-up questions
