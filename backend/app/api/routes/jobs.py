"""Job listings and evaluation API routes."""

from __future__ import annotations

import logging
from uuid import UUID
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, desc, asc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.job import Job, JobStatus, JobSource, RemoteStatus, EmploymentType
from app.models.candidate import CandidateProfile
from app.schemas.job import JobResponse, JobSummary, JobStats, JobEvaluateResponse
from app.schemas.common import PaginatedResponse
from app.services.ai.matcher import job_matcher
from app.services.discovery.manager import DiscoveryManager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/jobs", tags=["Jobs"])
discovery_manager = DiscoveryManager()


@router.get("", response_model=PaginatedResponse[JobResponse])
async def list_jobs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    status_filter: Optional[JobStatus] = Query(default=None, alias="status"),
    source: Optional[JobSource] = Query(default=None),
    remote_status: Optional[RemoteStatus] = Query(default=None),
    min_match_score: Optional[float] = Query(default=None, ge=0, le=100),
    sort_by: str = Query(default="discovered_at"),
    sort_order: str = Query(default="desc"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated and filtered job listings."""
    stmt = select(Job)

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Job.title.ilike(search_pattern),
                Job.company.ilike(search_pattern),
                Job.description.ilike(search_pattern),
                Job.location.ilike(search_pattern),
            )
        )

    if status_filter:
        stmt = stmt.where(Job.status == status_filter)
    if source:
        stmt = stmt.where(Job.source == source)
    if remote_status:
        stmt = stmt.where(Job.remote_status == remote_status)
    if min_match_score is not None:
        stmt = stmt.where(Job.match_score >= min_match_score)

    # Count total
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_res = await db.execute(count_stmt)
    total = total_res.scalar_one()

    # Sorting
    sort_col = getattr(Job, sort_by, Job.discovered_at)
    stmt = stmt.order_by(desc(sort_col) if sort_order.lower() == "desc" else asc(sort_col))

    # Pagination
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    result = await db.execute(stmt)
    items = result.scalars().all()

    return PaginatedResponse.create(
        items=list(items),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/stats", response_model=JobStats)
async def get_job_stats(db: AsyncSession = Depends(get_db)):
    """Summary metrics of discovered jobs."""
    total_res = await db.execute(select(func.count(Job.id)))
    total = total_res.scalar_one()

    # Status counts
    status_counts_res = await db.execute(select(Job.status, func.count(Job.id)).group_by(Job.status))
    by_status = {s.value if hasattr(s, "value") else str(s): count for s, count in status_counts_res.all()}

    # Source counts
    source_counts_res = await db.execute(select(Job.source, func.count(Job.id)).group_by(Job.source))
    by_source = {s.value if hasattr(s, "value") else str(s): count for s, count in source_counts_res.all()}

    # Remote status counts
    remote_res = await db.execute(select(Job.remote_status, func.count(Job.id)).group_by(Job.remote_status))
    by_remote = {r.value if hasattr(r, "value") else str(r): count for r, count in remote_res.all()}

    # Average match score
    avg_score_res = await db.execute(select(func.avg(Job.match_score)).where(Job.match_score.isnot(None)))
    avg_score = avg_score_res.scalar_one()

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)

    today_res = await db.execute(select(func.count(Job.id)).where(Job.discovered_at >= today_start))
    week_res = await db.execute(select(func.count(Job.id)).where(Job.discovered_at >= week_start))

    return JobStats(
        total=total,
        by_status=by_status,
        by_source=by_source,
        by_remote_status=by_remote,
        avg_match_score=float(avg_score) if avg_score else None,
        discovered_today=today_res.scalar_one(),
        discovered_this_week=week_res.scalar_one(),
    )


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """Fetch details of a specific job by ID."""
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.post("/{job_id}/evaluate", response_model=JobEvaluateResponse)
async def evaluate_job(
    job_id: UUID,
    candidate_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    """Run AI evaluation on a job against candidate profile."""
    # Find job
    job_res = await db.execute(select(Job).where(Job.id == job_id))
    job = job_res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Find candidate
    if candidate_id:
        cand_res = await db.execute(select(CandidateProfile).where(CandidateProfile.id == candidate_id))
        candidate = cand_res.scalar_one_or_none()
    else:
        # Default to the primary candidate profile
        cand_res = await db.execute(select(CandidateProfile).limit(1))
        candidate = cand_res.scalar_one_or_none()

    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate profile not found. Please create candidate profile first.")

    eval_result = await job_matcher.evaluate_job(db=db, job=job, candidate=candidate)

    return JobEvaluateResponse(
        job_id=job.id,
        match_score=eval_result["score"],
        match_explanation=eval_result["explanation"],
        status=job.status,
    )


@router.post("/discover")
async def trigger_discovery(
    query: str = Query(default="Software Engineer"),
    location: Optional[str] = Query(default=None),
    sources: Optional[list[str]] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Trigger job discovery across connectors."""
    stats = await discovery_manager.run_discovery(
        db=db,
        query=query,
        location=location,
        sources=sources,
    )
    return {"message": "Job discovery completed", "stats": stats}

