"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.routers import flashcards, quiz, chat
from app.utils.rate_limiter import get_rate_limiter
from app.middleware.monitoring import MonitoringMiddleware


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Create FastAPI application
app = FastAPI(
    title="MentorLink AI Services",
    description="AI microservices for flashcard generation, quiz creation, and PDF chat",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app"  # Allow Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add monitoring middleware
app.add_middleware(MonitoringMiddleware)


# Include routers
app.include_router(flashcards.router)
app.include_router(quiz.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting MentorLink AI Services")
    
    # Initialize rate limiter cleanup task
    rate_limiter = get_rate_limiter()
    import asyncio
    asyncio.create_task(rate_limiter.cleanup_old_entries())
    
    logger.info("AI Services initialized successfully")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "MentorLink AI Services",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with service status"""
    from datetime import datetime
    
    # Check service health
    services = {
        "api": "healthy",
        "llm": "unknown",
        "storage": "unknown"
    }
    
    # Try to check LLM availability
    try:
        from app.services.llm_service import LLMService
        llm_service = LLMService()
        # Quick check without actual API call
        services["llm"] = "healthy" if llm_service.client else "unhealthy"
    except Exception as e:
        logger.warning(f"LLM health check failed: {e}")
        services["llm"] = "unhealthy"
    
    # Overall status
    overall_status = "healthy" if all(s in ["healthy", "unknown"] for s in services.values()) else "degraded"
    
    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "version": "0.1.0",
        "environment": settings.environment,
        "services": services
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.environment == "development" else "An unexpected error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
