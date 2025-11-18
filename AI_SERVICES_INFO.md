# AI Services - Optional Features

## What Are AI Services?

The MentorLink platform includes optional AI-powered features:
- **Flashcard Generation** - Auto-generate flashcards from PDF notes
- **Quiz Generation** - Create quizzes from study materials
- **PDF Chat** - Ask questions about PDF content using AI

These features require a separate Python backend service.

## Current Status

⚠️ **AI Services are NOT running** - This is normal and expected!

The errors you're seeing (`ERR_CONNECTION_REFUSED` to `localhost:8000`) are because the AI service isn't running. This is **completely fine** - the core app works without it.

## What Works Without AI Services

✅ **All core features work perfectly**:
- User authentication
- Note uploads and downloads
- Mentor applications and verification tests
- Booking mentor sessions
- Community posts
- Payments (mock mode)
- Admin dashboard

## What Doesn't Work Without AI Services

❌ **Only AI features are unavailable**:
- Generate flashcards from PDFs (button won't work)
- Generate quizzes from PDFs (button won't work)
- Chat with PDF (feature won't work)

## Options

### Option 1: Ignore AI Features (Recommended for MVP)

The AI features are **optional enhancements**. Your app is fully functional without them!

**What to do**: Nothing! Just ignore the console errors. They don't affect the core functionality.

### Option 2: Deploy AI Services (Advanced)

If you want AI features, you need to deploy the Python backend.

**Requirements**:
- Python 3.11+
- Poetry (Python package manager)
- OpenAI API key or Anthropic API key
- Vector database (FAISS)

**Quick Start**:
```bash
cd ai-services
poetry install
cp .env.example .env
# Edit .env with your API keys
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Deployment Options**:
- Railway (easiest - see `ai-services/railway.json`)
- Render (see `ai-services/render.yaml`)
- Docker (see `ai-services/Dockerfile`)
- Any Python hosting service

**Documentation**:
- `ai-services/README.md` - Overview
- `ai-services/SETUP.md` - Detailed setup
- `ai-services/QUICKSTART.md` - Quick start guide
- `ai-services/FRONTEND_INTEGRATION.md` - Integration guide

### Option 3: Hide AI Features in UI

You can hide the AI feature buttons in the UI if you don't plan to use them.

**Files to modify**:
- `src/components/notes/FlashcardGenerator.tsx` - Hide flashcard button
- `src/components/notes/QuizGenerator.tsx` - Hide quiz button
- `src/components/notes/PDFChatSidebar.tsx` - Hide chat feature

## Improved Error Handling

I've added better error handling to the AI service calls:
- Checks if service is available before making requests
- Shows user-friendly error messages
- Prevents console spam with connection errors

The errors will still appear in console but with clearer messages.

## For Production

If you deploy to production without AI services:
1. The app works fine
2. Users just won't see AI features
3. No impact on core functionality

If you want AI features in production:
1. Deploy the AI service to Railway/Render/etc
2. Set `VITE_AI_SERVICE_URL` environment variable in Netlify
3. Restart Netlify deployment

## Summary

**TL;DR**: The AI service errors are normal. Your app works great without them. AI features are optional enhancements you can add later if needed.

---

**Status**: AI services are optional and not required for MVP
**Impact**: None on core functionality
**Action**: No action needed unless you want AI features
