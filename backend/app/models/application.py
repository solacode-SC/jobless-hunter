"""Application tracking model."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UUIDPrimaryKeyMixin


class ApplicationStatus(str, enum.Enum):
    DISCOVERED = "discovered"
    EVALUATING = "evaluating"
    QUALIFIED = "qualified"
    AWAITING_APPROVAL = "awaiting_approval"
    DOCUMENTS_READY = "documents_ready"
    APPLIED = "applied"
    INTERVIEW = "interview"
    ASSESSMENT = "assessment"
    REJECTED = "rejected"
    OFFER = "offer"
    WITHDRAWN = "withdrawn"


class Application(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "applications"

    # ── Foreign keys ─────────────────────────────────────────────────────
    job_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Status ───────────────────────────────────────────────────────────
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status_enum"),
        default=ApplicationStatus.DISCOVERED,
        nullable=False,
        index=True,
    )

    # ── Documents ────────────────────────────────────────────────────────
    cv_document_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )
    cover_letter_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )

    # ── Submission info ──────────────────────────────────────────────────
    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    submission_method: Mapped[str | None] = mapped_column(String(100), nullable=True)
    application_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # ── Recruiter ────────────────────────────────────────────────────────
    recruiter_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    recruiter_email: Mapped[str | None] = mapped_column(String(320), nullable=True)

    # ── Follow-up ────────────────────────────────────────────────────────
    follow_up_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── History ──────────────────────────────────────────────────────────
    history: Mapped[list | None] = mapped_column(JSON, default=list, nullable=True)

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
    job = relationship("Job", back_populates="applications", lazy="selectin")
    candidate = relationship(
        "CandidateProfile", back_populates="applications", lazy="selectin"
    )
    cv_document = relationship(
        "Document", foreign_keys=[cv_document_id], lazy="selectin"
    )
    cover_letter = relationship(
        "Document", foreign_keys=[cover_letter_id], lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} job_id={self.job_id} status={self.status}>"
