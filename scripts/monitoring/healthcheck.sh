#!/usr/bin/env bash
# ==============================================================================
# JobHunter AI — Service Health & Port Verification Script
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck disable=SC1091
    source "${PROJECT_ROOT}/.env"
fi

DASHBOARD_PORT="${DASHBOARD_PORT:-9876}"
N8N_PORT="${N8N_PORT_EXTERNAL:-9877}"
API_PORT="${API_PORT:-9878}"
POSTGRES_PORT="${POSTGRES_PORT_EXTERNAL:-9879}"
REDIS_PORT="${REDIS_PORT_EXTERNAL:-9880}"
BROWSER_PORT="${BROWSER_PORT:-9881}"

echo "=========================================="
echo " JobHunter AI — Service Health Checks"
echo " Target Port Range: 9876 - 9964"
echo "=========================================="

FAILED=0

check_service() {
    local name="$1"
    local port="$2"
    local url="$3"

    printf "%-25s [Port %-5s] " "${name}" "${port}"
    if curl -s -f -m 5 "${url}" > /dev/null 2>&1; then
        echo -e "\e[32m[OK - HEALTHY]\e[0m"
    else
        echo -e "\e[31m[FAIL - UNREACHABLE]\e[0m"
        FAILED=$((FAILED + 1))
    fi
}

check_port_listening() {
    local name="$1"
    local port="$2"

    printf "%-25s [Port %-5s] " "${name}" "${port}"
    if nc -z -w3 127.0.0.1 "${port}" 2>/dev/null; then
        echo -e "\e[32m[OK - LISTENING]\e[0m"
    else
        echo -e "\e[31m[FAIL - PORT CLOSED]\e[0m"
        FAILED=$((FAILED + 1))
    fi
}

check_service "FastAPI Backend" "${API_PORT}" "http://127.0.0.1:${API_PORT}/health"
check_service "Next.js Dashboard" "${DASHBOARD_PORT}" "http://127.0.0.1:${DASHBOARD_PORT}"
check_service "n8n Automation" "${N8N_PORT}" "http://127.0.0.1:${N8N_PORT}/healthz"
check_service "Browser Worker" "${BROWSER_PORT}" "http://127.0.0.1:${BROWSER_PORT}/health"
check_port_listening "PostgreSQL 16" "${POSTGRES_PORT}"
check_port_listening "Redis 7" "${REDIS_PORT}"

echo "------------------------------------------"
if [ ${FAILED} -eq 0 ]; then
    echo -e "\e[32mAll JobHunter AI services are healthy and running within 9876-9964!\e[0m"
    exit 0
else
    echo -e "\e[31m${FAILED} service(s) failed health inspection.\e[0m"
    exit 1
fi
