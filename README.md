# 🎯 Jobless Hunter — 24/7 Autonomous AI Job Application Agent

Jobless Hunter is an enterprise-grade, self-hosted, autonomous job discovery, matching, and application agent designed for **Solayman El Mouden**. It runs 24/7 on Ubuntu 24.04 LTS (Contabo VPS), continuously discovering relevant software engineering and DevOps positions, evaluating fit against verified credentials using **DeepSeek AI and Google Gemini with automatic failover**, generating tailored application materials, and tracking recruiter responses.

---

## 🏗️ Architecture & Port Allocation

All application services run within the strict port range **`9876–9964`**, bound to `127.0.0.1` and reverse-proxied via host Nginx with Let's Encrypt SSL.

| Service | Port | Host Binding | Function |
|---|---|---|---|
| **Next.js Dashboard** | `9876` | `127.0.0.1:9876` | Dark-first SaaS control panel (`jobs.solaymanbuilds.com`) |
| **n8n Automation** | `9877` | `127.0.0.1:9877` | Orchestrator canvas (`automation.solaymanbuilds.com`) |
| **FastAPI Backend** | `9878` | `127.0.0.1:9878` | REST API, AI matching, CV tailoring engine |
| **PostgreSQL 16** | `9879` | `127.0.0.1:9879` | Relational storage for jobs, candidates, and apps |
| **Redis 7** | `9880` | `127.0.0.1:9880` | Cache, queues, and rate-limiting |
| **Browser Worker** | `9881` | `127.0.0.1:9881` | Playwright-powered scraping & browser worker |
| **Monitoring** | `9882` | `127.0.0.1:9882` | Healthcheck and status diagnostics |

---

## ⚡ Core System Capabilities

### 1. Job Discovery Engine
- Multi-source crawlers for **LinkedIn, Indeed, Google Jobs, and Remote Developer Boards (Remotive, Arbeitnow)**.
- Deterministic **SHA-256 fingerprinting** based on normalized company, role, location, and canonical URL to guarantee zero duplicate listings.

### 2. Verified Candidate Fact Base
- Authoritative profile for **Solayman El Mouden**:
  - **Education:** 1337 School – UM6P (Systems, Algorithms, C/C++)
  - **Experience:** RiLyMed (DevOps Engineer)
  - **Stack:** C, C++, Python, TypeScript, React, Next.js, Docker, Linux, PostgreSQL, Git, DevOps, AI integration.
  - **Portfolio & GitHub:** [solaymanbuilds.com](https://solaymanbuilds.com) | [github.com/solacode-SC](https://github.com/solacode-SC)
- Strict truthfulness enforcement: The AI engine is hardcoded never to fabricate credentials, companies, or dates.

### 3. AI Job Fit & Scoring Engine
- Multi-factor evaluation: technical skills (35%), experience (30%), education (15%), remote/location fit (10%), seniority (10%).
- 0–100 score with detailed rationale, matched competencies, and identified stretches.

### 4. Tailored Document Generation
- Automatic generation of role-specific CVs and personalized cover letters in English or French.
- Native ReportLab PDF compilation and download.

### 5. n8n Automation Workflows (7 Included Workflows)
- `01_job_discovery.json`: Scheduled crawl every 30 minutes.
- `02_ai_evaluation.json`: Triggered evaluation and scoring.
- `03_document_generation.json`: Auto-drafting CV & cover letter.
- `04_application_submission.json`: Queue validation & submission.
- `05_email_monitoring.json`: Gmail OAuth monitoring for recruiter replies.
- `06_daily_summary.json`: Daily executive markdown digest at 08:00 UTC.
- `07_error_recovery.json`: Execution monitoring, retries, and failure alerts.

---

## 🚀 Quick Deployment Guide

### 1. Clone & Setup Environment
```bash
cd /root/apps/job-hunter
./scripts/deploy/setup.sh
```
The script will:
1. Verify system dependencies (Docker, Compose, Nginx).
2. Generate secure random passwords and secrets in `.env`.
3. Build and launch all 6 Docker containers.
4. Run Alembic database migrations.
5. Import all 7 n8n workflows.
6. Install and test Nginx reverse-proxy configuration.

### 2. Verify Service Health
```bash
./scripts/monitoring/healthcheck.sh
```

### 3. Automated Backups & Restoration
- **Create Backup:** `./scripts/backup/backup.sh` (dumps DB, archives uploads and n8n volume).
- **Restore:** `./scripts/backup/restore.sh /path/to/backup.tar.gz`.

---

## 🔒 Security Standards
- Password hashing with **Bcrypt**.
- **JWT tokens** with configurable expiration.
- Database and Redis published **only to localhost (`127.0.0.1`)**.
- Reverse proxy hardened with **HSTS, CSP, X-Frame-Options, and TLS 1.2/1.3**.

