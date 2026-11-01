"""Jobless Hunter FastAPI Application."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base
from app.core.redis import init_redis, close_redis
from app.api.routes import auth, jobs, applications, documents, candidates, discovery, analytics, health, ai
from app.models.candidate import CandidateProfile
from app.api.routes.candidates import get_or_create_candidate
from app.core.database import async_session_factory

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("jobless-hunter")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan events."""
    logger.info("Initializing Jobless Hunter backend...")

    # Ensure tables exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Initialize redis
    await init_redis()

    # Seed initial candidate profile if empty
    async with async_session_factory() as session:
        await get_or_create_candidate(session)

    logger.info("Jobless Hunter backend initialization complete.")
    yield

    logger.info("Shutting down Jobless Hunter backend...")
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="24/7 AI Job Application Agent API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(health.router)
app.include_router(auth.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(discovery.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(health.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
    }

