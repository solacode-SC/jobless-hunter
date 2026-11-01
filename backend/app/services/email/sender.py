"""Email dispatch service supporting Gmail (App Passwords) and custom SMTP with SSL/TLS."""

from __future__ import annotations

import logging
import smtplib
import ssl
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class EmailSenderService:
    """Handles SMTP connection verification and email dispatch with attachments."""

    def test_connection(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
        use_tls: bool = True,
    ) -> Dict[str, Any]:
        """Verify SMTP credentials and server connectivity."""
        try:
            if port == 465:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(host, port, context=context, timeout=12) as server:
                    server.login(user, password)
            else:
                with smtplib.SMTP(host, port, timeout=12) as server:
                    if use_tls:
                        server.starttls(context=ssl.create_default_context())
                    server.login(user, password)

            return {
                "success": True,
                "message": f"Successfully authenticated with {host}:{port} as {user}",
            }
        except smtplib.SMTPAuthenticationError as e:
            logger.warning("SMTP auth failed for %s: %s", user, e)
            return {
                "success": False,
                "message": "Authentication failed: Check your email and Google App Password.",
            }
        except Exception as e:
            logger.error("SMTP connection error for %s: %s", host, e)
            return {
                "success": False,
                "message": f"Connection error: {str(e)}",
            }

    def send_email(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
        to_email: str,
        subject: str,
        body_text: str,
        from_name: Optional[str] = None,
        attachments: Optional[List[str]] = None,
        use_tls: bool = True,
    ) -> Dict[str, Any]:
        """Send an outreach or job application email with optional document attachments."""
        try:
            msg = MIMEMultipart()
            from_header = f"{from_name} <{user}>" if from_name else user
            msg["From"] = from_header
            msg["To"] = to_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body_text, "plain", "utf-8"))

            if attachments:
                for file_path in attachments:
                    p = Path(file_path)
                    if p.exists():
                        with open(p, "rb") as f:
                            part = MIMEBase("application", "octet-stream")
                            part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            "Content-Disposition",
                            f'attachment; filename="{p.name}"',
                        )
                        msg.attach(part)

            if port == 465:
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(host, port, context=context, timeout=15) as server:
                    server.login(user, password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(host, port, timeout=15) as server:
                    if use_tls:
                        server.starttls(context=ssl.create_default_context())
                    server.login(user, password)
                    server.send_message(msg)

            logger.info("Successfully sent email to %s via %s", to_email, host)
            return {
                "success": True,
                "message": f"Email successfully dispatched to {to_email}",
            }
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, e)
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
            }


email_service = EmailSenderService()

