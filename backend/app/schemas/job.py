"""Job schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.job import EmploymentType, JobSource, JobStatus, RemoteStatus


class JobBase(BaseModel):
    title: str = Field(max_length=500)
    company: str = Field(max_length=300)
    description: str | None = None
    location: str | None = None
    remote_status: RemoteStatus = RemoteStatus.UNKNOWN
    employment_type: EmploymentType | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None
    required_skills: list[str] | None = None
    experience_years_min: int | None = None
    experience_years_max: int | None = None
    source: JobSource = JobSource.OTHER
    source_url: str | None = None
    source_job_id: str | None = None
    published_at: datetime | None = None
    application_deadline: datetime | None = None


class JobCreate(JobBase):
    """Used internally when storing discovered jobs."""

    fingerprint: str
    raw_data: dict[str, Any] | None = None


class JobResponse(JobBase):
    """Full job response."""

    id: UUID
    fingerprint: str
    match_score: float | None = None
    match_explanation: str | None = None
    status: JobStatus
    discovered_at: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JobSummary(BaseModel):
    """Compact job listing for list views."""

    id: UUID
    title: str
    company: str
    location: str | None
    remote_status: RemoteStatus
    employment_type: EmploymentType | None
    source: JobSource
    match_score: float | None
    status: JobStatus
    discovered_at: datetime

    model_config = {"from_attributes": True}


class JobFilters(BaseModel):
    """Query filters for job listing."""

    status: JobStatus | None = None
    source: JobSource | None = None
    remote_status: RemoteStatus | None = None
    employment_type: EmploymentType | None = None
    min_match_score: float | None = Field(default=None, ge=0, le=100)
    search: str | None = None
    sort_by: str = "discovered_at"
    sort_order: str = "desc"


class JobStats(BaseModel):
    """Job discovery statistics."""

    total: int
    by_status: dict[str, int]
    by_source: dict[str, int]
    by_remote_status: dict[str, int]
    avg_match_score: float | None
    discovered_today: int
    discovered_this_week: int


class JobEvaluateRequest(BaseModel):
    """Request to evaluate/match a job."""

    candidate_id: UUID


class JobEvaluateResponse(BaseModel):
    """Job evaluation result."""

    job_id: UUID
    match_score: float
    match_explanation: str
    status: JobStatus
