"""Candidate profile model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UUIDPrimaryKeyMixin


class CandidateProfile(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "candidate_profiles"

    # ── Identity ─────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    professional_title: Mapped[str | None] = mapped_column(String(300), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # ── Professional details (structured JSON) ───────────────────────────
    education: Mapped[list | None] = mapped_column(JSON, nullable=True)
    experience: Mapped[list | None] = mapped_column(JSON, nullable=True)
    skills: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # ── Links ────────────────────────────────────────────────────────────
    portfolio_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    github_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    # ── CV data ──────────────────────────────────────────────────────────
    original_cv_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    cv_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Preferences ──────────────────────────────────────────────────────
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # ── Summary ──────────────────────────────────────────────────────────
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

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
    applications = relationship(
        "Application", back_populates="candidate", lazy="selectin"
    )
    documents = relationship(
        "Document", back_populates="candidate", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CandidateProfile id={self.id} name={self.name!r}>"
