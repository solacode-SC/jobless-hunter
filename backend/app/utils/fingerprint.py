"""Fingerprint and deduplication utilities for job listings."""

from __future__ import annotations

import hashlib
import re
from urllib.parse import urlparse, parse_qs, urlunparse


def normalize_string(text: str | None) -> str:
    """Normalize string by lowercasing, stripping extra whitespace and punctuation."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_url(url: str | None) -> str:
    """Strip tracking queries (utm_*, ref, etc.) from job URLs."""
    if not url:
        return ""
    parsed = urlparse(url.strip())
    # Strip tracking params
    query_params = parse_qs(parsed.query)
    clean_params = {
        k: v for k, v in query_params.items()
        if not k.startswith("utm_") and k not in {"ref", "source", "refId", "trackingId", "fbclid"}
    }
    encoded_query = "&".join(f"{k}={v[0]}" for k, v in clean_params.items())
    return urlunparse((
        parsed.scheme,
        parsed.netloc.lower(),
        parsed.path.rstrip("/"),
        parsed.params,
        encoded_query,
        ""  # drop fragment
    ))


def generate_job_fingerprint(title: str, company: str, location: str | None = None, source_url: str | None = None) -> str:
    """
    Generate a deterministic SHA-256 fingerprint for a job listing
    based on normalized title, company, and location (or normalized URL).
    """
    norm_title = normalize_string(title)
    norm_company = normalize_string(company)
    norm_location = normalize_string(location)
    norm_url = normalize_url(source_url)

    # Primary key uses title + company + location
    raw_key = f"{norm_company}::{norm_title}::{norm_location}"
    if norm_url:
        raw_key += f"::{norm_url}"

    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
