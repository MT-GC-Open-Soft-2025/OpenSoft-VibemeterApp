from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    agent_id: str = "anchor"
    agent_display_name: str = "Anchor"
    agent_persona_key: str = "anchor"
    agent_session_signing_secret: str = "wellbee-agent-session-secret"
    agent_internal_sync_secret: str = "wellbee-agent-sync-secret"
    main_backend_internal_url: str = "http://backend:8000/api/v1/internal"
    gemini_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    redis_url: str = ""
    session_ttl_seconds: int = 86400
    cors_origins: str = "http://localhost,http://127.0.0.1,http://localhost:3000,http://127.0.0.1:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()
