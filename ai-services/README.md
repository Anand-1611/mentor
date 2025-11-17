# MentorLink AI Services

AI microservices for the MentorLink platform, providing flashcard generation, quiz creation, and PDF chat functionality.

## Features

- **Flashcard Generation**: Extract key concepts from PDFs and generate Q&A pairs
- **Quiz Generation**: Create custom quizzes (MCQ, short answer, long form) from study materials
- **Chat with PDF**: Semantic search and conversational AI for PDF documents
- **PDF Processing**: Text extraction with OCR fallback for scanned documents

## Tech Stack

- FastAPI for REST API
- Sentence-Transformers for embeddings
- FAISS for vector search
- OpenAI GPT-4 / Anthropic Claude for text generation
- PyMuPDF for PDF processing

## Setup

1. Install dependencies with Poetry:
```bash
poetry install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /ai/generate-flashcards` - Generate flashcards from PDF
- `POST /ai/generate-quiz` - Generate quiz questions
- `POST /ai/index-pdf` - Index PDF for semantic search
- `POST /ai/chat-pdf` - Chat with indexed PDF
- `GET /health` - Health check endpoint

## Development

Run tests:
```bash
poetry run pytest
```

Format code:
```bash
poetry run black .
poetry run ruff check .
```
