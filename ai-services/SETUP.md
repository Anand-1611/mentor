# AI Services Setup Guide

This guide will help you set up and run the MentorLink AI Services.

## Prerequisites

- Python 3.10 or higher
- Poetry (Python dependency manager)
- Tesseract OCR (for scanned PDF processing)
- OpenAI API key
- Supabase project credentials

## Installation

### 1. Install System Dependencies

**Windows:**
```powershell
# Install Tesseract OCR
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Add to PATH after installation
```

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### 2. Install Poetry

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Or on Windows (PowerShell):
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

### 3. Install Python Dependencies

```bash
cd ai-services
poetry install
```

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# Anthropic Configuration (Optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10

# Vector Database
FAISS_INDEX_PATH=./data/faiss_index
```

## Running the Service

### Development Mode

```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Production Mode

```bash
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Using Docker

Build and run with Docker Compose:
```bash
docker-compose up --build
```

Or build and run manually:
```bash
docker build -t mentorlink-ai-services .
docker run -p 8000:8000 --env-file .env mentorlink-ai-services
```

## Testing

Run all tests:
```bash
poetry run pytest
```

Run with coverage:
```bash
poetry run pytest --cov=app --cov-report=html
```

Run specific test file:
```bash
poetry run pytest tests/test_main.py -v
```

## API Endpoints

### Health Check
```
GET /health
```

### Flashcard Generation (Task 7)
```
POST /ai/generate-flashcards
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "note_id": "uuid",
  "max_flashcards": 50
}
```

### Quiz Generation (Task 9)
```
POST /ai/generate-quiz
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "note_id": "uuid",
  "quiz_type": "mcq",
  "count": 10,
  "difficulty": "medium"
}
```

### PDF Indexing (Task 8)
```
POST /ai/index-pdf
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "note_id": "uuid"
}
```

### Chat with PDF (Task 8)
```
POST /ai/chat-pdf
Authorization: Bearer <supabase-jwt-token>
Content-Type: application/json

{
  "note_id": "uuid",
  "question": "What is this document about?",
  "history": []
}
```

## Architecture

### Project Structure
```
ai-services/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py          # JWT authentication
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── flashcards.py    # Flashcard endpoints
│   │   ├── quiz.py          # Quiz endpoints
│   │   └── chat.py          # Chat endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_extractor.py # PDF text extraction
│   │   ├── vector_db.py     # FAISS vector database
│   │   └── llm_provider.py  # OpenAI/Anthropic LLM
│   └── utils/
│       ├── __init__.py
│       └── rate_limiter.py  # Rate limiting
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── data/                    # FAISS index storage
├── pyproject.toml
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Key Components

1. **PDF Extractor**: Extracts text from PDFs using PyMuPDF with OCR fallback
2. **Vector Database**: FAISS-based semantic search with sentence-transformers
3. **LLM Provider**: OpenAI GPT-4 with Anthropic Claude fallback
4. **Rate Limiter**: In-memory rate limiting (10 req/min per user)
5. **Auth Middleware**: Supabase JWT token verification

## Troubleshooting

### Tesseract Not Found
If you get "tesseract not found" errors:
- Ensure Tesseract is installed
- Add Tesseract to your PATH
- On Windows, set: `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`

### FAISS Installation Issues
If FAISS installation fails:
```bash
poetry add faiss-cpu --platform linux  # or darwin for macOS
```

### OpenAI API Errors
- Verify your API key is correct
- Check your OpenAI account has credits
- Ensure you're not hitting rate limits

### Memory Issues
The sentence-transformer model requires ~500MB RAM. For production:
- Use at least 2GB RAM per worker
- Consider model quantization for lower memory usage

## Deployment

### Railway
1. Create new project on Railway
2. Connect GitHub repository
3. Set environment variables
4. Deploy from `ai-services` directory

### Render
1. Create new Web Service
2. Set build command: `pip install poetry && poetry install`
3. Set start command: `poetry run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables

### AWS/GCP/Azure
Use the provided Dockerfile for container deployment.

## Next Steps

The AI services infrastructure is now set up. The actual implementation of:
- Flashcard generation (Task 7)
- PDF chat (Task 8)
- Quiz generation (Task 9)

Will be completed in their respective tasks.

## Support

For issues or questions, refer to:
- FastAPI docs: https://fastapi.tiangolo.com
- Sentence-Transformers: https://www.sbert.net
- FAISS: https://github.com/facebookresearch/faiss
