"""Cover letter generation engine."""

from __future__ import annotations

import json
import logging
from app.models.candidate import CandidateProfile
from app.models.job import Job
from app.services.ai.provider import ai_provider
from app.services.ai.prompts import COVER_LETTER_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class CoverLetterGenerator:
    """Generates personalized cover letters."""

    async def generate_cover_letter(
        self,
        candidate: CandidateProfile,
        job: Job,
        language: str = "en",
    ) -> str:
        """Generate high-impact cover letter."""
        logger.info("Generating tailored cover letter for job '%s' at '%s'", job.title, job.company)

        prompt = f"""
Candidate:
Name: {candidate.name}
Title: {candidate.professional_title or "Software Engineer"}
Education: {json.dumps(candidate.education or [])}
Experience: {json.dumps(candidate.experience or [])}
Skills: {json.dumps(candidate.skills or [])}
Portfolio: {candidate.portfolio_url}
GitHub: {candidate.github_url}

Target Role:
Title: {job.title}
Company: {job.company}
Location: {job.location}
Description:
{job.description or ""}

Language: {"English" if language == "en" else "French"}
Length: 300 to 450 words.
Structure:
- Strong hook expressing interest in {job.company}'s engineering challenges.
- Body paragraph highlighting relevant real project experience (e.g. 1337 UM6P systems, DevOps at RiLyMed, Python/Docker/TypeScript stack).
- Value proposition and alignment with their requirements.
- Confident, polite call-to-action for an interview.
"""
        letter = await ai_provider.generate_completion(
            system_prompt=COVER_LETTER_SYSTEM_PROMPT,
            user_prompt=prompt,
            temperature=0.3,
        )
        return letter


cover_letter_generator = CoverLetterGenerator()

