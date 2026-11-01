"""Document schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel

from app.models.document import DocumentLanguage, DocumentType


class DocumentGenerateCV(BaseModel):
    """Request to generate a tailored CV."""

    candidate_id: UUID
    job_id: UUID
    language: DocumentLanguage = DocumentLanguage.EN
    style: str | None = "professional"


class DocumentGenerateCoverLetter(BaseModel):
    """Request to generate a cover letter."""

    candidate_id: UUID
    job_id: UUID
    language: DocumentLanguage = DocumentLanguage.EN
    tone: str | None = "professional"


class DocumentUpdate(BaseModel):
    """Update document content."""

    content: str | None = None
    is_approved: bool | None = None


class DocumentResponse(BaseModel):
    """Full document response."""

    id: UUID
    type: DocumentType
    language: DocumentLanguage
    job_id: UUID | None
    candidate_id: UUID | None
    content: str | None
    file_path: str | None
    version: int
    is_approved: bool
    metadata_: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentSummary(BaseModel):
    """Compact document listing."""

    id: UUID
    type: DocumentType
    language: DocumentLanguage
    job_id: UUID | None
    version: int
    is_approved: bool
    created_at: datetime

    model_config = {"from_attributes": True}
