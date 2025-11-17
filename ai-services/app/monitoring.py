"""
Monitoring and Logging Utilities for AI Services
Provides structured logging and error tracking
"""
import logging
import json
import time
from typing import Any, Dict, Optional
from functools import wraps
from datetime import datetime

# Configure structured logging
logger = logging.getLogger(__name__)


class StructuredLogger:
    """Structured logging for Better Stack integration"""
    
    @staticmethod
    def log(
        level: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ):
        """Log structured message"""
        log_entry = {
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            "service": "ai-services",
            **(context or {})
        }
        
        log_method = getattr(logger, level.lower(), logger.info)
        log_method(json.dumps(log_entry))
    
    @staticmethod
    def info(message: str, context: Optional[Dict[str, Any]] = None):
        StructuredLogger.log("info", message, context)
    
    @staticmethod
    def warning(message: str, context: Optional[Dict[str, Any]] = None):
        StructuredLogger.log("warning", message, context)
    
    @staticmethod
    def error(message: str, context: Optional[Dict[str, Any]] = None):
        StructuredLogger.log("error", message, context)
    
    @staticmethod
    def debug(message: str, context: Optional[Dict[str, Any]] = None):
        StructuredLogger.log("debug", message, context)


class PerformanceMonitor:
    """Monitor operation performance"""
    
    def __init__(self, operation: str, context: Optional[Dict[str, Any]] = None):
        self.operation = operation
        self.context = context or {}
        self.start_time = time.time()
        
        StructuredLogger.debug(f"Starting: {operation}", self.context)
    
    def finish(self, additional_context: Optional[Dict[str, Any]] = None):
        """Finish monitoring and log duration"""
        duration_ms = (time.time() - self.start_time) * 1000
        context = {
            **self.context,
            **(additional_context or {}),
            "duration_ms": duration_ms
        }
        
        StructuredLogger.info(f"Completed: {self.operation}", context)
        
        # Warn on slow operations
        if duration_ms > 5000:
            StructuredLogger.warning(f"Slow operation: {self.operation}", context)
        
        return duration_ms
    
    def error(self, error: Exception, additional_context: Optional[Dict[str, Any]] = None):
        """Log error with duration"""
        duration_ms = (time.time() - self.start_time) * 1000
        context = {
            **self.context,
            **(additional_context or {}),
            "duration_ms": duration_ms,
            "error": str(error),
            "error_type": type(error).__name__
        }
        
        StructuredLogger.error(f"Failed: {self.operation}", context)


def monitor_performance(operation_name: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            monitor = PerformanceMonitor(operation_name, {
                "function": func.__name__
            })
            try:
                result = await func(*args, **kwargs)
                monitor.finish()
                return result
            except Exception as e:
                monitor.error(e)
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            monitor = PerformanceMonitor(operation_name, {
                "function": func.__name__
            })
            try:
                result = func(*args, **kwargs)
                monitor.finish()
                return result
            except Exception as e:
                monitor.error(e)
                raise
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def track_api_call(endpoint: str, method: str, status_code: int, duration_ms: float):
    """Track API call metrics"""
    level = "error" if status_code >= 500 else "warning" if status_code >= 400 else "info"
    
    StructuredLogger.log(level, f"API Call: {method} {endpoint}", {
        "endpoint": endpoint,
        "method": method,
        "status_code": status_code,
        "duration_ms": duration_ms
    })


def track_llm_call(
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    duration_ms: float,
    success: bool = True
):
    """Track LLM API call metrics"""
    StructuredLogger.info("LLM Call", {
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
        "duration_ms": duration_ms,
        "success": success
    })


def track_pdf_processing(
    note_id: str,
    operation: str,
    pages: int,
    duration_ms: float,
    success: bool = True
):
    """Track PDF processing metrics"""
    StructuredLogger.info("PDF Processing", {
        "note_id": note_id,
        "operation": operation,
        "pages": pages,
        "duration_ms": duration_ms,
        "success": success
    })


def report_error(error: Exception, context: Optional[Dict[str, Any]] = None):
    """Report error with context"""
    StructuredLogger.error(str(error), {
        **(context or {}),
        "error_type": type(error).__name__,
        "error_message": str(error)
    })


# Export logger instance
log = StructuredLogger()
