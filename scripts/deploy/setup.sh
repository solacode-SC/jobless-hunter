#!/usr/bin/env bash
# ===========================================
# JobHunter AI — Deployment Script
# ===========================================
# Full deployment: env setup, build, migrate, nginx, SSL
set -euo pipefail

# ── Colors & Helpers ─────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
info()  { echo -e "${BLUE}[→]${NC} $1"; }
header(){ echo -e "\n${CYAN}══════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}══════════════════════════════════════════${NC}\n"; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# ── 1. Prerequisite Checks ──────────────
header "Checking Prerequisites"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 is not installed."
        return 1
    fi
    log "$1 is installed: $(command -v "$1")"
}

MISSING=0
check_command docker   || MISSING=1
check_command nginx    || warn "Nginx not installed — will skip Nginx setup"

# Check Docker Compose (v2 plugin or standalone)
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    log "Docker Compose (plugin) found: $(docker compose version --short)"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    log "Docker Compose (standalone) found: $(docker-compose version --short)"
else
    error "Docker Compose is not installed."
    MISSING=1
fi

if [[ $MISSING -eq 1 ]]; then
    error "Missing required tools. Please install them and try again."
    exit 1
fi

# Check Docker daemon is running
if ! docker info &> /dev/null; then
    error "Docker daemon is not running. Please start Docker and try again."
    exit 1
fi
log "Docker daemon is running"

# ── 2. Environment Setup ────────────────
header "Setting Up Environment"

generate_secret() {
    openssl rand -hex "$1" 2>/dev/null || head -c "$1" /dev/urandom | xxd -p | tr -d '\n' | head -c "$((2 * $1))"
}

if [[ ! -f .env ]]; then
    info "Creating .env from .env.example..."
    cp .env.example .env

    # Generate random secrets
    APP_SECRET=$(generate_secret 32)
    POSTGRES_PASS=$(generate_secret 24)
    REDIS_PASS=$(generate_secret 24)
    JWT_SECRET=$(generate_secret 32)
    N8N_PASS=$(generate_secret 16)
    N8N_ENCRYPTION=$(generate_secret 32)

    # Replace placeholder values in .env
    sed -i "s|change-me-to-a-random-64-char-string|${APP_SECRET}|g" .env
    sed -i "s|change-me-strong-password|${POSTGRES_PASS}|g" .env
    sed -i "s|change-me-redis-password|${REDIS_PASS}|g" .env
    sed -i "s|change-me-jwt-secret|${JWT_SECRET}|g" .env
    sed -i "s|change-me-n8n-password|${N8N_PASS}|g" .env
    sed -i "s|change-me-encryption-key|${N8N_ENCRYPTION}|g" .env

    log "Generated .env with random secrets"
    warn "Review .env and set API keys before going live!"
else
    log ".env already exists — skipping generation"
fi

# Verify critical env vars are set
source .env
MISSING_VARS=0
for var in POSTGRES_PASSWORD REDIS_PASSWORD APP_SECRET_KEY JWT_SECRET_KEY N8N_BASIC_AUTH_PASSWORD N8N_ENCRYPTION_KEY; do
    val="${!var:-}"
    if [[ -z "$val" || "$val" == "change-me"* || "$val" == "your-"* ]]; then
        warn "⚠ $var is not set or uses a placeholder value"
        MISSING_VARS=1
    fi
done
if [[ $MISSING_VARS -eq 1 ]]; then
    warn "Some environment variables need attention. Continuing with current values..."
fi

# ── 3. Create Required Directories ──────
header "Creating Directories"

mkdir -p uploads/cvs uploads/covers uploads/generated
mkdir -p logs
mkdir -p backups
mkdir -p n8n/workflows
log "Directories created"

# ── 4. Build & Start Containers ─────────
header "Building and Starting Services"

info "Pulling base images..."
$COMPOSE_CMD pull postgres redis n8n 2>&1 | tail -5

info "Building application images..."
$COMPOSE_CMD build --parallel 2>&1 | tail -10

info "Starting services..."
$COMPOSE_CMD up -d

