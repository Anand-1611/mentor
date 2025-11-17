"""Rate limiting utilities"""
from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio
from typing import Dict

from app.config import settings


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests_per_minute: int = None):
        """
        Initialize rate limiter
        
        Args:
            requests_per_minute: Maximum requests per minute per user
        """
        self.requests_per_minute = requests_per_minute or settings.rate_limit_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def check_rate_limit(self, user_id: str):
        """
        Check if user has exceeded rate limit
        
        Args:
            user_id: User identifier
            
        Raises:
            HTTPException: If rate limit exceeded
        """
        async with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=1)
            
            # Remove old requests
            self.requests[user_id] = [
                req_time for req_time in self.requests[user_id]
                if req_time > cutoff
            ]
            
            # Check limit
            if len(self.requests[user_id]) >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} requests per minute."
                )
            
            # Add current request
            self.requests[user_id].append(now)
    
    async def cleanup_old_entries(self):
        """Periodic cleanup of old entries"""
        while True:
            await asyncio.sleep(300)  # Run every 5 minutes
            async with self.lock:
                now = datetime.now()
                cutoff = now - timedelta(minutes=5)
                
                # Remove users with no recent requests
                users_to_remove = [
                    user_id for user_id, requests in self.requests.items()
                    if not requests or max(requests) < cutoff
                ]
                
                for user_id in users_to_remove:
                    del self.requests[user_id]


# Global rate limiter instance
_rate_limiter: RateLimiter = None


def get_rate_limiter() -> RateLimiter:
    """Get or create global rate limiter instance"""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = RateLimiter()
    return _rate_limiter
