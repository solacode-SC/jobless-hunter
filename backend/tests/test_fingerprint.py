"""Tests for job fingerprinting and URL normalization."""

from app.utils.fingerprint import generate_job_fingerprint, normalize_string, normalize_url


def test_normalize_string():
    assert normalize_string("  Senior Software Engineer! ") == "senior software engineer"
    assert normalize_string("DevOps / Cloud   Architect") == "devops cloud architect"
    assert normalize_string(None) == ""


def test_normalize_url():
    raw_url = "https://WWW.LinkedIn.Com/jobs/view/123456/?utm_source=feed&ref=newsletter#overview"
    clean_url = normalize_url(raw_url)
    assert "utm_source" not in clean_url
    assert "ref" not in clean_url
    assert "#" not in clean_url
    assert "linkedin.com/jobs/view/123456" in clean_url


def test_generate_job_fingerprint_deterministic():
    fp1 = generate_job_fingerprint("Software Engineer", "Google", "Remote", "https://google.com/jobs/1?utm_medium=email")
    fp2 = generate_job_fingerprint("software engineer ", " google", "remote", "https://google.com/jobs/1")
    assert fp1 == fp2
    assert len(fp1) == 64
