"""Parser for candidate CV files (PDF, DOCX)."""

from __future__ import annotations

import io
import logging
from pathlib import Path
from typing import Any
import docx
from pypdf import PdfReader

logger = logging.getLogger(__name__)


class CVParser:
    """Extracts raw text and basic structured data from uploaded CV files."""

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


cv_parser = CVParser()

