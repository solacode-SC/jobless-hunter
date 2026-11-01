"""Blocklist evaluation service for filtering out unwanted jobs."""

from __future__ import annotations

import logging
from typing import Any, Tuple

logger = logging.getLogger(__name__)

DEFAULT_BLOCK_KEYS: dict[str, list[str]] = {
    "companies": ["Revature", "Infosys", "Wipro", "Tata Consultancy Services"],
    "locations": ["On-site Only", "No Remote Allowed"],
    "roles": [
        "Sales Representative",
        "Account Executive",
        "Marketing Specialist",
        "Unpaid Intern",
        "Cold Caller",
        "Customer Support Rep",
    ],
    "keywords": [
        "security clearance required",
        "polygraph required",
        "us citizenship required",
        "unpaid internship",
        "commission only",
        "no c2c",
        "must be us citizen",
    ],
}


def check_job_blocklist(
    title: str,
    company: str,
    location: str | None = None,
    description: str | None = None,
    required_skills: list[str] | None = None,
    block_keys: dict[str, list[str]] | None = None,
) -> Tuple[bool, str | None]:
    """
    Evaluates whether a job matches any candidate block keys.
    Returns (is_blocked: bool, reason: str | None).
    """
    if not block_keys:
        return False, None

    # 1. Check Companies
    blocked_companies = [c.strip().lower() for c in block_keys.get("companies", []) if c and c.strip()]
    comp_lower = (company or "").lower().strip()
    for bc in blocked_companies:
        if bc in comp_lower or (len(comp_lower) > 3 and comp_lower in bc):
            logger.info("Job '%s' blocked by company rule '%s'", title, bc)
            return True, f"Blocked company: '{bc}' matches '{company}'"

    # 2. Check Locations / Countries / Regions
    blocked_locations = [l.strip().lower() for l in block_keys.get("locations", []) if l and l.strip()]
    loc_lower = (location or "").lower().strip()
    for bl in blocked_locations:
        if bl in loc_lower:
            logger.info("Job '%s' blocked by location rule '%s'", title, bl)
            return True, f"Blocked location/region: '{bl}' matches '{location}'"

    # 3. Check Roles / Job Titles
    blocked_roles = [r.strip().lower() for r in block_keys.get("roles", []) if r and r.strip()]
    title_lower = (title or "").lower().strip()
    for br in blocked_roles:
        if br in title_lower:
            logger.info("Job '%s' blocked by role rule '%s'", title, br)
            return True, f"Blocked role/title: '{br}' matches '{title}'"

    # 4. Check Keywords / Phrases (in description or required skills)
    blocked_keywords = [k.strip().lower() for k in block_keys.get("keywords", []) if k and k.strip()]
    desc_lower = (description or "").lower()
    skills_text = " ".join((required_skills or [])).lower()
    for bk in blocked_keywords:
        if bk in desc_lower or bk in skills_text:
            logger.info("Job '%s' blocked by keyword rule '%s'", title, bk)
            return True, f"Blocked keyword/phrase: '{bk}' found in requirements"

    return False, None

