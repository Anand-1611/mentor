"""Configuration management for AI services"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    
    # OpenAI Configuration
    openai_api_key: str
    
    # Anthropic Configuration (Fallback)
    anthropic_api_key: Optional[str] = None
    
    # CORS Configuration
    frontend_url: str = "http://localhost:5173"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    
    # Rate Limiting
    rate_limit_per_minute: int = 10
    
    # Vector Database
    faiss_index_path: str = "./data/faiss_index"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
