from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings

# Project root (where .env lives when running via make dev)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
_ENV_FILE = _PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    mongo_uri: str
    db_name: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    token_expiry_seconds: int = 3600
    gemini_key: str = ""
    cors_origins: str = (
        "http://localhost,"
        "http://127.0.0.1,"
        "http://localhost:80,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:8100,"
        "http://127.0.0.1:8100"
    )

    # AI model config (optional overrides)
    gemini_model: str = "gemini-2.0-flash"
    gemini_temperature: float = 0.7
    gemini_max_output_tokens: int = 1024
    # Redis configuration (used for streaming queues / caching)
    redis_url: str = ""
    redis_db: int = 0
    agent_session_signing_secret: str = "wellbee-agent-session-secret"
    agent_internal_sync_secret: str = "wellbee-agent-sync-secret"
    agent_bootstrap_token_ttl_seconds: int = 300
    seed_default_agents: bool = True
    agent_seed_base_host: str = "http://localhost"

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",  # Ignore extra vars (VITE_*, REGISTRY, etc.) used by frontend/docker
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
