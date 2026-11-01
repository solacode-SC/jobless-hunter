#!/usr/bin/env bash
# ==============================================================================
# JobHunter AI — Automated Backup Script
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Load environment
if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck disable=SC1091
    source "${PROJECT_ROOT}/.env"
fi

BACKUP_DIR="${BACKUP_PATH:-${PROJECT_ROOT}/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
BACKUP_ARCHIVE="${BACKUP_DIR}/jobhunter_backup_${TIMESTAMP}.tar.gz"
TEMP_DIR="$(mktemp -d)"

mkdir -p "${BACKUP_DIR}"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting JobHunter AI backup: ${TIMESTAMP}"

cleanup() {
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

# 1. PostgreSQL Database Dump
echo "[1/4] Dumping PostgreSQL database..."
POSTGRES_CONTAINER="jobhunter-postgres"
if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    docker exec "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER:-jobhunter}" -d "${POSTGRES_DB:-jobhunter}" --clean --if-exists > "${TEMP_DIR}/database.sql"
    echo "  -> PostgreSQL dump created (${TEMP_DIR}/database.sql)"
else
    echo "  [WARNING] Container ${POSTGRES_CONTAINER} not running. Trying direct pg_dump via port ${POSTGRES_PORT_EXTERNAL:-9879}..."
    PGPASSWORD="${POSTGRES_PASSWORD:-}" pg_dump -h 127.0.0.1 -p "${POSTGRES_PORT_EXTERNAL:-9879}" -U "${POSTGRES_USER:-jobhunter}" -d "${POSTGRES_DB:-jobhunter}" --clean --if-exists > "${TEMP_DIR}/database.sql" || echo "  [FAILED] Could not dump database."
fi

# 2. Backup Uploads Directory
echo "[2/4] Archiving uploaded CVs and documents..."
if [ -d "${PROJECT_ROOT}/uploads" ]; then
    cp -r "${PROJECT_ROOT}/uploads" "${TEMP_DIR}/uploads"
    echo "  -> Uploads copied."
fi

# 3. Backup n8n workflow data if docker volume exists
echo "[3/4] Backing up n8n configuration volume..."
docker run --rm -v jobhunter_n8n_data:/data -v "${TEMP_DIR}":/backup alpine tar czf /backup/n8n_data.tar.gz -C /data . 2>/dev/null || echo "  -> n8n volume backup skipped/not yet initialized."

# 4. Pack into master compressed tarball
echo "[4/4] Creating final compressed backup archive..."
tar -czf "${BACKUP_ARCHIVE}" -C "${TEMP_DIR}" .
echo "  -> Backup saved: ${BACKUP_ARCHIVE} ($(du -h "${BACKUP_ARCHIVE}" | cut -f1))"

# 5. Rotate old backups
echo "Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "jobhunter_backup_*.tar.gz" -mtime +"${RETENTION_DAYS}" -exec rm -f {} +

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup completed successfully."
