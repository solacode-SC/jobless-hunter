"""Candidate profile management and CV upload routes."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.candidate import CandidateProfile
from app.schemas.candidate import CandidateResponse, CandidateUpdate, CandidateCreate
from app.services.documents.cv_parser import cv_parser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/candidate", tags=["Candidate"])

INITIAL_PROFILE = {
    "name": "Solayman El Mouden",
    "email": "solayman.elmouden@gmail.com",
    "professional_title": "Software Engineer",
    "phone": "+212 600000000",
    "education": [
        {
            "institution": "1337 School – UM6P",
            "degree": "Software Engineering Education",
            "year": "2021-2024",
            "highlights": "Peer-to-peer rigorous computer science curriculum: C, C++, UNIX, Algorithms, System Architecture."
        }
    ],
    "experience": [
        {
            "company": "RiLyMed",
            "role": "DevOps Engineer",
            "duration": "2023 - 2024",
            "description": "Led containerization, CI/CD pipelines, Docker infrastructure, and Linux server orchestration for healthcare platforms."
        }
    ],
    "skills": [
        "C",
        "C++",
        "Python",
        "TypeScript",
        "JavaScript",
        "React",
        "Next.js",
        "Docker",
        "Linux",
        "PostgreSQL",
        "Git",
        "AI integration",
        "DevOps",
    ],
    "portfolio_url": "https://solaymanbuilds.com",
    "github_url": "https://github.com/solacode-SC",
    "linkedin_url": "https://www.linkedin.com/in/solayman-elmouden/",
    "summary": "Software Engineer with extensive experience in low-level systems (C/C++), fullstack web architecture (Python, TypeScript, Next.js), and DevOps automation (Docker, Linux, CI/CD).",
    "preferences": {
        "remote_only": True,
        "target_roles": ["Software Engineer", "Full-Stack Developer", "DevOps Engineer", "Backend Engineer"],
        "min_salary": 60000,
        "currency": "USD"
    }
}


async def get_or_create_candidate(db: AsyncSession) -> CandidateProfile:
    """Get the first candidate profile or initialize Solayman's profile."""
    res = await db.execute(select(CandidateProfile).limit(1))
    profile = res.scalar_one_or_none()
    if profile is None:
        profile = CandidateProfile(**INITIAL_PROFILE)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


@router.get("/profile", response_model=CandidateResponse)
async def get_profile(db: AsyncSession = Depends(get_db)):
    """Retrieve the candidate profile."""
    return await get_or_create_candidate(db)


@router.put("/profile", response_model=CandidateResponse)
async def update_profile(payload: CandidateUpdate, db: AsyncSession = Depends(get_db)):
    """Update candidate profile details."""
    candidate = await get_or_create_candidate(db)

    update_dict = payload.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(candidate, field, val)

    await db.commit()
    await db.refresh(candidate)
    return candidate


@router.post("/upload-cv", response_model=CandidateResponse)
async def upload_original_cv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload original CV (PDF or DOCX), parse text, and update candidate profile."""
    candidate = await get_or_create_candidate(db)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    save_dir = Path("uploads/cvs")
    save_dir.mkdir(parents=True, exist_ok=True)
    clean_name = f"cv_{candidate.id}_{file.filename}"
    file_path = save_dir / clean_name

    with open(file_path, "wb") as f:
        f.write(content)

    # Parse CV text
    try:
        parsed_data = cv_parser.parse_cv_file(file.filename or "cv.pdf", content)
    except Exception as e:
        logger.error("Failed to parse CV: %s", e)
        parsed_data = {"error": str(e), "raw_text": ""}

    candidate.original_cv_path = str(file_path)
    candidate.cv_data = parsed_data

    await db.commit()
    await db.refresh(candidate)
    return candidate

