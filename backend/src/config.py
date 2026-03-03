from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str
    db_name: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    token_expiry_seconds: int = 3600
    gemini_key: str = ""
    cors_origins: str = "http://localhost,http://localhost:80,http://localhost:3000"

    # AI model config (optional overrides)
    gemini_model: str = "gemini-2.0-flash"
    gemini_temperature: float = 0.7
    gemini_max_output_tokens: int = 1024

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
