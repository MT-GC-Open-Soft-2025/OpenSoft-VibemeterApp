.PHONY: install install-tools dev dev-local dev-basic dev-doctor infra-up infra-down dev-docker build lint clean help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies (repo tools, backend: uv, frontend: bun)
	bun install
	cd backend && uv sync
	cd agent_runtime && uv sync
	cd frontend && bun install

install-tools: ## Install repo-scoped dev tools only (mprocs)
	bun install

dev: ## Run the default hosted-services workflow in mprocs (.env-backed Mongo/Redis)
	@MProcs=$$(command -v mprocs || true); \
	if [ -n "$$MProcs" ]; then \
		exec "$$MProcs" -c mprocs.yaml; \
	elif [ -x "./node_modules/.bin/mprocs" ]; then \
		exec ./node_modules/.bin/mprocs -c mprocs.yaml; \
	else \
		echo "mprocs is not installed. Run 'make install-tools' or 'bun install'."; \
		exit 1; \
	fi

dev-local: ## Run the local-infra workflow in mprocs (Docker Mongo + Redis)
	@MProcs=$$(command -v mprocs || true); \
	if [ -n "$$MProcs" ]; then \
		exec "$$MProcs" -c mprocs.local.yaml; \
	elif [ -x "./node_modules/.bin/mprocs" ]; then \
		exec ./node_modules/.bin/mprocs -c mprocs.local.yaml; \
	else \
		echo "mprocs is not installed. Run 'make install-tools' or 'bun install'."; \
		exit 1; \
	fi

dev-basic: ## Run only backend + frontend with hot-reload (legacy fallback)
	@trap 'kill %1 %2 2>/dev/null; exit' INT TERM; \
	(cd backend && uv run uvicorn server:app --reload --port 8000) & \
	(cd frontend && bun run dev --host) & \
	wait

dev-doctor: ## Validate the default hosted-services workflow
	./scripts/dev/doctor.sh

infra-up: ## Start local MongoDB + Redis for development
	./scripts/dev/infra.sh up

infra-down: ## Stop local MongoDB + Redis
	./scripts/dev/infra.sh down

dev-docker: ## Run full stack in Docker with hot-reload
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

build: ## Build production Docker images
	docker compose build

lint: ## Lint backend with ruff
	cd backend && uv run ruff check .

clean: ## Stop containers and remove volumes
	docker compose down -v
	docker compose -f docker-compose.local.yml down -v
