"""Tests for src.config."""

from src.config import Settings, get_settings


def test_get_settings_returns_settings_instance():
    """get_settings returns a Settings instance."""
    settings = get_settings()
    assert isinstance(settings, Settings)


def test_settings_has_required_fields():
    """Settings has all required configuration fields."""
    settings = get_settings()
    assert hasattr(settings, "mongo_uri")
    assert hasattr(settings, "db_name")
    assert hasattr(settings, "jwt_secret")
    assert hasattr(settings, "jwt_algorithm")
    assert hasattr(settings, "token_expiry_seconds")
    assert hasattr(settings, "gemini_key")
    assert hasattr(settings, "cors_origins")


def test_settings_defaults():
    """Settings has correct default values."""
    settings = get_settings()
    assert settings.jwt_algorithm == "HS256"
    assert settings.token_expiry_seconds == 3600
    assert "localhost" in settings.cors_origins
    assert settings.gemini_model == "gemini-2.0-flash"
    assert settings.gemini_temperature == 0.7
    assert settings.gemini_max_output_tokens == 1024


def test_get_settings_cached():
    """get_settings returns same instance (cached)."""
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2


def test_settings_from_env(monkeypatch, clear_settings_cache):
    """Settings loads values from environment."""
    monkeypatch.setenv("JWT_ALGORITHM", "RS256")
    monkeypatch.setenv("TOKEN_EXPIRY_SECONDS", "7200")
    settings = get_settings()
    assert settings.jwt_algorithm == "RS256"
    assert settings.token_expiry_seconds == 7200
