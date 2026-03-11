FROM python:3.12-slim

# Copy uv binary from the official distroless image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Layer-cache: install dependencies before copying source
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy application source
COPY . .

# Add the virtual environment to PATH so uvicorn/python are directly available
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
ENV UVICORN_WORKERS=5

CMD ["sh", "-c", "uvicorn server:app --host $UVICORN_HOST --port $UVICORN_PORT --workers $UVICORN_WORKERS"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:8000/ || exit 1
