"""AI Job Matching Engine."""

from __future__ import annotations

import json
import logging
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, JobStatus
from app.models.candidate import CandidateProfile
from app.services.ai.provider import ai_provider
from app.services.ai.prompts import MATCH_SYSTEM_PROMPT, MATCH_USER_PROMPT

logger = logging.getLogger(__name__)


class JobMatcher:
    """Evaluates candidate fit for a job listing."""

    def __init__(self, qualification_threshold: int = 70):
        self.threshold = qualification_threshold

    async def evaluate_job(
        self,
        db: AsyncSession,
        job: Job,
        candidate: CandidateProfile,
    ) -> dict[str, Any]:
        """Evaluate candidate fit for a job and persist score/status."""
        logger.info("Evaluating candidate fit for job: %s at %s", job.title, job.company)

        user_content = MATCH_USER_PROMPT.format(
            candidate_name=candidate.name,
            candidate_title=candidate.professional_title or "Software Engineer",
            education=json.dumps(candidate.education or []),
            experience=json.dumps(candidate.experience or []),
            skills=json.dumps(candidate.skills or []),
            job_title=job.title,
            company=job.company,
            location=job.location or "Remote",
            remote_status=job.remote_status.value if hasattr(job.remote_status, "value") else str(job.remote_status),
            description=job.description or "No description provided.",
        )

        try:
            raw_response = await ai_provider.generate_completion(
                system_prompt=MATCH_SYSTEM_PROMPT,
                user_prompt=user_content,
                temperature=0.2,
                json_output=True,
            )

            eval_data = json.loads(raw_response)
            score = int(eval_data.get("score", 50))
            explanation = eval_data.get("explanation", "")

            # Update job record
            job.match_score = float(score)
            job.match_explanation = explanation

            # Classification
            if score >= self.threshold:
                job.status = JobStatus.QUALIFIED
            else:
                job.status = JobStatus.DISQUALIFIED

            # Save evaluation details into raw_data
            if job.raw_data is None:
                job.raw_data = {}
            job.raw_data["ai_evaluation"] = eval_data

            await db.commit()
            await db.refresh(job)

            return {
                "job_id": str(job.id),
                "score": score,
                "status": job.status.value,
                "classification": eval_data.get("classification"),
                "explanation": explanation,
                "matched_skills": eval_data.get("matched_skills", []),
                "missing_skills": eval_data.get("missing_skills", []),
                "strengths": eval_data.get("strengths", []),
                "gaps": eval_data.get("gaps", []),
            }

        except Exception as e:
            logger.error("Failed to match job %s: %s", job.id, e, exc_info=True)
            job.status = JobStatus.DISCOVERED
            await db.commit()
            raise


job_matcher = JobMatcher()

