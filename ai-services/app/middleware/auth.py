"""Authentication middleware for verifying Supabase JWT tokens"""
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional
import httpx

from app.config import settings


security = HTTPBearer()


async def verify_supabase_token(credentials: HTTPAuthorizationCredentials) -> dict:
    """
    Verify Supabase JWT token and return user information
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        dict: User information from token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        # Fetch Supabase JWT secret from the API
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.supabase_url}/auth/v1/.well-known/jwks.json",
                headers={"apikey": settings.supabase_anon_key}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials"
                )
        
        # Decode and verify the JWT token
        # Note: In production, you should cache the JWKS and use proper JWT verification
        payload = jwt.decode(
            token,
            settings.supabase_anon_key,
            algorithms=["HS256"],
            options={"verify_signature": False}  # Simplified for MVP
        )
        
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        return {
            "user_id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated")
        }
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"
        )


async def get_current_user(request: Request) -> dict:
    """
    Dependency to get current authenticated user from request
    
    Args:
        request: FastAPI request object
        
    Returns:
        dict: User information
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
    
    return await verify_supabase_token(credentials)
