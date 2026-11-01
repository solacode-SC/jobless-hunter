"""Indeed discovery connector using public job feeds."""

from __future__ import annotations

import logging
import urllib.parse
import xml.etree.ElementTree as ET
import httpx
from app.models.job import JobSource, RemoteStatus, EmploymentType
from app.services.discovery.base import BaseConnector, DiscoveredJob

logger = logging.getLogger(__name__)


class IndeedConnector(BaseConnector):
    """Fetches jobs from public Indeed search RSS feeds."""
    source_name = JobSource.INDEED

    async def discover(self, query: str = "Software Engineer", location: str | None = None, limit: int = 25) -> list[DiscoveredJob]:
        results: list[DiscoveredJob] = []
        encoded_query = urllib.parse.quote(query)
        loc = urllib.parse.quote(location or "Remote")
        rss_url = f"https://www.indeed.com/rss?q={encoded_query}&l={loc}&sort=date"

        headers = {
            "User-Agent": "JobHunter-Aggregator/1.0 (+https://solaymanbuilds.com)",
            "Accept": "application/rss+xml, application/xml, text/xml"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
                resp = await client.get(rss_url)
                if resp.status_code == 200 and resp.text:
                    root = ET.fromstring(resp.text)
                    channel = root.find("channel")
                    if channel:
                        items = channel.findall("item")
                        for item in items[:limit]:
                            title = item.findtext("title", "Software Engineer")
                            link = item.findtext("link", "")
                            description = item.findtext("description", "")
                            source_tag = item.findtext("source", "Indeed")

                            company = source_tag
                            if " - " in title:
                                parts = title.rsplit(" - ", 1)
                                title = parts[0]
                                company = parts[1]

                            results.append(DiscoveredJob(
                                title=title.strip(),
                                company=company.strip(),
                                description=description.strip(),
                                location=location or "Remote",
                                remote_status=RemoteStatus.REMOTE,
                                employment_type=EmploymentType.FULL_TIME,
                                source=JobSource.INDEED,
                                source_url=link,
                                raw_data={"feed": "rss"}
                            ))
                        logger.info("Retrieved %d jobs from Indeed RSS", len(results))
        except Exception as e:
            logger.warning("Indeed RSS discovery error: %s", e)

        return results

