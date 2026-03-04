#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_env

missing=0
for cmd in bun uv docker; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "missing: ${cmd}"
    missing=1
  else
    echo "ok: ${cmd} -> $(command -v "${cmd}")"
  fi
done

if command -v mprocs >/dev/null 2>&1; then
  echo "ok: mprocs -> $(command -v mprocs)"
elif [[ -x "${ROOT_DIR}/node_modules/.bin/mprocs" ]]; then
  echo "ok: mprocs -> ${ROOT_DIR}/node_modules/.bin/mprocs"
else
  echo "missing: mprocs (run 'bun install' at repo root or install it globally)"
  missing=1
fi

if [[ -f "${ROOT_DIR}/.env" ]]; then
  echo "ok: .env present"
else
  echo "missing: .env (copy .env.example)"
  missing=1
fi

if [[ -z "${MONGO_URI}" ]]; then
  echo "missing: MONGO_URI (set hosted MongoDB in .env, or use local mode)"
  missing=1
fi

if [[ -z "${GEMINI_KEY}" ]]; then
  echo "warn: GEMINI_KEY is empty"
fi

echo "backend api: http://127.0.0.1:8000"
echo "frontend:    http://127.0.0.1:3000"
echo "agents:      http://127.0.0.1:8101, :8102, :8103"
echo "data mode:   ${DEV_DATA_SERVICES}"
echo "mongo uri:   ${MONGO_URI}"
echo "redis url:   ${REDIS_URL}"

exit "${missing}"
