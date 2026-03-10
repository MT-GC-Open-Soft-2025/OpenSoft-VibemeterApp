#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

load_dotenv_file() {
  local env_file="$1"
  [[ -f "${env_file}" ]] || return 0

  while IFS= read -r raw_line || [[ -n "${raw_line}" ]]; do
    local line="${raw_line%$'\r'}"

    [[ -z "${line}" ]] && continue
    [[ "${line}" =~ ^[[:space:]]*# ]] && continue
    [[ "${line}" != *=* ]] && continue

    local key="${line%%=*}"
    local value="${line#*=}"

    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"

    if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "${key}=${value}"
  done < "${env_file}"
}

load_env() {
  local original_mongo_uri="${MONGO_URI-}"
  local original_db_name="${DB_NAME-}"
  local original_redis_url="${REDIS_URL-}"
  local original_redis_db="${REDIS_DB-}"
  local original_vite_api_base_url="${VITE_API_BASE_URL-}"
  local original_agent_seed_base_host="${AGENT_SEED_BASE_HOST-}"
  local original_dev_data_services="${DEV_DATA_SERVICES-}"

  load_dotenv_file "${ROOT_DIR}/.env"

  if [[ -n "${original_mongo_uri}" ]]; then export MONGO_URI="${original_mongo_uri}"; fi
  if [[ -n "${original_db_name}" ]]; then export DB_NAME="${original_db_name}"; fi
  if [[ -n "${original_redis_url}" ]]; then export REDIS_URL="${original_redis_url}"; fi
  if [[ -n "${original_redis_db}" ]]; then export REDIS_DB="${original_redis_db}"; fi
  if [[ -n "${original_vite_api_base_url}" ]]; then export VITE_API_BASE_URL="${original_vite_api_base_url}"; fi
  if [[ -n "${original_agent_seed_base_host}" ]]; then
    export AGENT_SEED_BASE_HOST="${original_agent_seed_base_host}"
  fi
  if [[ -n "${original_dev_data_services}" ]]; then
    export DEV_DATA_SERVICES="${original_dev_data_services}"
  fi

  export DEV_DATA_SERVICES="${DEV_DATA_SERVICES:-hosted}"
  export MONGO_URI="${MONGO_URI:-}"
  export DB_NAME="${DB_NAME:-wellbee_dev}"
  export REDIS_URL="${REDIS_URL:-}"
  export REDIS_DB="${REDIS_DB:-0}"
  export JWT_SECRET="${JWT_SECRET:-wellbee-local-jwt-secret}"
  export JWT_ALGORITHM="${JWT_ALGORITHM:-HS256}"
  export TOKEN_EXPIRY_SECONDS="${TOKEN_EXPIRY_SECONDS:-3600}"
  export GEMINI_KEY="${GEMINI_KEY:-}"
  export VITE_API_BASE_URL="${VITE_API_BASE_URL:-http://127.0.0.1:8000}"
  export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost,http://127.0.0.1,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8100,http://127.0.0.1:8100}"
  export AGENT_SESSION_SIGNING_SECRET="${AGENT_SESSION_SIGNING_SECRET:-wellbee-agent-session-secret}"
  export AGENT_INTERNAL_SYNC_SECRET="${AGENT_INTERNAL_SYNC_SECRET:-wellbee-agent-sync-secret}"
  export AGENT_BOOTSTRAP_TOKEN_TTL_SECONDS="${AGENT_BOOTSTRAP_TOKEN_TTL_SECONDS:-300}"
  export AGENT_SEED_BASE_HOST="${AGENT_SEED_BASE_HOST:-http://127.0.0.1}"

  if [[ "${DEV_DATA_SERVICES}" == "local" ]]; then
    export MONGO_URI="mongodb://127.0.0.1:27017"
    export REDIS_URL="redis://127.0.0.1:6379/0"
    export AGENT_SEED_BASE_HOST="http://127.0.0.1"
  fi
}

wait_for_tcp() {
  local host="$1"
  local port="$2"
  local name="$3"
  local retries="${4:-60}"
  local delay="${5:-1}"

  local attempt=1
  while (( attempt <= retries )); do
    if (echo >"/dev/tcp/${host}/${port}") >/dev/null 2>&1; then
      return 0
    fi
    sleep "${delay}"
    ((attempt++))
  done

  echo "Timed out waiting for ${name} on ${host}:${port}" >&2
  return 1
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    return 1
  fi
}
