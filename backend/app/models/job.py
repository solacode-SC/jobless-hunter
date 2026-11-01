"""Job listing model."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UUIDPrimaryKeyMixin


class RemoteStatus(str, enum.Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"
    UNKNOWN = "unknown"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"


class JobSource(str, enum.Enum):
    LINKEDIN = "linkedin"
    INDEED = "indeed"
    GOOGLE_JOBS = "google_jobs"
    FACEBOOK = "facebook"
    COMPANY_PAGE = "company_page"
    REMOTE_BOARD = "remote_board"
    OTHER = "other"


class JobStatus(str, enum.Enum):
    DISCOVERED = "discovered"
    EVALUATING = "evaluating"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"
    APPLIED = "applied"
    EXPIRED = "expired"


class Job(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "jobs"

    # ── Core info ────────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    remote_status: Mapped[RemoteStatus] = mapped_column(
        Enum(RemoteStatus, name="remote_status_enum"),
        default=RemoteStatus.UNKNOWN,
        nullable=False,
    )
    employment_type: Mapped[EmploymentType | None] = mapped_column(
        Enum(EmploymentType, name="employment_type_enum"),
        nullable=True,
    )

    # ── Salary ───────────────────────────────────────────────────────────
    salary_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    salary_currency: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # ── Requirements ─────────────────────────────────────────────────────
    required_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    experience_years_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    experience_years_max: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # ── Source ───────────────────────────────────────────────────────────
    source: Mapped[JobSource] = mapped_column(
        Enum(JobSource, name="job_source_enum"),
        default=JobSource.OTHER,
        nullable=False,
    )
    source_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source_job_id: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # ── Dates ────────────────────────────────────────────────────────────
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    discovered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    application_deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # ── Deduplication & matching ─────────────────────────────────────────
    fingerprint: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True
    )
    match_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    match_explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Status ───────────────────────────────────────────────────────────
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, name="job_status_enum"),
        default=JobStatus.DISCOVERED,
        nullable=False,
        index=True,
    )

    # ── Raw data ─────────────────────────────────────────────────────────
    raw_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ────────────────────────────────────────────────────
    applications = relationship("Application", back_populates="job", lazy="selectin")
    documents = relationship("Document", back_populates="job", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title!r} company={self.company!r}>"
