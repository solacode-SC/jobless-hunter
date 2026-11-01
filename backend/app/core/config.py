"""Application configuration loaded from environment variables."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings sourced from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────
    APP_NAME: str = "Jobless Hunter"
    APP_VERSION: str = "1.0.0"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # ── Server ───────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/jobhunter"
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # ── Redis ────────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # seconds

    # ── JWT / Auth ───────────────────────────────────────────────────────
    SECRET_KEY: str = "CHANGE-ME-IN-PRODUCTION-use-openssl-rand-hex-64"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── AI / LLM Multi-Provider (DeepSeek, Gemini, OpenAI) ─────────────
    AI_PROVIDER: str = "auto"  # "auto", "deepseek", "gemini", "openai"
    AI_API_KEY: str = ""
    AI_BASE_URL: str = ""
    AI_MODEL: str = ""

    # DeepSeek AI
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    DEEPSEEK_MODEL: str = "deepseek-chat"

    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_BASE_URL: str = "https://generativelanguage.googleapis.com/v1beta/openai"
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_MAX_TOKENS: int = 4096
    OPENAI_TEMPERATURE: float = 0.3

    # ── Discovery ────────────────────────────────────────────────────────
    SERPAPI_KEY: str = ""
    LINKEDIN_EMAIL: str = ""
    LINKEDIN_PASSWORD: str = ""
    INDEED_API_KEY: str = ""

    # ── Documents ────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    GENERATED_DOCS_DIR: str = "generated"
    MAX_UPLOAD_SIZE_MB: int = 10

    # ── Email (Gmail monitoring) ─────────────────────────────────────────
    GMAIL_CREDENTIALS_PATH: str = ""
    GMAIL_TOKEN_PATH: str = ""

    # ── Celery ───────────────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @property
    def upload_path(self) -> Path:
        p = Path(self.UPLOAD_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def generated_docs_path(self) -> Path:
        p = Path(self.GENERATED_DOCS_DIR)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
