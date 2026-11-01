"""System health check endpoint."""

from __future__ import annotations

import os
import shutil
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.redis import get_redis

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Check connectivity to PostgreSQL, Redis, and disk storage."""
    db_healthy = False
    try:
        await db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    redis_healthy = False
    redis = get_redis()
    if redis:
        try:
            await redis.ping()
            redis_healthy = True
        except Exception:
            redis_healthy = False

    total, used, free = shutil.disk_usage("/")
    free_gb = round(free / (1024 ** 3), 2)

    return {
        "status": "healthy" if db_healthy else "degraded",
        "service": "jobhunter-backend",
        "checks": {
            "database": "connected" if db_healthy else "unavailable",
            "redis": "connected" if redis_healthy else "unavailable",
            "disk_free_gb": free_gb,
        }
    }

