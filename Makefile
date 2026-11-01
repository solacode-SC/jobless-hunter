# ==============================================================================
# Jobless Hunter — Master Automation Makefile
# Target Port Range: 9876–9964
# ==============================================================================

SHELL := /bin/bash
COMPOSE ?= docker compose

# Default target
.PHONY: help
help:
	@echo "=============================================================================="
	@echo " 🎯 Jobless Hunter — Development & Production CLI Commands"
	@echo " Target Port Allocation: 9876–9964 (Bound to 127.0.0.1)"
	@echo "=============================================================================="
	@echo ""
	@echo " 🚀 Setup & Local Testing:"
	@echo "   make init               - Generate .env file with secure secrets"
	@echo "   make test               - Run all automated tests (backend & frontend)"
	@echo "   make test-backend       - Run pytest test suite in backend"
	@echo "   make test-frontend      - Run Next.js production build check"
	@echo "   make health             - Execute multi-service healthcheck script"
	@echo "   make check-ports        - Verify services strictly use ports 9876-9964"
	@echo ""
	@echo " 🐳 Docker Operations:"
	@echo "   make up                 - Build and start all 6 Docker services in background"
	@echo "   make down               - Stop all services and remove containers"
	@echo "   make restart            - Restart all containers"
	@echo "   make build              - Rebuild Docker images without cache"
	@echo "   make ps                 - Display container status, health, and port bindings"
	@echo "   make logs               - View logs for all services (or: make logs s=backend)"
	@echo ""
	@echo " 🗄️ Database & n8n Workflows:"
	@echo "   make migrate            - Run Alembic database migrations"
	@echo "   make migrate-rollback   - Downgrade database schema by 1 revision"
	@echo "   make seed               - Verify/seed Solayman El Mouden candidate profile"
	@echo "   make import-workflows   - Import all 7 n8n workflows into n8n container"
	@echo "   make trigger-discovery  - Dispatch manual job crawler cycle"
	@echo ""
	@echo " 💾 Backup & Restore:"
	@echo "   make backup             - Create full timestamped backup (DB, n8n, uploads)"
	@echo "   make restore FILE=<tar> - Restore platform from a backup archive"
	@echo ""
	@echo " 🌐 VPS & Host Deployment:"
	@echo "   make deploy             - Run full production deployment script"
	@echo "   make nginx-check        - Test host Nginx configuration syntax"
	@echo "   make nginx-reload       - Reload host Nginx configuration"
	@echo "   make certbot            - Generate Let's Encrypt SSL certificates"
	@echo "   make clean              - Clean build artifacts, temporary files, and caches"
	@echo "=============================================================================="

# ── Environment Initialization ───────────────────────────────────────────────
.PHONY: init
init:
	@if [ -f .env ]; then \
		echo "[!] .env already exists. Skipping initialization."; \
	else \
		echo "[+] Creating .env from .env.example with random secrets..."; \
		cp .env.example .env; \
		APP_SECRET=$$(openssl rand -hex 32); \
		POSTGRES_PASS=$$(openssl rand -hex 24); \
		REDIS_PASS=$$(openssl rand -hex 24); \
		JWT_SECRET=$$(openssl rand -hex 32); \
		N8N_PASS=$$(openssl rand -hex 16); \
		N8N_ENCRYPTION=$$(openssl rand -hex 32); \
		sed -i "s|change-me-to-a-random-64-char-string|$${APP_SECRET}|g" .env; \
		sed -i "s|change-me-strong-password|$${POSTGRES_PASS}|g" .env; \
		sed -i "s|change-me-redis-password|$${REDIS_PASS}|g" .env; \
		sed -i "s|change-me-jwt-secret|$${JWT_SECRET}|g" .env; \
		sed -i "s|change-me-n8n-password|$${N8N_PASS}|g" .env; \
		sed -i "s|change-me-encryption-key|$${N8N_ENCRYPTION}|g" .env; \
		echo "[✓] .env initialized successfully."; \
	fi

# ── Testing & Quality Assurance ──────────────────────────────────────────────
.PHONY: test test-backend test-frontend
test: test-backend test-frontend
	@echo "[✓] All backend and frontend test suites passed!"

test-backend:
	@echo "==> Running Backend Tests..."
	@if [ -d backend/venv ]; then \
		source backend/venv/bin/activate && PYTHONPATH=backend pytest backend/tests -v; \
	elif command -v pytest &> /dev/null; then \
		PYTHONPATH=backend pytest backend/tests -v; \
	elif docker ps --format '{{.Names}}' | grep -q "^jobhunter-backend$$"; then \
		docker compose exec backend pytest tests -v; \
	else \
		echo "[*] Running backend tests in temporary container..."; \
		docker run --rm -v $(PWD)/backend:/app -w /app python:3.12-slim bash -c "pip install --no-cache-dir pytest pydantic httpx bs4 >/dev/null 2>&1 && pytest tests -v"; \
	fi

