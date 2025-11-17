"""
Monitoring middleware for FastAPI
Tracks request/response metrics and logs API calls
"""
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.monitoring import track_api_call, log


class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor API requests and responses"""
    
    async def dispatch(self, request: Request, call_next):
        # Start timing
        start_time = time.time()
        
        # Log incoming request
        log.debug(f"Incoming request: {request.method} {request.url.path}", {
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else "unknown"
        })
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Track API call
            track_api_call(
                endpoint=request.url.path,
                method=request.method,
                status_code=response.status_code,
                duration_ms=duration_ms
            )
            
            # Add custom headers
            response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000
            
            # Log error
            log.error(f"Request failed: {request.method} {request.url.path}", {
                "method": request.method,
                "path": request.url.path,
                "duration_ms": duration_ms,
                "error": str(e)
            })
            
            # Track failed request
            track_api_call(
                endpoint=request.url.path,
                method=request.method,
                status_code=500,
                duration_ms=duration_ms
            )
            
            raise
