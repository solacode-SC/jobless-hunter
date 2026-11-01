# JobHunter AI — Troubleshooting & Operations Guide

## 1. Port Conflict Diagnostics
All services MUST operate strictly in the range `9876–9964`.
If a container fails to bind to a port:
```bash
# Check if any port in the 9876-9882 range is already occupied
netstat -tulpn | grep -E '987[6-9]|988[0-2]'
# or using lsof
lsof -i :9876-9882
```

## 2. Docker Service Logs
To inspect logs for individual containers:
```bash
# Backend logs
docker compose logs -f backend

# Frontend Next.js logs
docker compose logs -f frontend

# n8n logs
docker compose logs -f n8n

# PostgreSQL logs
docker compose logs -f postgres
```

## 3. Database Connectivity & Migrations
If database migrations fail during startup:
```bash
# Check postgres health
docker compose exec postgres pg_isready -U jobhunter -d jobhunter

# Re-run migrations manually
docker compose exec backend alembic upgrade head
```

## 4. Resetting or Seeding Candidate Fact Base
The primary candidate profile (`Solayman El Mouden`) is seeded automatically on startup. If you need to re-seed or reset:
```bash
docker compose exec backend python -c "
import asyncio
from app.core.database import async_session_factory
from app.api.routes.candidates import get_or_create_candidate
async def main():
    async with async_session_factory() as s:
        p = await get_or_create_candidate(s)
        print('Active Candidate:', p.name, p.email)
asyncio.run(main())
"
```

## 5. Nginx Configuration & SSL Renewal
Before configuring DNS or SSL, verify that your domain resolves to the VPS IP:
```bash
dig +short jobs.solaymanbuilds.com
dig +short automation.solaymanbuilds.com
```
To request Let's Encrypt certificates:
```bash
sudo certbot certonly --webroot -w /var/www/certbot \
  -d jobs.solaymanbuilds.com \
  -d automation.solaymanbuilds.com
```
Then uncomment the SSL certificate lines in `/etc/nginx/conf.d/jobhunter.conf` and reload:
```bash
sudo nginx -t && sudo systemctl reload nginx
```
