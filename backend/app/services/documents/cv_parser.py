"""Intelligent Parser for candidate CV files (PDF, DOCX) with AI extraction and matching role suggestions."""

from __future__ import annotations

import io
import json
import logging
import re
from pathlib import Path
from typing import Any
import docx
from pypdf import PdfReader

from app.services.ai.provider import ai_provider

logger = logging.getLogger(__name__)

DEFAULT_MATCHING_TITLES = [
    "Full-Stack Developer",
    "DevOps Engineer",
    "Software Engineer",
    "Backend Systems Engineer",
    "Cloud Infrastructure Engineer",
    "Linux Systems Engineer",
    "Site Reliability Engineer (SRE)",
    "Platform Engineer",
    "Python Developer",
    "Systems Software Engineer",
]

CV_EXTRACT_SYSTEM_PROMPT = """You are an elite Technical Resume and CV Parser for an autonomous job application system.
Analyze the provided CV text thoroughly and extract accurate, structured candidate information.
Preserve factual fidelity—never invent credentials or companies.
In addition, generate EXACTLY 10 realistic, highly-matching job titles / target roles that directly fit the candidate's skills and experience.

You must return ONLY a valid JSON object matching this exact structure:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "professional_title": "Primary Job Title (e.g. Software Engineer or DevOps Engineer)",
  "summary": "2-3 sentence executive professional summary highlighting their core competencies and systems background",
  "skills": ["Skill1", "Skill2", "Skill3", "..."],
  "experience": [
    {
      "company": "Company Name",
      "role": "Role / Title",
      "duration": "Duration (e.g. 2023 - 2024)",
      "description": "Key accomplishments, tools used, and technical responsibilities"
    }
  ],
  "education": [
    {
      "institution": "School or University Name",
      "degree": "Degree / Field of Study",
      "year": "Year (e.g. 2021-2024)",
      "highlights": "Key curriculum focus, architecture, or honors"
    }
  ],
  "portfolio_url": "https://portfolio.com or null",
  "github_url": "https://github.com/username or null",
  "linkedin_url": "https://linkedin.com/in/username or null",
  "suggested_job_titles": [
    "Job Title 1",
    "Job Title 2",
    "Job Title 3",
    "Job Title 4",
    "Job Title 5",
    "Job Title 6",
    "Job Title 7",
    "Job Title 8",
    "Job Title 9",
    "Job Title 10"
  ]
}
"""

CV_EXTRACT_USER_PROMPT = """Here is the extracted CV text:
---------------------
{cv_text}
---------------------

Extract all candidate information and generate exactly 10 matching job titles according to the schema."""


class CVParser:
    """Extracts raw text and uses AI to extract structured profiles and suggest matching target roles."""

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF byte stream."""
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n\n".join(text_parts).strip()
        except Exception as e:
            logger.error("Failed to extract text from PDF: %s", e)
            raise ValueError(f"Could not parse PDF file: {e}")

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX byte stream."""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            text_parts = [para.text for para in doc.paragraphs if para.text.strip()]
            return "\n\n".join(text_parts).strip()
        except Exception as e:
            logger.error("Failed to extract text from DOCX: %s", e)
            raise ValueError(f"Could not parse DOCX file: {e}")

    def parse_cv_file(self, filename: str, content: bytes) -> dict[str, Any]:
        """Parse CV by extension and return extracted text and metadata."""
        ext = Path(filename).suffix.lower()
        if ext == ".pdf":
            raw_text = self.extract_text_from_pdf(content)
        elif ext in [".docx", ".doc"]:
            raw_text = self.extract_text_from_docx(content)
        else:
            raise ValueError(f"Unsupported CV file extension: {ext}. Only PDF and DOCX are allowed.")

        return {
            "filename": filename,
            "raw_text": raw_text,
            "char_count": len(raw_text),
            "word_count": len(raw_text.split()),
        }

    async def parse_and_extract_cv(self, filename: str, content: bytes) -> dict[str, Any]:
        """
        Extracts raw text and invokes the AI engine (DeepSeek / Gemini) to extract structured
        profile info and generate exactly 10 high-fit job titles matching this CV.
        """
        base_meta = self.parse_cv_file(filename, content)
        raw_text = base_meta.get("raw_text", "").strip()

        if not raw_text:
            logger.warning("CV contains no extractable text. Using fallback.")
            return {
                **base_meta,
                "suggested_job_titles": DEFAULT_MATCHING_TITLES,
            }

        try:
            # Send to AI provider for full structured extraction
            truncated_text = raw_text[:9000]
            ai_response = await ai_provider.generate_completion(
                system_prompt=CV_EXTRACT_SYSTEM_PROMPT,
                user_prompt=CV_EXTRACT_USER_PROMPT.format(cv_text=truncated_text),
                temperature=0.1,
                json_output=True,
            )

            extracted = json.loads(ai_response)
            logger.info("Successfully extracted CV data via AI for %s", filename)

            # Ensure suggested titles has 10 items
            suggested = extracted.get("suggested_job_titles") or []
            if not isinstance(suggested, list) or len(suggested) < 10:
                existing_lower = {t.lower() for t in suggested}
                for def_title in DEFAULT_MATCHING_TITLES:
                    if def_title.lower() not in existing_lower:
                        suggested.append(def_title)
                    if len(suggested) >= 10:
                        break
            extracted["suggested_job_titles"] = suggested[:10]
            extracted["raw_text"] = raw_text

            return extracted

        except Exception as err:
            logger.error("AI extraction for CV failed: %s. Using heuristic extraction.", err, exc_info=True)
            # Fallback heuristic extraction
            emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
            phones = re.findall(r"\+?\d[\d -]{8,}\d", raw_text)

            return {
                "name": None,
                "email": emails[0] if emails else None,
                "phone": phones[0] if phones else None,
                "professional_title": "Software Engineer",
                "summary": None,
                "skills": ["Python", "Docker", "Linux", "TypeScript", "Git"],
                "experience": [],
                "education": [],
                "suggested_job_titles": DEFAULT_MATCHING_TITLES,
                "raw_text": raw_text,
            }


cv_parser = CVParser()
