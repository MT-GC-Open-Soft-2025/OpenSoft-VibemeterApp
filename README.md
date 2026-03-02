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
- A MongoDB Atlas cluster (or any MongoDB URI)

### 1. Configure environment

```bash
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, DB_NAME, GEMINI_KEY
```

### 2. Local development (no Docker)

```bash
make install   # installs backend (uv) and frontend (bun) deps
make dev       # starts both with hot-reload
               # backend → http://localhost:8000
               # frontend → http://localhost:3000
```

### 3. Local development (Docker with hot-reload)

```bash
make dev-docker
# or:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 4. Run published production images

```bash
docker compose up        # pulls latest images from ghcr.io
```

### 5. Build production images locally

```bash
make build
# or:
docker compose build
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs |
| `DB_NAME` | Yes | — | MongoDB database name |
| `GEMINI_KEY` | No | — | Google Gemini API key |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `TOKEN_EXPIRY_SECONDS` | No | `3600` | JWT lifetime in seconds |
| `VITE_API_BASE_URL` | No | `https://api.wellbee.live` | Backend URL for frontend build |

See `.env.example` for a ready-to-copy template.

## Development Commands

```bash
make help        # list all commands
make install     # install all dependencies
make dev         # hot-reload dev servers (no Docker)
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
