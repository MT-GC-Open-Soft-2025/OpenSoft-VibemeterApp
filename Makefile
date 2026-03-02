.PHONY: install dev dev-docker build lint clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies (backend: uv, frontend: bun)
	cd backend && uv sync
	cd frontend && bun install

dev: ## Run backend + frontend locally with hot-reload (no Docker)
	@trap 'kill %1 %2 2>/dev/null; exit' INT TERM; \
	(cd backend && uv run uvicorn server:app --reload --port 8000) & \
	(cd frontend && bun run dev) & \
	wait

dev-docker: ## Run full stack in Docker with hot-reload
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

build: ## Build production Docker images
	docker compose build

lint: ## Lint backend with ruff
	cd backend && uv run ruff check .

clean: ## Stop containers and remove volumes
	docker compose down -v
