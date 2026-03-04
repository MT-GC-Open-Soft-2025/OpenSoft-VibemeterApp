#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_env

require_cmd uv

if [[ -z "${MONGO_URI}" ]]; then
  echo "MONGO_URI is required. Set it in .env or use the local infra workflow." >&2
  exit 1
fi

if [[ "${MONGO_URI}" == *"127.0.0.1"* || "${MONGO_URI}" == *"localhost"* ]]; then
  wait_for_tcp "127.0.0.1" "27017" "MongoDB"
fi

if [[ -n "${REDIS_URL}" && ( "${REDIS_URL}" == *"127.0.0.1"* || "${REDIS_URL}" == *"localhost"* ) ]]; then
  wait_for_tcp "127.0.0.1" "6379" "Redis"
fi

cd "${ROOT_DIR}/backend"
exec uv run uvicorn server:app --host 0.0.0.0 --port 8000 --reload
