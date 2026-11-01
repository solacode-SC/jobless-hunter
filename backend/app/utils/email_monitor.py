"""Recruiter email response detection and interview invitation parser."""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

INTERVIEW_KEYWORDS = [
    r"\binterview\b",
    r"\bschedule a (call|chat|meeting)\b",
    r"\bphone screen\b",
    r"\btechnical assessment\b",
    r"\bcoding challenge\b",
    r"\bnext round\b",
    r"\bnext steps\b",
    r"\bcalendly\.com\b",
    r"\bhirevue\b",
    r"\bcongratulations\b",
]

REJECTION_KEYWORDS = [
    r"\bunfortunately\b",
    r"\bnot moving forward\b",
    r"\bother candidates\b",
    r"\bwe have decided to pursue\b",
    r"\bnot a match\b",
    r"\bwe will keep your resume on file\b",
]


class EmailMonitor:
    """Parses emails to identify recruiter activity, interview requests, or rejections."""

    def analyze_email(self, subject: str, sender: str, body: str) -> dict[str, Any]:
        """Analyze message text and classify intent."""
        combined_text = f"{subject} {body}".lower()

        is_interview = any(re.search(pat, combined_text) for pat in INTERVIEW_KEYWORDS)
        is_rejection = any(re.search(pat, combined_text) for pat in REJECTION_KEYWORDS)

        classification = "general"
        if is_interview:
            classification = "interview_invitation"
        elif is_rejection:
            classification = "rejection"

        return {
            "sender": sender,
            "subject": subject,
            "classification": classification,
            "is_interview": is_interview,
            "is_rejection": is_rejection,
            "action_required": is_interview,
        }


email_monitor = EmailMonitor()
