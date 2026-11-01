"""Application tracking and pipeline management routes."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.application import Application, ApplicationStatus
from app.models.job import Job
from app.models.candidate import CandidateProfile
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
    ApplicationUpdate,
    ApplicationSummary,
    PipelineResponse,
    PipelineStage,
)
from app.schemas.common import PaginatedResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/applications", tags=["Applications"])


@router.get("", response_model=PaginatedResponse[ApplicationResponse])
async def list_applications(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status_filter: Optional[ApplicationStatus] = Query(default=None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    """List applications with optional status filter."""
    stmt = select(Application)
    if status_filter:
        stmt = stmt.where(Application.status == status_filter)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one()

    stmt = stmt.order_by(desc(Application.updated_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    items = result.scalars().all()

    return PaginatedResponse.create(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/pipeline", response_model=PipelineResponse)
async def get_pipeline(db: AsyncSession = Depends(get_db)):
    """Retrieve full Kanban pipeline view."""
    # Load all applications joined with Job
    stmt = select(Application).options(selectinload(Application.job)).order_by(desc(Application.updated_at))
    res = await db.execute(stmt)
    apps = res.scalars().all()

    stages_dict: dict[str, list[ApplicationSummary]] = {s.value: [] for s in ApplicationStatus}

    for app in apps:
        status_key = app.status.value if hasattr(app.status, "value") else str(app.status)
        summary = ApplicationSummary(
            id=app.id,
            job_id=app.job_id,
            status=app.status,
            job_title=app.job.title if app.job else "Unknown",
            company=app.job.company if app.job else "Unknown",
            created_at=app.created_at,
        )
        if status_key in stages_dict:
            stages_dict[status_key].append(summary)

    stages = [
        PipelineStage(status=st, count=len(items), applications=items)
        for st, items in stages_dict.items()
    ]

    return PipelineResponse(stages=stages, total=len(apps))


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(app_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get single application details."""
    res = await db.execute(select(Application).where(Application.id == app_id))
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(payload: ApplicationCreate, db: AsyncSession = Depends(get_db)):
    """Create a new application for a job."""
    # Verify job and candidate exist
    job = (await db.execute(select(Job).where(Job.id == payload.job_id))).scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    cand = (await db.execute(select(CandidateProfile).where(CandidateProfile.id == payload.candidate_id))).scalar_one_or_none()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate profile not found")

    # Check duplicate application for this job
    existing = (await db.execute(select(Application).where(Application.job_id == payload.job_id))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="An application for this job already exists")

    now_iso = datetime.now(timezone.utc).isoformat()
    app = Application(
        job_id=payload.job_id,
        candidate_id=payload.candidate_id,
        status=ApplicationStatus.DISCOVERED,
        notes=payload.notes,
        history=[{"status": ApplicationStatus.DISCOVERED.value, "timestamp": now_iso, "note": "Application record initialized"}],
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return app


@router.patch("/{app_id}/status", response_model=ApplicationResponse)
async def update_application_status(
    app_id: UUID,
    payload: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update status with audit history."""
    res = await db.execute(select(Application).where(Application.id == app_id))
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    app.status = payload.status

    if payload.status == ApplicationStatus.APPLIED and not app.submitted_at:
        app.submitted_at = datetime.now(timezone.utc)

    # Append to history
    now_iso = datetime.now(timezone.utc).isoformat()
    history = list(app.history or [])
    history.append({
        "from": old_status.value if hasattr(old_status, "value") else str(old_status),
        "to": payload.status.value if hasattr(payload.status, "value") else str(payload.status),
        "timestamp": now_iso,
        "notes": payload.notes,
    })
    app.history = history

    await db.commit()
    await db.refresh(app)
    return app


@router.post("/{app_id}/approve", response_model=ApplicationResponse)
async def approve_application(app_id: UUID, db: AsyncSession = Depends(get_db)):
    """Approve application for submission."""
    res = await db.execute(select(Application).where(Application.id == app_id))
    app = res.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = ApplicationStatus.DOCUMENTS_READY
    history = list(app.history or [])
    history.append({
        "action": "approved",
        "to": ApplicationStatus.DOCUMENTS_READY.value,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "note": "Approved by user for submission"
    })
    app.history = history

    await db.commit()
    await db.refresh(app)
    return app
