"""Analytics and dashboard reporting routes."""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.job import Job, JobStatus, JobSource
from app.models.application import Application, ApplicationStatus

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview_metrics(db: AsyncSession = Depends(get_db)):
    """Summary KPI metrics for dashboard."""
    # Discovered Jobs
    total_jobs_res = await db.execute(select(func.count(Job.id)))
    total_jobs = total_jobs_res.scalar_one()

    # Qualified Jobs
    qual_res = await db.execute(select(func.count(Job.id)).where(Job.status == JobStatus.QUALIFIED))
    qualified_jobs = qual_res.scalar_one()

    # Applications submitted
    applied_res = await db.execute(select(func.count(Application.id)).where(Application.status == ApplicationStatus.APPLIED))
    applications_submitted = applied_res.scalar_one()

    # Pending approvals
    pending_res = await db.execute(select(func.count(Application.id)).where(Application.status == ApplicationStatus.AWAITING_APPROVAL))
    pending_approvals = pending_res.scalar_one()

    # Interview invitations
    interview_res = await db.execute(select(func.count(Application.id)).where(Application.status == ApplicationStatus.INTERVIEW))
    interview_invitations = interview_res.scalar_one()

    # Avg match score
    avg_score_res = await db.execute(select(func.avg(Job.match_score)).where(Job.match_score.isnot(None)))
    avg_score = avg_score_res.scalar_one()

    # Conversion rate: applied -> interview
    conversion_rate = 0.0
    if applications_submitted > 0:
        conversion_rate = round((interview_invitations / applications_submitted) * 100, 1)

    return {
        "total_jobs": total_jobs,
        "qualified_jobs": qualified_jobs,
        "applications_submitted": applications_submitted,
        "pending_approvals": pending_approvals,
        "interview_invitations": interview_invitations,
        "average_match_score": round(float(avg_score), 1) if avg_score else 0.0,
        "conversion_rate": conversion_rate,
    }


@router.get("/trends")
async def get_discovery_trends(db: AsyncSession = Depends(get_db)):
    """Discovery trend data points for chart rendering."""
    # Last 14 days activity
    now = datetime.now(timezone.utc)
    data_points = []

    for i in range(13, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time(), tzinfo=timezone.utc)
        day_end = datetime.combine(day_date, datetime.max.time(), tzinfo=timezone.utc)

        count_res = await db.execute(
            select(func.count(Job.id)).where(Job.discovered_at >= day_start, Job.discovered_at <= day_end)
        )
        data_points.append({
            "date": day_date.strftime("%b %d"),
            "jobs_discovered": count_res.scalar_one(),
        })

    return {"trends": data_points}


@router.get("/sources")
async def get_source_breakdown(db: AsyncSession = Depends(get_db)):
    """Job count and qualified count by source."""
    res = await db.execute(
        select(Job.source, func.count(Job.id)).group_by(Job.source)
    )
    breakdown = []
    for source, count in res.all():
        s_val = source.value if hasattr(source, "value") else str(source)
        breakdown.append({
            "source": s_val,
            "count": count,
        })
    return {"sources": breakdown}

