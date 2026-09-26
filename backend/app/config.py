import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "RailOne"
    TAGLINE: str = "Your journey, simplified."
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "railone-super-secret-production-grade-key-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL: Supports SQLite for dev/testing and PostgreSQL for Render/prod
    # Render postgresql URLs usually start with postgres:// which SQLAlchemy requires as postgresql://
    raw_db_url: str = os.getenv("DATABASE_URL", "sqlite:///./railone.db")
    
    @property
    def DATABASE_URL(self) -> str:
        url = self.raw_db_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://railone.vercel.app",
        "*"
    ]
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
