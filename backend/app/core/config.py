import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "RailOne"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", 8000))
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "railone-super-secret-jwt-key-2026-production-ready")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # SQLite by default for instant zero-dependency local runs and tests,
    # or PostgreSQL for Docker, Render, and production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./railone.db")
    
    # Cloud URLs
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")
    
    DEMO_ADMIN_EMAIL: str = "admin@railone.local"
    DEMO_ADMIN_PASSWORD: str = "Admin@123"
    DEMO_USER_EMAIL: str = "user@railone.local"
    DEMO_USER_PASSWORD: str = "User@123"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        # Render and Supabase often provide URLs starting with postgres://
        # SQLAlchemy 2.0 requires postgresql://
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def allowed_cors_origins(self) -> List[str]:
        origins = {
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        }
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.rstrip("/"))
        
        if self.CORS_ORIGINS:
            for item in self.CORS_ORIGINS.split(","):
                clean = item.strip().rstrip("/")
                if clean:
                    origins.add(clean)
        
        return list(origins)

settings = Settings()
