"""Discovery manager orchestrator with deduplication."""

from __future__ import annotations

import logging
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job, JobStatus
from app.models.candidate import CandidateProfile
from app.utils.fingerprint import generate_job_fingerprint
from app.services.ai.blocklist import check_job_blocklist
from app.services.discovery.base import BaseConnector, DiscoveredJob
from app.services.discovery.remote_boards import RemoteBoardsConnector
from app.services.discovery.linkedin import LinkedInConnector
from app.services.discovery.indeed import IndeedConnector
from app.services.discovery.google_jobs import GoogleJobsConnector

logger = logging.getLogger(__name__)


class DiscoveryManager:
    """Coordinates all discovery connectors and handles deduplication."""

    def __init__(self):
        self.connectors: list[BaseConnector] = [
            RemoteBoardsConnector(),
            LinkedInConnector(),
            IndeedConnector(),
            GoogleJobsConnector(),
        ]

    async def run_discovery(
        self,
        db: AsyncSession,
        query: str = "Software Engineer",
        location: str | None = None,
        sources: list[str] | None = None,
    ) -> dict[str, int]:
        """
        Run discovery across selected or all connectors, deduplicate, and persist new jobs.
        """
        total_found = 0
        new_jobs_count = 0
        duplicates_count = 0

        # Retrieve candidate block keys if configured
        cand_res = await db.execute(select(CandidateProfile).limit(1))
        candidate = cand_res.scalar_one_or_none()
        block_keys = candidate.preferences.get("block_keys") if candidate and candidate.preferences else None

        for connector in self.connectors:
            if sources and connector.source_name.value not in sources:
                continue

            try:
                logger.info("Running connector: %s for query '%s'", connector.source_name.value, query)
                discovered = await connector.discover(query=query, location=location)
                total_found += len(discovered)

                for item in discovered:
                    fp = generate_job_fingerprint(
                        title=item.title,
                        company=item.company,
                        location=item.location,
                        source_url=item.source_url
                    )

                    # Check if fingerprint already exists
                    existing = await db.execute(select(Job).where(Job.fingerprint == fp))
                    if existing.scalar_one_or_none() is not None:
                        duplicates_count += 1
                        continue

                    # Check candidate blocklist rules
                    is_blocked, block_reason = check_job_blocklist(
                        title=item.title,
                        company=item.company,
                        location=item.location,
                        description=item.description,
                        required_skills=item.required_skills,
                        block_keys=block_keys,
                    )

                    raw_data = dict(item.raw_data or {})
                    if is_blocked:
                        raw_data["blocked"] = True
                        raw_data["block_reason"] = block_reason

                    new_job = Job(
                        title=item.title,
                        company=item.company,
                        description=item.description,
                        location=item.location,
                        remote_status=item.remote_status,
                        employment_type=item.employment_type,
                        salary_min=item.salary_min,
                        salary_max=item.salary_max,
                        salary_currency=item.salary_currency,
                        required_skills=item.required_skills,
                        experience_years_min=item.experience_years_min,
                        source=item.source,
                        source_url=item.source_url,
                        source_job_id=item.source_job_id,
                        fingerprint=fp,
                        status=JobStatus.DISQUALIFIED if is_blocked else JobStatus.DISCOVERED,
                        match_score=0.0 if is_blocked else None,
                        match_explanation=f"SKIPPED by blocklist rule: {block_reason}" if is_blocked else None,
                        raw_data=raw_data,
                    )
                    db.add(new_job)
                    new_jobs_count += 1

                await db.commit()
            except Exception as e:
                logger.error("Error executing connector %s: %s", connector.source_name.value, e, exc_info=True)
                await db.rollback()

        return {
            "total_found": total_found,
            "new_jobs": new_jobs_count,
            "duplicates": duplicates_count,
        }

