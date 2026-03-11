"""Shared pytest fixtures for backend tests."""

import os
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

# Set test env before importing app modules
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ.setdefault("DB_NAME", "wellbee_test")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-key-for-testing-only")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ.setdefault("TOKEN_EXPIRY_SECONDS", "3600")
os.environ.setdefault("GEMINI_KEY", "test-gemini-key")
os.environ.setdefault("AGENT_SESSION_SIGNING_SECRET", "test-agent-session-secret")
os.environ.setdefault("AGENT_INTERNAL_SYNC_SECRET", "test-agent-sync-secret")


@pytest.fixture(autouse=True)
def clear_settings_cache():
    """Clear get_settings cache so tests can override env."""
    from src.config import get_settings

    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def test_app():
    """Create FastAPI app with mocked database init for unit tests."""
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    from src.config import get_settings
    from src.routes.admin_routes import admin_router
    from src.routes.auth_routes import auth_router
    from src.routes.chat_routes import chat_router
    from src.routes.internal_routes import internal_router
    from src.routes.user_routes import user_router

    limiter = Limiter(key_func=get_remote_address)
    settings = get_settings()
    origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

    @asynccontextmanager
    async def mock_lifespan(app: FastAPI):
        # Skip real DB init for unit tests
        yield

    app = FastAPI(lifespan=mock_lifespan, title="WellBee API Test", version="1.0.0")
    app.state.limiter = limiter
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
    app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
    app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
    app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
    app.include_router(internal_router, prefix="/api/v1/internal", tags=["Internal"])

    @app.get("/")
    def home():
        return {"message": "Backend Running"}

    @app.get("/health")
    async def health():
        return {"status": "healthy", "version": "1.0.0", "database": "disconnected"}

    return app


@pytest.fixture
async def client(test_app):
    """Async HTTP client for testing API endpoints."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_employee():
    """Create a mock Employee document."""
    employee = MagicMock()
    employee.emp_id = "emp001"
    employee.role = "employee"
    employee.password_hash = None  # First login
    employee.vibe_score = 4.0
    employee.total_work_hours = 8.5
    employee.leave_days = 5.0
    employee.types_of_leaves = {"sick": 2, "casual": 3}
    employee.feedback = 4.2
    employee.weighted_performance = 85.0
    employee.reward_points = 100
    employee.award_list = ["Star Performer"]
    employee.factors_in_sorted_order = ["leaves", "performance"]
    employee.save = AsyncMock(return_value=None)
    return employee


@pytest.fixture
def mock_employee_with_password(mock_employee):
    """Employee with existing password hash."""
    from src.services.auth_service import hash_password

    mock_employee.password_hash = hash_password("correct_password")
    return mock_employee


@pytest.fixture
def admin_token():
    """Generate a valid JWT for admin user."""
    import time

    import jwt

    from src.config import get_settings

    settings = get_settings()
    payload = {
        "emp_id": "admin001",
        "role": "admin",
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@pytest.fixture
def user_token():
    """Generate a valid JWT for regular user."""
    import time

    import jwt

    from src.config import get_settings

    settings = get_settings()
    payload = {
        "emp_id": "emp001",
        "role": "employee",
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
