"""LinkedIn Job discovery connector using public guest endpoint."""

from __future__ import annotations

import logging
import urllib.parse
import httpx
from bs4 import BeautifulSoup
from app.models.job import JobSource, RemoteStatus, EmploymentType
from app.services.discovery.base import BaseConnector, DiscoveredJob

logger = logging.getLogger(__name__)


class LinkedInConnector(BaseConnector):
    """Fetches publicly listed jobs from LinkedIn guest job search."""
    source_name = JobSource.LINKEDIN

    async def discover(self, query: str = "Software Engineer", location: str | None = None, limit: int = 25) -> list[DiscoveredJob]:
        results: list[DiscoveredJob] = []
        encoded_keywords = urllib.parse.quote(query)
        loc = urllib.parse.quote(location or "Worldwide")
        
        url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={encoded_keywords}&location={loc}&start=0"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
                resp = await client.get(url)
                if resp.status_code == 200 and resp.text:
                    soup = BeautifulSoup(resp.text, "lxml")
                    cards = soup.find_all("li")
                    for card in cards[:limit]:
                        title_tag = card.find("h3", class_="base-search-card__title")
                        company_tag = card.find("h4", class_="base-search-card__subtitle")
                        loc_tag = card.find("span", class_="job-search-card__location")
                        link_tag = card.find("a", class_="base-card__full-link")

                        if title_tag and company_tag:
                            job_title = title_tag.get_text(strip=True)
                            job_company = company_tag.get_text(strip=True)
                            job_loc = loc_tag.get_text(strip=True) if loc_tag else "Remote"
                            job_url = link_tag["href"] if link_tag and link_tag.has_attr("href") else "https://linkedin.com"

                            is_remote = "remote" in job_loc.lower() or "remote" in job_title.lower()

                            results.append(DiscoveredJob(
                                title=job_title,
                                company=job_company,
                                description=f"Job posting for {job_title} at {job_company}. Location: {job_loc}",
                                location=job_loc,
                                remote_status=RemoteStatus.REMOTE if is_remote else RemoteStatus.HYBRID,
                                employment_type=EmploymentType.FULL_TIME,
                                source=JobSource.LINKEDIN,
                                source_url=job_url,
                                raw_data={"source": "linkedin_guest_api"}
                            ))
                    logger.info("Retrieved %d jobs from LinkedIn guest feed", len(results))
        except Exception as e:
            logger.warning("LinkedIn public discovery error: %s", e)

        return results