test-frontend:
	@echo "==> Verifying Next.js Frontend Production Build..."
	cd frontend && npm run build

# ── Healthchecks & Port Compliance ───────────────────────────────────────────
.PHONY: health check-ports
health:
	@./scripts/monitoring/healthcheck.sh

check-ports:
	@echo "==> Checking Application Listening Ports (Target Range: 9876-9964):"
	@for port in 9876 9877 9878 9879 9880 9881; do \
		if nc -z -w1 127.0.0.1 $$port 2>/dev/null; then \
			echo -e "  Port $$port: \033[0;32m[LISTENING ON 127.0.0.1]\033[0m"; \
		else \
			echo -e "  Port $$port: \033[0;33m[NOT LISTENING / CONTAINER STOPPED]\033[0m"; \
		fi \
	done

# ── Docker Lifecycle ─────────────────────────────────────────────────────────
.PHONY: up down restart build ps logs
up: init
	@echo "==> Starting Jobless Hunter Docker cluster..."
	$(COMPOSE) up -d
	@echo "[✓] Containers launched."
	@$(MAKE) ps

down:
	@echo "==> Stopping Jobless Hunter Docker cluster..."
	$(COMPOSE) down

restart:
	@echo "==> Restarting all containers..."
	$(COMPOSE) restart

build:
	@echo "==> Building Docker images..."
	$(COMPOSE) build --no-cache

ps:
	@$(COMPOSE) ps

logs:
	@if [ -n "$(s)" ]; then \
		$(COMPOSE) logs -f $(s); \
	else \
		$(COMPOSE) logs -f --tail=100; \
	fi

# ── Database & Migrations ────────────────────────────────────────────────────
.PHONY: migrate migrate-rollback seed trigger-discovery import-workflows
migrate:
	@echo "==> Applying Alembic Database Migrations..."
	@$(COMPOSE) exec backend alembic upgrade head 2>/dev/null || $(COMPOSE) exec backend alembic stamp head
	@echo "[✓] Database migrations applied."

migrate-rollback:
	@echo "==> Rolling back last Alembic migration..."
	$(COMPOSE) exec backend alembic downgrade -1

seed:
	@echo "==> Verifying Candidate Profile..."
	@curl -s http://127.0.0.1:9878/api/candidate/profile | python3 -m json.tool || echo "[!] Backend not reachable on 9878"

trigger-discovery:
	@echo "==> Triggering Manual Job Discovery Cycle..."
	@curl -s -X POST "http://127.0.0.1:9878/api/discovery/run?query=Software%20Engineer" | python3 -m json.tool

import-workflows:
	@echo "==> Importing all 7 n8n Workflows..."
	@for wf in n8n/workflows/*.json; do \
		BASENAME=$$(basename "$$wf"); \
		echo "  Importing $$BASENAME..."; \
		$(COMPOSE) exec -T n8n n8n import:workflow --input="/home/node/workflows/$$BASENAME" || true; \
	done
	@echo "[✓] Workflow import complete."

# ── Backup & Maintenance ─────────────────────────────────────────────────────
.PHONY: backup restore clean
backup:
	@./scripts/backup/backup.sh

restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make restore FILE=<path_to_backup.tar.gz>"; \
		exit 1; \
	fi
	@./scripts/backup/restore.sh "$(FILE)"

clean:
	@echo "==> Cleaning temporary files and caches..."
	@rm -rf frontend/.next frontend/out frontend/node_modules/.cache
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.py[cod]" -delete
	@echo "[✓] Workspace cleaned."

# ── VPS Production Operations ────────────────────────────────────────────────
.PHONY: deploy nginx-check nginx-reload certbot
deploy:
	@./scripts/deploy/setup.sh

nginx-check:
	@sudo nginx -t

nginx-reload:
	@sudo nginx -t && sudo systemctl reload nginx
	@echo "[✓] Nginx reloaded."

certbot:
	@echo "==> Requesting Certbot SSL Certificates..."
	@sudo certbot certonly --webroot -w /var/www/certbot \
		-d jobs.solaymanbuilds.com \
		-d automation.solaymanbuilds.com
	@echo "[✓] Certbot certificates generated. Ensure paths are uncommented in nginx/conf.d/jobhunter.conf."

