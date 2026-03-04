# WellBee — Employee Wellness & Engagement Platform

Live at **[wellbee.live](https://www.wellbee.live)**

WellBee is a full-stack employee wellness application that combines an AI-powered chatbot, mood tracking, and an HR analytics dashboard to surface engagement risks before they become retention problems.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Bootstrap 5, Highcharts, Recharts, Lottie |
| Backend | FastAPI, Python 3.12, Uvicorn |
| Database | MongoDB (Atlas), Beanie ODM, Motor (async) |
| Auth | JWT (PyJWT) |
| AI | Google Gemini API, HuggingFace Transformers, PyTorch |
| Package managers | Bun (frontend), uv (backend) |
| Container | Docker, Nginx (frontend), GitHub Actions → ghcr.io |

## Repository Structure

```
wellbee/
├── frontend/          # React + Vite app
├── backend/           # FastAPI app
├── data-process/      # Jupyter notebooks — data pipeline & ML scoring
├── docker-compose.yml         # Production: pull & run published images
├── docker-compose.dev.yml     # Development: build from source with hot-reload
├── Makefile                   # Common developer commands
└── .env.example               # Environment variable template
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) — `curl -fsSL https://bun.sh/install | bash`
- [uv](https://docs.astral.sh/uv/) — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [Docker](https://docs.docker.com/get-docker/) (for containerised workflows)
- A hosted MongoDB URI for the normal shared development workflow
- A hosted Redis URL if you want Redis-backed development behavior in the normal workflow

## Local Dev Workflow

WellBee now has two local workflows:

- `make dev`: the primary workflow. Uses the MongoDB and Redis URLs from `.env`, then starts backend, frontend, and the 3 agent runtimes inside an `mprocs` dashboard.
- `make dev-local`: an explicit local-infra variant. Starts Docker MongoDB + Redis and then runs the same app processes in `mprocs`.
- `make dev-basic`: a fallback workflow that only starts backend + frontend.

### Why `mprocs`

I evaluated `mprocs`, Turborepo, and Procfile-style supervisors for this repo shape.

- `mprocs` is the best fit for the day-to-day loop because this repo is a mixed Python + Bun + Docker stack with 6 long-running services in development. It gives a stable terminal UI, restart controls, and per-process logs without forcing a JavaScript monorepo migration.
- Turborepo is strong for cached task graphs, but the payoff here is lower because the main pain is persistent service orchestration, not JS package build coordination. Adopting it cleanly would also mean adding workspace scaffolding around the Python services.
- Procfile-style tools are simpler, but less ergonomic once you need to inspect and restart individual agents while keeping the rest of the stack live.

The repo therefore uses `mprocs` as the primary local-dev entrypoint and keeps `make`, `uv`, `bun`, and Docker as the underlying primitives.

### 1. Configure environment

```bash
cp .env.example .env
# Fill in at least MONGO_URI, DB_NAME, JWT_SECRET, and typically REDIS_URL + GEMINI_KEY.
# This is the default workflow used by `make dev`.
```

### 2. Install dependencies

```bash
make install
```

This installs:

- repo-scoped dev tools including `mprocs`
- backend dependencies via `uv`
- agent runtime dependencies via `uv`
- frontend dependencies via `bun`

### 3. Validate your machine

```bash
make dev-doctor
```

`dev-doctor` is intentionally separate from the `mprocs` dashboard because it is a one-shot validation command, not a long-running service.

### 4. Full local development

```bash
make dev
```

This opens `mprocs` with:

- backend on `127.0.0.1:8000`
- frontend on `127.0.0.1:3000`
- agent runtimes on `127.0.0.1:8101`, `:8102`, and `:8103`
- MongoDB and Redis taken from `.env`

### 5. Local Docker-backed infra workflow

```bash
make dev-local
```

This variant forces:

- MongoDB on `127.0.0.1:27017`
- Redis on `127.0.0.1:6379`

and starts the same app processes against those local services.

### 6. Start only local infra

```bash
make infra-up
```

### 7. Fallback lightweight dev mode

```bash
make dev-basic
```

### 8. Local development (full Docker with hot-reload)

```bash
make dev-docker
# or:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 9. Run published production images

```bash
docker compose up        # pulls latest images from ghcr.io
```

### 10. Build production images locally

```bash
make build
# or:
docker compose build
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | Yes | — | MongoDB connection string used by the default hosted-services workflow |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `DB_NAME` | Yes | — | MongoDB database name |
| `GEMINI_KEY` | No | — | Google Gemini API key |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `TOKEN_EXPIRY_SECONDS` | No | `3600` | JWT lifetime in seconds |
| `REDIS_URL` | No | — | Redis URL for the default hosted-services workflow |
| `AGENT_SESSION_SIGNING_SECRET` | No | `wellbee-agent-session-secret` | Shared JWT secret between backend and agent runtimes |
| `AGENT_INTERNAL_SYNC_SECRET` | No | `wellbee-agent-sync-secret` | Shared secret for runtime-to-backend sync callbacks |
| `AGENT_SEED_BASE_HOST` | No | `http://127.0.0.1` | Host prefix used when seeding local agent URLs |
| `VITE_API_BASE_URL` | No | `https://api.wellbee.live` | Backend URL for frontend build |

See `.env.example` for a ready-to-copy template.

## Development Commands

```bash
make help        # list all commands
make install     # install all dependencies
make dev         # hosted-services workflow in mprocs
make dev-local   # local Docker MongoDB + Redis workflow in mprocs
make dev-basic   # backend + frontend only
make dev-doctor  # validate the default hosted-services workflow
make infra-up    # start local MongoDB + Redis
make infra-down  # stop local MongoDB + Redis
make dev-docker  # hot-reload dev servers (Docker)
make build       # build production Docker images
make lint        # lint backend with ruff
make clean       # stop containers, remove volumes
```

## Backend (FastAPI)

```bash
cd backend
uv sync                                           # install deps into .venv
uv run uvicorn server:app --reload --port 8000    # start with hot-reload
uv run ruff check .                               # lint
```

API is available at `http://localhost:8000`. Interactive docs at `/docs`.

## Agent Runtime

```bash
cd agent_runtime
uv sync  # optional if you keep a dedicated .venv here
uv run uvicorn app:app --reload --port 8101
```

In normal local development you should not run agent runtimes manually; `make dev` does that for all three personas.

## Frontend (React + Vite)

```bash
cd frontend
bun install       # install deps
bun run dev       # start Vite dev server on :3000
bun run build     # production build → dist/
bun run preview   # serve production build locally
```

## CI/CD

GitHub Actions (`.github/workflows/docker-publish.yml`) builds and pushes Docker images to [GitHub Container Registry](https://ghcr.io/mt-gc-open-soft-2025):

- **Push to `main`** → tagged `latest` + short SHA
- **Push `v*.*.*` tag** → versioned release tags
- **Pull request** → build-only validation (no push)

Images:
- `ghcr.io/mt-gc-open-soft-2025/vibemeter-backend`
- `ghcr.io/mt-gc-open-soft-2025/vibemeter-frontend`

Set the `VITE_API_BASE_URL` repository variable in **Settings → Secrets and variables → Actions → Variables** to point the frontend build at your API endpoint.

## Data Pipeline

The `data-process/` directory contains Jupyter notebooks that preprocess HR datasets (leave, performance, rewards, onboarding, activity) and produce per-employee engagement scores used to decide which employees the chatbot should proactively reach out to.