# Wait for health checks
info "Waiting for services to become healthy..."
SERVICES=(postgres redis backend)
MAX_WAIT=120
ELAPSED=0

for svc in "${SERVICES[@]}"; do
    while true; do
        STATUS=$($COMPOSE_CMD ps --format json "$svc" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('Health','unknown'))" 2>/dev/null || echo "unknown")
        if [[ "$STATUS" == "healthy" ]]; then
            log "$svc is healthy"
            break
        fi
        if [[ $ELAPSED -ge $MAX_WAIT ]]; then
            warn "$svc did not become healthy within ${MAX_WAIT}s — check logs with: $COMPOSE_CMD logs $svc"
            break
        fi
        sleep 5
        ELAPSED=$((ELAPSED + 5))
    done
done

# Show service status
echo ""
$COMPOSE_CMD ps
echo ""

# ── 5. Database Migrations ──────────────
header "Running Database Migrations"

if [[ -d backend/alembic ]]; then
    info "Running Alembic migrations..."
    $COMPOSE_CMD exec -T backend alembic upgrade head 2>&1 && \
        log "Migrations completed" || \
        warn "Migration failed — you may need to run manually: $COMPOSE_CMD exec backend alembic upgrade head"
else
    warn "No alembic directory found — skipping migrations"
fi

# ── 6. Import n8n Workflows ─────────────
header "Importing n8n Workflows"

