#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_env

require_cmd uv

agent_id="${1:?agent id required}"
port="${2:?port required}"
display_name="${3:?display name required}"
persona_key="${4:?persona key required}"

if [[ "${MONGO_URI}" == *"127.0.0.1"* || "${MONGO_URI}" == *"localhost"* ]]; then
  wait_for_tcp "127.0.0.1" "27017" "MongoDB"
fi

if [[ -n "${REDIS_URL}" && ( "${REDIS_URL}" == *"127.0.0.1"* || "${REDIS_URL}" == *"localhost"* ) ]]; then
  wait_for_tcp "127.0.0.1" "6379" "Redis"
fi

cd "${ROOT_DIR}/agent_runtime"
export PORT="${port}"
export AGENT_ID="${agent_id}"
export AGENT_DISPLAY_NAME="${display_name}"
export AGENT_PERSONA_KEY="${persona_key}"
export MAIN_BACKEND_INTERNAL_URL="${MAIN_BACKEND_INTERNAL_URL:-http://127.0.0.1:8000/api/v1/internal}"

if [[ "${MAIN_BACKEND_INTERNAL_URL}" == *"127.0.0.1:8000"* || "${MAIN_BACKEND_INTERNAL_URL}" == *"localhost:8000"* ]]; then
  wait_for_tcp "127.0.0.1" "8000" "Backend API"
fi

exec uv run uvicorn app:app --host 0.0.0.0 --port "${port}" --reload
