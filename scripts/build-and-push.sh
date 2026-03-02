#!/usr/bin/env bash
set -euo pipefail

# Local build-and-push helper.
# Images are normally published automatically by GitHub Actions on every push
# to main (or on a semver tag).  Use this script only when you need to build
# and push from your local machine.
#
# Prerequisites (ghcr.io):
#   echo $CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
#   (CR_PAT = a GitHub Personal Access Token with `write:packages` scope)

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-ghcr.io/mt-gc-open-soft-2025}"
BACKEND_IMAGE="${BACKEND_IMAGE:-${REGISTRY}/vibemeter-backend}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-${REGISTRY}/vibemeter-frontend}"

echo "Building backend image → ${BACKEND_IMAGE}:${TAG}"
docker buildx build --load -t "${BACKEND_IMAGE}:${TAG}" ./backend

echo "Building frontend image → ${FRONTEND_IMAGE}:${TAG}"
docker buildx build \
  --load \
  -t "${FRONTEND_IMAGE}:${TAG}" \
  --build-arg REACT_APP_API_BASE_URL="${REACT_APP_API_BASE_URL:-}" \
  ./frontend

echo "Pushing images..."
docker push "${BACKEND_IMAGE}:${TAG}"
docker push "${FRONTEND_IMAGE}:${TAG}"

echo "Done."
