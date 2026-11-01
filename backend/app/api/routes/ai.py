"""AI provider status and model selection routes."""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai.provider import ai_provider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Engine"])


class ProviderSelectRequest(BaseModel):
    provider: str  # "auto", "deepseek", "gemini", "openai"


@router.get("/providers")
async def get_providers_status():
    """Retrieve configuration and availability of DeepSeek, Gemini, and OpenAI."""
    return ai_provider.get_providers_status()


@router.post("/select")
async def select_provider(payload: ProviderSelectRequest):
    """Select preferred AI provider at runtime (e.g. 'auto', 'deepseek', 'gemini')."""
    ai_provider.set_active_preference(payload.provider)
    return {
        "status": "updated",
        "active_provider": payload.provider,
        "details": ai_provider.get_providers_status(),
    }

