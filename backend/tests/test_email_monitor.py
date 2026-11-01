"""Tests for recruiter email monitoring and classification."""

from app.utils.email_monitor import email_monitor


def test_detect_interview_invitation():
    res = email_monitor.analyze_email(
        subject="Interview Invitation: Next round with tech team",
        sender="recruiter@techcorp.com",
        body="Hi Solayman, We would love to schedule a technical chat next week. Please pick a slot on my calendly.com/recruiter link."
    )
    assert res["is_interview"] is True
    assert res["is_rejection"] is False
    assert res["classification"] == "interview_invitation"
    assert res["action_required"] is True


def test_detect_rejection():
    res = email_monitor.analyze_email(
        subject="Status update on your application",
        sender="noreply@bigcorp.com",
        body="Thank you for your time. Unfortunately we have decided to pursue other candidates at this moment."
    )
    assert res["is_rejection"] is True
    assert res["is_interview"] is False
    assert res["classification"] == "rejection"


def test_detect_general_update():
    res = email_monitor.analyze_email(
        subject="Application received",
        sender="careers@startup.io",
        body="We received your resume and our hiring team is reviewing it."
    )
    assert res["classification"] == "general"
    assert res["action_required"] is False
