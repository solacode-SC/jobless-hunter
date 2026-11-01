#!/usr/bin/env bash
# ==============================================================================
# JobHunter AI — Restore Backup Script
# ==============================================================================
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <path_to_backup_archive.tar.gz>"
    exit 1
fi

ARCHIVE_PATH="$1"
if [ ! -f "${ARCHIVE_PATH}" ]; then
    echo "Error: Backup file does not exist: ${ARCHIVE_PATH}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck disable=SC1091
    source "${PROJECT_ROOT}/.env"
fi

TEMP_DIR="$(mktemp -d)"
cleanup() {
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

echo "Restoring from: ${ARCHIVE_PATH}"
tar -xzf "${ARCHIVE_PATH}" -C "${TEMP_DIR}"

# 1. Restore Database
if [ -f "${TEMP_DIR}/database.sql" ]; then
    echo "Restoring database..."
    POSTGRES_CONTAINER="jobhunter-postgres"
    if docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
        docker exec -i "${POSTGRES_CONTAINER}" psql -U "${POSTGRES_USER:-jobhunter}" -d "${POSTGRES_DB:-jobhunter}" < "${TEMP_DIR}/database.sql"
        echo "  -> Database restored successfully."
    else
        echo "  -> Container not running. Using direct host psql..."
        PGPASSWORD="${POSTGRES_PASSWORD:-}" psql -h 127.0.0.1 -p "${POSTGRES_PORT_EXTERNAL:-9879}" -U "${POSTGRES_USER:-jobhunter}" -d "${POSTGRES_DB:-jobhunter}" < "${TEMP_DIR}/database.sql"
    fi
fi

# 2. Restore Uploads
if [ -d "${TEMP_DIR}/uploads" ]; then
    echo "Restoring uploads folder..."
    mkdir -p "${PROJECT_ROOT}/uploads"
    cp -r "${TEMP_DIR}/uploads/"* "${PROJECT_ROOT}/uploads/" 2>/dev/null || true
    echo "  -> Uploads restored."
fi

# 3. Restore n8n volume
if [ -f "${TEMP_DIR}/n8n_data.tar.gz" ]; then
    echo "Restoring n8n volume..."
    docker run --rm -v jobhunter_n8n_data:/data -v "${TEMP_DIR}":/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/n8n_data.tar.gz -C /data"
    echo "  -> n8n volume restored."
fi

echo "Restore process finished."
