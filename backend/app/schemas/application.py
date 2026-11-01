"""Application schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.application import ApplicationStatus


class ApplicationCreate(BaseModel):
    """Create a new application from a job."""

    job_id: UUID
    candidate_id: UUID
    notes: str | None = None


class ApplicationStatusUpdate(BaseModel):
    """Update application status."""

    status: ApplicationStatus
    notes: str | None = None


class ApplicationUpdate(BaseModel):
    """General application update."""

    recruiter_name: str | None = None
    recruiter_email: str | None = None
    application_url: str | None = None
    submission_method: str | None = None
    follow_up_date: datetime | None = None
    notes: str | None = None


class ApplicationResponse(BaseModel):
    """Full application response."""

    id: UUID
    job_id: UUID
    candidate_id: UUID
    status: ApplicationStatus
    cv_document_id: UUID | None
    cover_letter_id: UUID | None
    submitted_at: datetime | None
    submission_method: str | None
    application_url: str | None
    recruiter_name: str | None
    recruiter_email: str | None
    follow_up_date: datetime | None
    notes: str | None
    history: list[dict[str, Any]] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ApplicationSummary(BaseModel):
    """Compact application listing."""

    id: UUID
    job_id: UUID
    status: ApplicationStatus
    job_title: str | None = None
    company: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PipelineStage(BaseModel):
    """A stage in the application pipeline."""

    status: str
    count: int
    applications: list[ApplicationSummary]


class PipelineResponse(BaseModel):
    """Full pipeline view."""

    stages: list[PipelineStage]
    total: int
