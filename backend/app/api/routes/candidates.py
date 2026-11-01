"""Candidate profile management, file uploads, email authorization, and outreach dispatch."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.api.deps import get_db
from app.models.candidate import CandidateProfile
from app.schemas.candidate import CandidateResponse, CandidateUpdate
from app.services.documents.cv_parser import cv_parser
from app.services.email.sender import email_service

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
            "highlights": "Peer-to-peer rigorous computer science curriculum: C, C++, UNIX, Algorithms, System Architecture.",
        }
    ],
    "experience": [
        {
            "company": "RiLyMed",
            "role": "DevOps Engineer",
            "duration": "2023 - 2024",
            "description": "Led containerization, CI/CD pipelines, Docker infrastructure, and Linux server orchestration for healthcare platforms.",
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
        "currency": "USD",
        "related_files": [],
        "email_config": {
            "provider": "gmail",
            "email": "solayman.elmouden@gmail.com",
            "display_name": "Solayman El Mouden",
            "smtp_host": "smtp.gmail.com",
            "smtp_port": 587,
            "use_tls": True,
            "is_authenticated": False,
            "require_approval": True,
            "auto_outreach": True,
            "daily_limit": 10,
        },
        "outreach_history": [],
    },
}


class EmailConfigPayload(BaseModel):
    provider: str = "gmail"
    email: EmailStr
    display_name: str = "Solayman El Mouden"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_password: Optional[str] = None
    use_tls: bool = True
    require_approval: bool = True
    auto_outreach: bool = True
    daily_limit: int = 10


class TestEmailPayload(BaseModel):
    recipient: Optional[EmailStr] = None


class SendOutreachPayload(BaseModel):
    recipient: EmailStr
    company: str
    role: str
    subject: str
    body: str
    attach_cv: bool = True


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


# ── Related Files Management ─────────────────────────────────────────────────

@router.post("/upload-file")
async def upload_related_file(
    file: UploadFile = File(...),
    category: str = Form("other"),
    db: AsyncSession = Depends(get_db),
):
    """Upload related candidate files (Certificates, Recommendations, Portfolio, Transcripts)."""
    candidate = await get_or_create_candidate(db)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    save_dir = Path("uploads/related_files")
    save_dir.mkdir(parents=True, exist_ok=True)

    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}_{file.filename}"
    file_path = save_dir / safe_filename

    with open(file_path, "wb") as f:
        f.write(content)

    prefs = candidate.preferences or {}
    files_list = prefs.get("related_files", [])

    file_meta = {
        "id": file_id,
        "filename": file.filename,
        "category": category,
        "file_path": str(file_path),
        "url": f"/uploads/related_files/{safe_filename}",
        "size_kb": round(len(content) / 1024, 1),
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
    }
    files_list.append(file_meta)
    prefs["related_files"] = files_list
    candidate.preferences = prefs
    flag_modified(candidate, "preferences")

    await db.commit()
    await db.refresh(candidate)

    return {
        "success": True,
        "message": f"Successfully uploaded {file.filename}",
        "file": file_meta,
        "files": files_list,
    }


@router.get("/files")
async def list_related_files(db: AsyncSession = Depends(get_db)):
    """List all candidate uploaded documents and related files."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    return {
        "cv_path": candidate.original_cv_path,
        "files": prefs.get("related_files", []),
    }


