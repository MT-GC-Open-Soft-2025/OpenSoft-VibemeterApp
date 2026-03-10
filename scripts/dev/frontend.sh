#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
load_env

require_cmd bun

cd "${ROOT_DIR}/frontend"
exec bun run dev --host 0.0.0.0 --port 8100
