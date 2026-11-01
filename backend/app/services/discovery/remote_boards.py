"""Remote job board connectors (Remotive, RemoteOK, Arbeitnow)."""

from __future__ import annotations

import logging
import httpx
from bs4 import BeautifulSoup
from app.models.job import JobSource, RemoteStatus, EmploymentType
from app.services.discovery.base import BaseConnector, DiscoveredJob

logger = logging.getLogger(__name__)


class RemoteBoardsConnector(BaseConnector):
    """Fetches jobs from public remote developer boards."""
    source_name = JobSource.REMOTE_BOARD

    def _strip_html(self, html_text: str | None) -> str:
        if not html_text:
            return ""
        try:
            soup = BeautifulSoup(html_text, "lxml")
            return soup.get_text(separator="\n").strip()
        except Exception:
            return html_text.strip()

    async def discover(self, query: str = "software engineer", location: str | None = None, limit: int = 50) -> list[DiscoveredJob]:
        results: list[DiscoveredJob] = []

        headers = {
            "User-Agent": "JobHunter-Agent/1.0 (+https://solaymanbuilds.com)",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=20.0, headers=headers) as client:
            # 1. Remotive API
            try:
                remotive_url = f"https://remotive.com/api/remote-jobs?search={query}&limit={limit}"
                resp = await client.get(remotive_url)
                if resp.status_code == 200:
                    data = resp.json()
                    jobs_list = data.get("jobs", [])
                    for item in jobs_list[:limit]:
                        clean_desc = self._strip_html(item.get("description", ""))
                        tags = item.get("tags", [])
                        salary_str = item.get("salary", "")

                        results.append(DiscoveredJob(
                            title=item.get("title", "Software Engineer"),
                            company=item.get("company_name", "Unknown Company"),
                            description=clean_desc,
                            location=item.get("candidate_required_location", "Remote"),
                            remote_status=RemoteStatus.REMOTE,
                            employment_type=EmploymentType.FULL_TIME if item.get("job_type") == "full_time" else EmploymentType.CONTRACT,
                            required_skills=tags,
                            source=JobSource.REMOTE_BOARD,
                            source_url=item.get("url", ""),
                            source_job_id=str(item.get("id")),
                            raw_data=item,
                        ))
                    logger.info("Retrieved %d jobs from Remotive API", len(jobs_list))
            except Exception as e:
                logger.warning("Error querying Remotive API: %s", e)

            # 2. Arbeitnow API (European & Remote tech jobs)
            try:
                arbeit_url = f"https://www.arbeitnow.com/api/job-board-api?search={query}"
                resp = await client.get(arbeit_url)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("data", [])[:25]:
                        clean_desc = self._strip_html(item.get("description", ""))
                        results.append(DiscoveredJob(
                            title=item.get("title", ""),
                            company=item.get("company_name", ""),
                            description=clean_desc,
                            location=item.get("location", "Remote"),
                            remote_status=RemoteStatus.REMOTE if item.get("remote") else RemoteStatus.HYBRID,
                            employment_type=EmploymentType.FULL_TIME,
                            required_skills=item.get("tags", []),
                            source=JobSource.REMOTE_BOARD,
                            source_url=item.get("url", ""),
                            source_job_id=item.get("slug", ""),
                            raw_data=item,
                        ))
                    logger.info("Retrieved jobs from Arbeitnow API")
            except Exception as e:
                logger.warning("Error querying Arbeitnow API: %s", e)

        return results

