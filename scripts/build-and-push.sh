#!/usr/bin/env bash
set -euo pipefail

# Build and push images using values from .env when present.
if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

TAG="${TAG:-latest}"
REGISTRY="${REGISTRY:-docker.io/lurkingryuu}"
BACKEND_IMAGE="${BACKEND_IMAGE:-${REGISTRY}/vibemeter-backend}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-${REGISTRY}/vibemeter-frontend}"

echo "Building backend image..."
docker buildx build --load -t "${BACKEND_IMAGE}:${TAG}" ./backend

echo "Building frontend image..."
docker buildx build \
  --load \
  -t "${FRONTEND_IMAGE}:${TAG}" \
  --build-arg REACT_APP_API_BASE_URL="${REACT_APP_API_BASE_URL:-}" \
  ./frontend

echo "Pushing images..."
docker push "${BACKEND_IMAGE}:${TAG}"
docker push "${FRONTEND_IMAGE}:${TAG}"

echo "Done."
