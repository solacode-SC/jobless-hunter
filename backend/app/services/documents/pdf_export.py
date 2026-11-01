"""PDF export utility using ReportLab."""

from __future__ import annotations

import io
import logging
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable

logger = logging.getLogger(__name__)


class PDFExporter:
    """Converts structured text or markdown into a styled PDF document."""

    def text_to_pdf(self, title: str, text_content: str, output_path: str | Path | None = None) -> bytes:
        """Render text/markdown paragraphs to a clean PDF."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer if output_path is None else str(output_path),
            pagesize=letter,
            rightMargin=54,
            leftMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=12,
        )
        h2_style = ParagraphStyle(
            "DocH2",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=10,
            spaceAfter=4,
        )
        body_style = ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
            spaceAfter=6,
        )

        story = []
        story.append(Paragraph(title, title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cbd5e1"), spaceAfter=14))

        # Split into paragraphs and parse markdown headers
        lines = text_content.split("\n")
        for line in lines:
            line_str = line.strip()
            if not line_str:
                story.append(Spacer(1, 4))
                continue

            if line_str.startswith("# "):
                story.append(Paragraph(line_str[2:], title_style))
            elif line_str.startswith("## ") or line_str.startswith("### "):
                clean_h2 = line_str.lstrip("#").strip()
                story.append(Paragraph(clean_h2, h2_style))
            elif line_str.startswith("- ") or line_str.startswith("* "):
                bullet_text = "&bull; " + line_str[2:]
                story.append(Paragraph(bullet_text, body_style))
            else:
                story.append(Paragraph(line_str, body_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        if output_path:
            with open(output_path, "wb") as f:
                f.write(pdf_bytes)
        return pdf_bytes


pdf_exporter = PDFExporter()
