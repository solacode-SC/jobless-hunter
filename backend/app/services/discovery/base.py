"""Base connector definition for job discovery sources."""

from __future__ import annotations

import abc
from typing import Any
from pydantic import BaseModel
from app.models.job import JobSource, RemoteStatus, EmploymentType


class DiscoveredJob(BaseModel):
    """Normalized job record returned by connectors."""
    title: str
    company: str
    description: str
    location: str | None = None
    remote_status: RemoteStatus = RemoteStatus.UNKNOWN
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str | None = None
    required_skills: list[str] = []
    experience_years_min: int | None = None
    source: JobSource = JobSource.OTHER
    source_url: str
    source_job_id: str | None = None
    raw_data: dict[str, Any] = {}


class BaseConnector(abc.ABC):
    """Abstract interface for a job source connector."""

    source_name: JobSource

    @abc.abstractmethod
    async def discover(self, query: str = "Software Engineer", location: str | None = None, limit: int = 50) -> list[DiscoveredJob]:
        """Fetch jobs matching the query parameters."""
        pass

