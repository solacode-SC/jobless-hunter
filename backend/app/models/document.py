"""Document model for generated CVs and cover letters."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, UUIDPrimaryKeyMixin


class DocumentType(str, enum.Enum):
    CV = "cv"
    COVER_LETTER = "cover_letter"


class DocumentLanguage(str, enum.Enum):
    EN = "en"
    FR = "fr"


class Document(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "documents"

    # ── Type / language ──────────────────────────────────────────────────
    type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, name="document_type_enum"),
        nullable=False,
    )
    language: Mapped[DocumentLanguage] = mapped_column(
        Enum(DocumentLanguage, name="document_language_enum"),
        default=DocumentLanguage.EN,
        nullable=False,
    )

    # ── Foreign keys ─────────────────────────────────────────────────────
    job_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    candidate_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("candidate_profiles.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── Content ──────────────────────────────────────────────────────────
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # ── Versioning ───────────────────────────────────────────────────────
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Metadata ─────────────────────────────────────────────────────────
    metadata_: Mapped[dict | None] = mapped_column(
        "metadata", JSON, nullable=True
    )

    # ── Timestamps ───────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # ── Relationships ────────────────────────────────────────────────────
    job = relationship("Job", back_populates="documents", lazy="selectin")
    candidate = relationship(
        "CandidateProfile", back_populates="documents", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Document id={self.id} type={self.type} version={self.version}>"
