#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_env
require_cmd docker

action="${1:-up}"

case "${action}" in
  up)
    docker compose -f "${ROOT_DIR}/docker-compose.local.yml" up -d --wait
    echo "Local MongoDB and Redis are ready."
    ;;
  down)
    docker compose -f "${ROOT_DIR}/docker-compose.local.yml" down
    ;;
  logs)
    docker compose -f "${ROOT_DIR}/docker-compose.local.yml" logs -f
    ;;
  *)
    echo "Usage: $0 {up|down|logs}" >&2
    exit 1
    ;;
esac
