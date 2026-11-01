"""Candidate profile schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class CandidateCreate(BaseModel):
    """Create a candidate profile."""

    name: str = Field(max_length=300)
    email: EmailStr
    professional_title: str | None = None
    phone: str | None = None
    education: list[dict[str, Any]] | None = None
    experience: list[dict[str, Any]] | None = None
    skills: list[str] | None = None
    portfolio_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    summary: str | None = None
    preferences: dict[str, Any] | None = None


class CandidateUpdate(BaseModel):
    """Update candidate profile fields."""

    name: str | None = Field(default=None, max_length=300)
    email: EmailStr | None = None
    professional_title: str | None = None
    phone: str | None = None
    education: list[dict[str, Any]] | None = None
    experience: list[dict[str, Any]] | None = None
    skills: list[str] | None = None
    portfolio_url: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    summary: str | None = None
    preferences: dict[str, Any] | None = None


class CandidateResponse(BaseModel):
    """Full candidate response."""

    id: UUID
    name: str
    email: str
    professional_title: str | None
    phone: str | None
    education: list[dict[str, Any]] | None
    experience: list[dict[str, Any]] | None
    skills: list[str] | None
    portfolio_url: str | None
    github_url: str | None
    linkedin_url: str | None
    original_cv_path: str | None
    cv_data: dict[str, Any] | None
    preferences: dict[str, Any] | None
    summary: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