WORKFLOW_DIR="n8n/workflows"
if [[ -d "$WORKFLOW_DIR" ]] && ls "$WORKFLOW_DIR"/*.json &> /dev/null 2>&1; then
    for wf in "$WORKFLOW_DIR"/*.json; do
        BASENAME=$(basename "$wf")
        info "Importing workflow: $BASENAME"
        $COMPOSE_CMD exec -T n8n n8n import:workflow --input="/home/node/workflows/$BASENAME" 2>&1 && \
            log "Imported $BASENAME" || \
            warn "Failed to import $BASENAME"
    done
else
    info "No workflow files found in $WORKFLOW_DIR — skipping"
fi

# ── 7. Nginx Setup ──────────────────────
header "Setting Up Nginx"

if command -v nginx &> /dev/null; then
    NGINX_CONF_DIR="/etc/nginx/conf.d"
    NGINX_SSL_DIR="/etc/nginx/ssl"

    # Create self-signed cert if none exists (for initial setup)
    if [[ ! -f "$NGINX_SSL_DIR/self-signed.crt" ]]; then
        info "Generating self-signed certificate for initial setup..."
        sudo mkdir -p "$NGINX_SSL_DIR"
        sudo openssl req -x509 -nodes -days 365 \
            -newkey rsa:2048 \
            -keyout "$NGINX_SSL_DIR/self-signed.key" \
            -out "$NGINX_SSL_DIR/self-signed.crt" \
            -subj "/C=US/ST=State/L=City/O=JobHunter/CN=jobs.solaymanbuilds.com" \
            2>/dev/null
        log "Self-signed certificate created"
    fi

    # Create ACME challenge directory
    sudo mkdir -p /var/www/certbot

    # Copy Nginx config
    info "Installing Nginx configuration..."
    sudo cp nginx/conf.d/jobhunter.conf "$NGINX_CONF_DIR/jobhunter.conf"
    log "Nginx config copied to $NGINX_CONF_DIR"

    # Test Nginx configuration
    info "Testing Nginx configuration..."
    if sudo nginx -t 2>&1; then
        log "Nginx configuration is valid"
        sudo systemctl reload nginx 2>/dev/null || sudo nginx -s reload 2>/dev/null
        log "Nginx reloaded"
    else
        error "Nginx configuration test failed! Please fix errors above."
    fi
else
    warn "Nginx not installed — skipping Nginx setup"
    info "Install Nginx and re-run, or manually configure your reverse proxy"
fi

# ── 8. SSL with Certbot ─────────────────
header "SSL Certificate Setup"

if command -v certbot &> /dev/null; then
    read -rp "Set up Let's Encrypt SSL certificates now? [y/N]: " SETUP_SSL
    if [[ "${SETUP_SSL,,}" == "y" ]]; then
        DOMAINS=("jobs.solaymanbuilds.com" "automation.solaymanbuilds.com")

        for domain in "${DOMAINS[@]}"; do
            info "Requesting certificate for $domain..."
            sudo certbot certonly \
                --nginx \
                -d "$domain" \
                --non-interactive \
                --agree-tos \
                --email "admin@solaymanbuilds.com" \
                --redirect \
                2>&1 && log "Certificate obtained for $domain" || warn "Failed for $domain — verify DNS points to this server"
        done

        # Update Nginx config to use real certificates
        info "Updating Nginx config to use Let's Encrypt certificates..."
        CONF="$NGINX_CONF_DIR/jobhunter.conf"

        # Uncomment certbot lines and comment self-signed lines
        for domain in "${DOMAINS[@]}"; do
            sudo sed -i "/$domain/,/ssl_certificate_key.*self-signed/ {
                s|# ssl_certificate /etc/letsencrypt|ssl_certificate /etc/letsencrypt|g
                s|# ssl_certificate_key /etc/letsencrypt|ssl_certificate_key /etc/letsencrypt|g
                s|# ssl_trusted_certificate /etc/letsencrypt|ssl_trusted_certificate /etc/letsencrypt|g
                s|ssl_certificate /etc/nginx/ssl/self-signed|# ssl_certificate /etc/nginx/ssl/self-signed|g
                s|ssl_certificate_key /etc/nginx/ssl/self-signed|# ssl_certificate_key /etc/nginx/ssl/self-signed|g
            }" "$CONF"
        done

        # Enable OCSP stapling
        sudo sed -i 's|# ssl_stapling on|ssl_stapling on|g' "$CONF"
        sudo sed -i 's|# ssl_stapling_verify on|ssl_stapling_verify on|g' "$CONF"
        sudo sed -i 's|# resolver 1.1.1.1|resolver 1.1.1.1|g' "$CONF"
        sudo sed -i 's|# resolver_timeout|resolver_timeout|g' "$CONF"

        # Test and reload
        if sudo nginx -t 2>&1; then
            sudo systemctl reload nginx 2>/dev/null || sudo nginx -s reload
            log "Nginx reloaded with SSL certificates"
        fi

        # Set up auto-renewal cron
        if ! crontab -l 2>/dev/null | grep -q certbot; then
            (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
            log "Certbot auto-renewal cron job added"
        fi
    else
        info "Skipping SSL setup — run certbot manually when ready"
    fi
else
    warn "Certbot not installed. Install with: sudo apt install certbot python3-certbot-nginx"
    info "Then run: sudo certbot --nginx -d jobs.solaymanbuilds.com -d automation.solaymanbuilds.com"
fi

# ── 9. Summary ───────────────────────────
header "Deployment Complete"

echo -e "${GREEN}Services:${NC}"
$COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || $COMPOSE_CMD ps

echo ""
echo -e "${CYAN}Access Points:${NC}"
echo -e "  Dashboard:    https://jobs.solaymanbuilds.com  (localhost:${DASHBOARD_PORT:-9876})"
echo -e "  API:          https://jobs.solaymanbuilds.com/api  (localhost:${API_PORT:-9878})"
echo -e "  n8n:          https://automation.solaymanbuilds.com  (localhost:${N8N_PORT_EXTERNAL:-9877})"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Update AI_API_KEY in .env with your OpenAI key"
echo -e "  2. Set up Gmail OAuth credentials if using email features"
echo -e "  3. Configure n8n workflows at https://automation.solaymanbuilds.com"
echo -e "  4. Set up backup cron: crontab -e → 0 2 * * * ${PROJECT_DIR}/scripts/backup/backup.sh"
echo -e "  5. Monitor: ${PROJECT_DIR}/scripts/monitoring/healthcheck.sh"
echo ""
log "Deployment finished at $(date '+%Y-%m-%d %H:%M:%S')"
