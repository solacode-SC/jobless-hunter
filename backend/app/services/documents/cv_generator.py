"""Tailored CV generation engine."""

from __future__ import annotations

import json
import logging
from typing import Any
from app.models.candidate import CandidateProfile
from app.models.job import Job
from app.services.ai.provider import ai_provider
from app.services.ai.prompts import CV_TAILOR_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class CVGenerator:
    """Generates targeted CV tailored to a specific job."""

    async def generate_cv(
        self,
        candidate: CandidateProfile,
        job: Job,
        language: str = "en",
    ) -> str:
        """Create a targeted Markdown CV."""
        logger.info("Generating tailored CV for job '%s' in %s", job.title, language)

        prompt = f"""
Candidate Verified Facts:
Name: {candidate.name}
Professional Title: {candidate.professional_title or "Software Engineer"}
Email: {candidate.email}
Phone: {candidate.phone or ""}
Portfolio: {candidate.portfolio_url or "https://solaymanbuilds.com"}
GitHub: {candidate.github_url or "https://github.com/solacode-SC"}
LinkedIn: {candidate.linkedin_url or "https://www.linkedin.com/in/solayman-elmouden/"}

Education:
{json.dumps(candidate.education or [], indent=2)}

Experience:
{json.dumps(candidate.experience or [], indent=2)}

Skills:
{json.dumps(candidate.skills or [], indent=2)}

Target Job:
Role: {job.title}
Company: {job.company}
Location: {job.location}
Description:
{job.description or ""}

Requirements:
- Target Language: {"English" if language == "en" else "French"}
- Format: Professional Markdown CV
- Emphasize relevant technologies (e.g. C, C++, Python, TypeScript, Docker, Linux, DevOps, AI integration).
- STRICT TRUTHFULNESS: Do not invent any companies, degrees, dates, or skills.
"""
        tailored_cv = await ai_provider.generate_completion(
            system_prompt=CV_TAILOR_SYSTEM_PROMPT,
            user_prompt=prompt,
            temperature=0.2,
        )
        return tailored_cv


cv_generator = CVGenerator()
