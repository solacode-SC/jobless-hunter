"""Job discovery management routes."""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.models.job import JobSource
from app.services.discovery.manager import DiscoveryManager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/discovery", tags=["Discovery"])
discovery_manager = DiscoveryManager()


@router.get("/sources")
async def list_sources():
    """List available job discovery sources."""
    return [
        {
            "id": JobSource.REMOTE_BOARD.value,
            "name": "Remote Job Boards (Remotive, Arbeitnow)",
            "status": "active",
            "type": "api",
            "description": "Public developer remote job APIs"
        },
        {
            "id": JobSource.LINKEDIN.value,
            "name": "LinkedIn Guest Feed",
            "status": "active",
            "type": "search_feed",
            "description": "Public LinkedIn search listings"
        },
        {
            "id": JobSource.INDEED.value,
            "name": "Indeed Search Feed",
            "status": "active",
            "type": "rss",
            "description": "Public Indeed RSS feed indexer"
        },
        {
            "id": JobSource.GOOGLE_JOBS.value,
            "name": "Google Jobs Indexer",
            "status": "active",
            "type": "search_api",
            "description": "Google indexed recruitment postings"
        },
    ]


@router.post("/run")
async def run_discovery_cycle(
    query: str = Query(default="Software Engineer"),
    location: Optional[str] = Query(default=None),
    sources: Optional[list[str]] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    """Trigger a discovery run."""
    stats = await discovery_manager.run_discovery(
        db=db,
        query=query,
        location=location,
        sources=sources,
    )
    return {"status": "completed", "stats": stats}
