"""Document generation, versioning, and download routes."""

from __future__ import annotations

import logging
from pathlib import Path
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.document import Document, DocumentType, DocumentLanguage
from app.models.candidate import CandidateProfile
from app.models.job import Job
from app.models.application import Application, ApplicationStatus
from app.schemas.document import (
    DocumentResponse,
    DocumentSummary,
    DocumentGenerateCV,
    DocumentGenerateCoverLetter,
    DocumentUpdate,
)
from app.schemas.common import PaginatedResponse
from app.services.documents.cv_generator import cv_generator
from app.services.documents.cover_letter import cover_letter_generator
from app.services.documents.pdf_export import pdf_exporter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


@router.get("", response_model=PaginatedResponse[DocumentResponse])
async def list_documents(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    type_filter: Optional[DocumentType] = Query(default=None, alias="type"),
    job_id: Optional[UUID] = Query(default=None),
    candidate_id: Optional[UUID] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """List generated documents."""
    stmt = select(Document)
    if type_filter:
        stmt = stmt.where(Document.type == type_filter)
    if job_id:
        stmt = stmt.where(Document.job_id == job_id)
    if candidate_id:
        stmt = stmt.where(Document.candidate_id == candidate_id)

    stmt = stmt.order_by(desc(Document.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    items = result.scalars().all()

    total_stmt = select(Document)
    total_res = await db.execute(total_stmt)
    total = len(total_res.scalars().all())

    return PaginatedResponse.create(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    """Fetch single document metadata and content."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("/generate-cv", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def generate_cv(payload: DocumentGenerateCV, db: AsyncSession = Depends(get_db)):
    """Generate a tailored CV for a specific job."""
    # Lookup candidate and job
    cand = (await db.execute(select(CandidateProfile).where(CandidateProfile.id == payload.candidate_id))).scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = (await db.execute(select(Job).where(Job.id == payload.job_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    lang_code = payload.language.value if hasattr(payload.language, "value") else str(payload.language)
    cv_markdown = await cv_generator.generate_cv(candidate=cand, job=job, language=lang_code)

    # Save PDF
    out_dir = Path("uploads/generated")
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"cv_{cand.name.replace(' ', '_')}_{job.company.replace(' ', '_')}_{payload.language}.pdf"
    pdf_path = out_dir / pdf_filename

    pdf_exporter.text_to_pdf(
        title=f"Curriculum Vitae — {cand.name}",
        text_content=cv_markdown,
        output_path=pdf_path,
    )

    # Get max version
    v_res = await db.execute(
        select(Document.version)
        .where(Document.job_id == job.id, Document.type == DocumentType.CV)
        .order_by(desc(Document.version))
        .limit(1)
    )
    last_v = v_res.scalar_one_or_none() or 0

    doc = Document(
        type=DocumentType.CV,
        language=payload.language,
        job_id=job.id,
        candidate_id=cand.id,
        content=cv_markdown,
        file_path=str(pdf_path),
        version=last_v + 1,
        is_approved=False,
        metadata_={"style": payload.style, "job_title": job.title, "company": job.company},
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Associate with application if one exists
    app_res = await db.execute(select(Application).where(Application.job_id == job.id))
    app = app_res.scalar_one_or_none()
    if app:
        app.cv_document_id = doc.id
        await db.commit()

    return doc


@router.post("/generate-cover-letter", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def generate_cover_letter(payload: DocumentGenerateCoverLetter, db: AsyncSession = Depends(get_db)):
    """Generate a targeted cover letter for a specific job."""
    cand = (await db.execute(select(CandidateProfile).where(CandidateProfile.id == payload.candidate_id))).scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job = (await db.execute(select(Job).where(Job.id == payload.job_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    lang_code = payload.language.value if hasattr(payload.language, "value") else str(payload.language)
    letter_text = await cover_letter_generator.generate_cover_letter(candidate=cand, job=job, language=lang_code)

    out_dir = Path("uploads/covers")
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_filename = f"cover_{cand.name.replace(' ', '_')}_{job.company.replace(' ', '_')}_{payload.language}.pdf"
    pdf_path = out_dir / pdf_filename

    pdf_exporter.text_to_pdf(
        title=f"Cover Letter — {cand.name} for {job.company}",
        text_content=letter_text,
        output_path=pdf_path,
    )

    v_res = await db.execute(
        select(Document.version)
        .where(Document.job_id == job.id, Document.type == DocumentType.COVER_LETTER)
        .order_by(desc(Document.version))
        .limit(1)
    )
    last_v = v_res.scalar_one_or_none() or 0

    doc = Document(
        type=DocumentType.COVER_LETTER,
        language=payload.language,
        job_id=job.id,
        candidate_id=cand.id,
        content=letter_text,
        file_path=str(pdf_path),
        version=last_v + 1,
        is_approved=False,
        metadata_={"tone": payload.tone, "job_title": job.title, "company": job.company},
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Associate with application if one exists
    app_res = await db.execute(select(Application).where(Application.job_id == job.id))
    app = app_res.scalar_one_or_none()
    if app:
        app.cover_letter_id = doc.id
        await db.commit()

    return doc


@router.get("/{doc_id}/download")
async def download_document(doc_id: UUID, db: AsyncSession = Depends(get_db)):
    """Download document as PDF."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # If file exists on disk
    if doc.file_path and Path(doc.file_path).exists():
        with open(doc.file_path, "rb") as f:
            content = f.read()
    elif doc.content:
        # Re-export on the fly
        content = pdf_exporter.text_to_pdf(
            title=f"{doc.type.value.upper()}",
            text_content=doc.content
        )
    else:
        raise HTTPException(status_code=404, detail="Document content empty")

    filename = Path(doc.file_path).name if doc.file_path else f"{doc.type.value}_{doc.id}.pdf"
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: UUID,
    payload: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Edit document text or mark approved."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.content is not None:
        doc.content = payload.content
        # Re-generate PDF if path exists
        if doc.file_path:
            pdf_exporter.text_to_pdf(
                title=f"{doc.type.value.upper()}",
                text_content=payload.content,
                output_path=doc.file_path,
            )

    if payload.is_approved is not None:
        doc.is_approved = payload.is_approved

    await db.commit()
    await db.refresh(doc)
    return doc

