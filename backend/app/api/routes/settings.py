"""Settings and Block Keys Management API."""

from __future__ import annotations

import logging
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.candidate import CandidateProfile
from app.services.ai.blocklist import DEFAULT_BLOCK_KEYS
from app.services.ai.provider import ai_provider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["Settings"])


class BlockKeysModel(BaseModel):
    companies: list[str] = Field(default_factory=list)
    locations: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class SettingsPayload(BaseModel):
    block_keys: Optional[BlockKeysModel] = None
    ai_provider_preference: Optional[str] = None  # "auto", "deepseek", "gemini", "openai"
    qualification_threshold: Optional[int] = Field(default=70, ge=50, le=100)
    connectors: Optional[dict[str, bool]] = None


async def get_or_create_candidate(db: AsyncSession) -> CandidateProfile:
    result = await db.execute(select(CandidateProfile).limit(1))
    candidate = result.scalar_one_or_none()
    if not candidate:
        candidate = CandidateProfile(
            name="Solayman El Mouden",
            email="solayman.elmouden@gmail.com",
            professional_title="Software Engineer",
            preferences={"block_keys": DEFAULT_BLOCK_KEYS},
        )
        db.add(candidate)
        await db.commit()
        await db.refresh(candidate)
    return candidate


@router.get("/block-keys")
async def get_block_keys(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Retrieve candidate block keys (companies, regions/countries, roles, keywords)."""
    candidate = await get_or_create_candidate(db)
    preferences = candidate.preferences or {}
    block_keys = preferences.get("block_keys")

    if not block_keys:
        block_keys = DEFAULT_BLOCK_KEYS
        # Persist default if not present
        preferences["block_keys"] = block_keys
        candidate.preferences = dict(preferences)
        await db.commit()

    return {
        "status": "success",
        "block_keys": block_keys,
    }


@router.post("/block-keys")
async def update_block_keys(
    payload: BlockKeysModel,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Update candidate block keys for skipping offers matching companies, regions, roles, or keywords."""
    candidate = await get_or_create_candidate(db)
    preferences = dict(candidate.preferences or {})

    clean_block_keys = {
        "companies": [c.strip() for c in payload.companies if c.strip()],
        "locations": [l.strip() for l in payload.locations if l.strip()],
        "roles": [r.strip() for r in payload.roles if r.strip()],
        "keywords": [k.strip() for k in payload.keywords if k.strip()],
    }

    preferences["block_keys"] = clean_block_keys
    candidate.preferences = preferences

    await db.commit()
    await db.refresh(candidate)

    logger.info("Updated block keys for candidate %s: %s", candidate.id, clean_block_keys)
    return {
        "status": "updated",
        "message": "Block keys updated successfully. Agent will skip matching offers.",
        "block_keys": clean_block_keys,
    }


@router.get("")
async def get_all_settings(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Retrieve full system settings including block keys, AI engine, and discovery rules."""
    candidate = await get_or_create_candidate(db)
    preferences = candidate.preferences or {}

    block_keys = preferences.get("block_keys") or DEFAULT_BLOCK_KEYS
    threshold = preferences.get("qualification_threshold", 70)
    connectors = preferences.get("connectors", {
        "remote_board": True,
        "linkedin": True,
        "indeed": True,
        "google_jobs": True,
    })

    return {
        "status": "success",
        "block_keys": block_keys,
        "ai_provider_preference": ai_provider.active_preference,
        "qualification_threshold": threshold,
        "connectors": connectors,
        "ports": {
            "frontend": 9876,
            "n8n": 9877,
            "backend": 9878,
            "postgres": 9879,
            "redis": 9880,
            "browser_worker": 9881,
        },
    }


@router.post("")
async def save_all_settings(
    payload: SettingsPayload,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Save full system settings (block keys, AI provider preference, threshold, connectors)."""
    candidate = await get_or_create_candidate(db)
    preferences = dict(candidate.preferences or {})

    if payload.block_keys is not None:
        preferences["block_keys"] = {
            "companies": [c.strip() for c in payload.block_keys.companies if c.strip()],
            "locations": [l.strip() for l in payload.block_keys.locations if l.strip()],
            "roles": [r.strip() for r in payload.block_keys.roles if r.strip()],
            "keywords": [k.strip() for k in payload.block_keys.keywords if k.strip()],
        }

    if payload.qualification_threshold is not None:
        preferences["qualification_threshold"] = payload.qualification_threshold

    if payload.connectors is not None:
        preferences["connectors"] = payload.connectors

    if payload.ai_provider_preference is not None:
        ai_provider.set_active_preference(payload.ai_provider_preference)
        preferences["ai_provider_preference"] = payload.ai_provider_preference

    candidate.preferences = preferences
    await db.commit()
    await db.refresh(candidate)

    return {
        "status": "updated",
        "message": "Settings and block keys saved successfully.",
        "settings": {
            "block_keys": preferences.get("block_keys"),
            "ai_provider_preference": ai_provider.active_preference,
            "qualification_threshold": preferences.get("qualification_threshold", 70),
            "connectors": preferences.get("connectors"),
        },
    }

