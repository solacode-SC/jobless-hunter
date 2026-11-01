"""Google Jobs discovery connector."""

from __future__ import annotations

import logging
import httpx
from app.core.config import settings
from app.models.job import JobSource, RemoteStatus, EmploymentType
from app.services.discovery.base import BaseConnector, DiscoveredJob

logger = logging.getLogger(__name__)


class GoogleJobsConnector(BaseConnector):
    """Discovers jobs indexed by Google Jobs."""
    source_name = JobSource.GOOGLE_JOBS

    async def discover(self, query: str = "Software Engineer", location: str | None = None, limit: int = 30) -> list[DiscoveredJob]:
        results: list[DiscoveredJob] = []

        # If SerpAPI key is provided, use official SerpAPI engine
        if settings.SERPAPI_KEY:
            try:
                params = {
                    "engine": "google_jobs",
                    "q": f"{query} {location or ''}".strip(),
                    "api_key": settings.SERPAPI_KEY,
                }
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.get("https://serpapi.com/search.json", params=params)
                    if resp.status_code == 200:
                        data = resp.json()
                        for item in data.get("jobs_results", [])[:limit]:
                            results.append(DiscoveredJob(
                                title=item.get("title", ""),
                                company=item.get("company_name", ""),
                                description=item.get("description", ""),
                                location=item.get("location"),
                                remote_status=RemoteStatus.REMOTE if "remote" in (item.get("location") or "").lower() else RemoteStatus.HYBRID,
                                employment_type=EmploymentType.FULL_TIME,
                                source=JobSource.GOOGLE_JOBS,
                                source_url=item.get("job_providers", [{}])[0].get("link") if item.get("job_providers") else "https://google.com/search?q=" + query,
                                source_job_id=item.get("job_id"),
                                raw_data=item,
                            ))
                        return results
            except Exception as e:
                logger.error("SerpAPI google jobs search failed: %s", e)

        # Fallback public search integration
        logger.info("SerpAPI key not configured; skipping direct Google Jobs or returning empty.")
        return results
