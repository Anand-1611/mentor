# Quick Start Guide

Get the AI services running in 5 minutes.

## Prerequisites

- Python 3.10+
- Poetry installed
- OpenAI API key

## Steps

### 1. Install Dependencies

```bash
cd ai-services
poetry install
```

This will install all required packages including FastAPI, PyMuPDF, sentence-transformers, FAISS, and OpenAI.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-your-openai-key
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Service

```bash
poetry run uvicorn app.main:app --reload
```

The service will start on http://localhost:8000

### 4. Verify

Open your browser:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

You should see:
```json
{
  "status": "healthy",
  "environment": "development"
}
```

## Testing the API

### With curl

```bash
# Health check
curl http://localhost:8000/health

# Test authentication (will fail without token)
curl -X POST http://localhost:8000/ai/generate-flashcards \
  -H "Content-Type: application/json" \
  -d '{"note_id": "test"}'
```

### With the Interactive Docs

1. Go to http://localhost:8000/docs
2. Click on any endpoint
3. Click "Try it out"
4. Add your Supabase JWT token in the Authorization header
5. Execute the request

## Common Issues

### "tesseract not found"
Install Tesseract OCR:
- Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
- Mac: `brew install tesseract`
- Linux: `sudo apt-get install tesseract-ocr`

### "Module not found"
Make sure you're in the poetry shell:
```bash
poetry shell
```

### "Port already in use"
Change the port:
```bash
poetry run uvicorn app.main:app --reload --port 8001
```

## Next Steps

- Read [SETUP.md](SETUP.md) for detailed configuration
- Read [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for React integration
- Check [docs/TASK_6_AI_SERVICES_COMPLETION.md](../docs/TASK_6_AI_SERVICES_COMPLETION.md) for architecture details

## Development

Run tests:
```bash
poetry run pytest
```

Format code:
```bash
poetry run black .
```

Check types:
```bash
poetry run ruff check .
```

## Docker (Alternative)

If you prefer Docker:

```bash
docker-compose up --build
```

The service will be available at http://localhost:8000

## Support

For issues, check:
1. Logs in the terminal
2. API docs at /docs
3. Health endpoint at /health
4. Environment variables in .env