@router.delete("/files/{file_id}")
async def delete_related_file(file_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a specific candidate related file."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    files_list = prefs.get("related_files", [])

    updated_files = []
    deleted_path = None
    for f in files_list:
        if f.get("id") == file_id:
            deleted_path = f.get("file_path")
        else:
            updated_files.append(f)

    if deleted_path:
        p = Path(deleted_path)
        if p.exists():
            p.unlink()

    prefs["related_files"] = updated_files
    candidate.preferences = prefs
    flag_modified(candidate, "preferences")

    await db.commit()
    await db.refresh(candidate)

    return {"success": True, "files": updated_files}


# ── Email Authentication & Outreach Management ──────────────────────────────

@router.get("/email-config")
async def get_email_config(db: AsyncSession = Depends(get_db)):
    """Retrieve current email configuration status (omitting raw password)."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    cfg = prefs.get("email_config", {})

    safe_cfg = {
        "provider": cfg.get("provider", "gmail"),
        "email": cfg.get("email", candidate.email),
        "display_name": cfg.get("display_name", candidate.name),
        "smtp_host": cfg.get("smtp_host", "smtp.gmail.com"),
        "smtp_port": cfg.get("smtp_port", 587),
        "use_tls": cfg.get("use_tls", True),
        "is_authenticated": cfg.get("is_authenticated", False),
        "require_approval": cfg.get("require_approval", True),
        "auto_outreach": cfg.get("auto_outreach", True),
        "daily_limit": cfg.get("daily_limit", 10),
        "has_password": bool(cfg.get("smtp_password")),
        "last_tested": cfg.get("last_tested"),
    }
    return safe_cfg


@router.post("/email-config")
async def save_email_config(payload: EmailConfigPayload, db: AsyncSession = Depends(get_db)):
    """Save or update candidate email credentials and outreach configuration."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    cfg = prefs.get("email_config", {})

    # Preserve existing password if not provided in payload
    password = payload.smtp_password or cfg.get("smtp_password", "")

    updated_cfg = {
        "provider": payload.provider,
        "email": str(payload.email),
        "display_name": payload.display_name,
        "smtp_host": payload.smtp_host,
        "smtp_port": payload.smtp_port,
        "smtp_password": password,
        "use_tls": payload.use_tls,
        "is_authenticated": cfg.get("is_authenticated", False),
        "require_approval": payload.require_approval,
        "auto_outreach": payload.auto_outreach,
        "daily_limit": payload.daily_limit,
        "last_tested": cfg.get("last_tested"),
    }

    prefs["email_config"] = updated_cfg
    candidate.preferences = prefs
    flag_modified(candidate, "preferences")

    await db.commit()
    await db.refresh(candidate)

    return {
        "success": True,
        "message": "Email settings saved successfully.",
        "config": {k: v for k, v in updated_cfg.items() if k != "smtp_password"},
    }


@router.post("/test-email")
async def test_email_connection(payload: TestEmailPayload, db: AsyncSession = Depends(get_db)):
    """Test SMTP connection and authenticate sender email account."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    cfg = prefs.get("email_config", {})

    host = cfg.get("smtp_host", "smtp.gmail.com")
    port = cfg.get("smtp_port", 587)
    user = cfg.get("email", candidate.email)
    password = cfg.get("smtp_password", "")
    use_tls = cfg.get("use_tls", True)

    if not password:
        raise HTTPException(
            status_code=400,
            detail="No email password / app password configured. Please enter your credentials first.",
        )

    res = email_service.test_connection(host, port, user, password, use_tls=use_tls)

    cfg["is_authenticated"] = res["success"]
    cfg["last_tested"] = datetime.now(timezone.utc).isoformat()
    prefs["email_config"] = cfg
    candidate.preferences = prefs
    flag_modified(candidate, "preferences")

    await db.commit()
    await db.refresh(candidate)

    if not res["success"]:
        return {
            "success": False,
            "message": res["message"],
            "is_authenticated": False,
        }

    # If recipient provided, dispatch a test verification email
    test_recipient = payload.recipient or user
    try:
        dispatch_res = email_service.send_email(
            host=host,
            port=port,
            user=user,
            password=password,
            to_email=str(test_recipient),
            subject="Jobless Hunter — 24/7 Agent Email Connection Verified",
            body_text=(
                f"Hello {candidate.name},\n\n"
                "Your email account has been successfully authenticated with Jobless Hunter AI!\n"
                "The 24/7 autonomous job application agent is now authorized to send verified outreach emails and job applications.\n\n"
                f"Timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
                "Platform: Jobless Hunter AI"
            ),
            from_name=cfg.get("display_name", candidate.name),
            use_tls=use_tls,
        )
        return {
            "success": True,
            "message": f"Connection verified! Test email dispatched to {test_recipient}",
            "is_authenticated": True,
        }
    except Exception as e:
        return {
            "success": True,
            "message": f"SMTP authenticated successfully, but test message failed: {e}",
            "is_authenticated": True,
        }


@router.post("/send-outreach")
async def send_outreach_email(payload: SendOutreachPayload, db: AsyncSession = Depends(get_db)):
    """Dispatch an application or cold outreach email to a company or recruiter."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    cfg = prefs.get("email_config", {})

    if not cfg.get("is_authenticated") or not cfg.get("smtp_password"):
        raise HTTPException(
            status_code=400,
            detail="Email account is not authenticated. Please authenticate your email in Candidate Profile first.",
        )

    host = cfg.get("smtp_host", "smtp.gmail.com")
    port = cfg.get("smtp_port", 587)
    user = cfg.get("email", candidate.email)
    password = cfg.get("smtp_password", "")
    use_tls = cfg.get("use_tls", True)
    from_name = cfg.get("display_name", candidate.name)

    attachments = []
    if payload.attach_cv and candidate.original_cv_path:
        attachments.append(candidate.original_cv_path)

    res = email_service.send_email(
        host=host,
        port=port,
        user=user,
        password=password,
        to_email=str(payload.recipient),
        subject=payload.subject,
        body_text=payload.body,
        from_name=from_name,
        attachments=attachments,
        use_tls=use_tls,
    )

    outreach_entry = {
        "id": str(uuid.uuid4()),
        "recipient": str(payload.recipient),
        "company": payload.company,
        "role": payload.role,
        "subject": payload.subject,
        "sent_at": datetime.now(timezone.utc).isoformat(),
        "status": "sent" if res["success"] else "failed",
        "error": None if res["success"] else res["message"],
        "cv_attached": payload.attach_cv and bool(candidate.original_cv_path),
    }

    history = prefs.get("outreach_history", [])
    history.insert(0, outreach_entry)
    prefs["outreach_history"] = history
    candidate.preferences = prefs
    flag_modified(candidate, "preferences")

    await db.commit()
    await db.refresh(candidate)

    if not res["success"]:
        raise HTTPException(status_code=500, detail=res["message"])

    return {
        "success": True,
        "message": f"Outreach email dispatched to {payload.recipient}",
        "entry": outreach_entry,
    }


@router.get("/outreach-history")
async def get_outreach_history(db: AsyncSession = Depends(get_db)):
    """Retrieve history of all sent outreach emails and recruiter communications."""
    candidate = await get_or_create_candidate(db)
    prefs = candidate.preferences or {}
    return {
        "items": prefs.get("outreach_history", []),
        "total": len(prefs.get("outreach_history", [])),
    }
