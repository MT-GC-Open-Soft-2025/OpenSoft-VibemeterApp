"""Tests for src.middlewares.authmiddleware."""

import time

import jwt
import pytest
from fastapi import HTTPException

from src.config import get_settings
from src.middlewares.authmiddleware import adminauthenticate, authenticate


class TestAuthenticate:
    """Tests for authenticate dependency."""

    def test_authenticate_valid_token(self, user_token):
        """Valid token returns decoded payload."""
        from fastapi.security import HTTPAuthorizationCredentials

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=user_token)
        result = authenticate(creds)
        assert result["emp_id"] == "emp001"
        assert result["role"] == "employee"

    def test_authenticate_invalid_token(self):
        """Invalid token raises 401."""
        from fastapi.security import HTTPAuthorizationCredentials

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.jwt.token")
        with pytest.raises(HTTPException) as exc_info:
            authenticate(creds)
        assert exc_info.value.status_code == 401
        assert "Invalid" in str(exc_info.value.detail)

    def test_authenticate_expired_token(self):
        """Expired token raises 401."""
        from fastapi.security import HTTPAuthorizationCredentials

        settings = get_settings()
        payload = {
            "emp_id": "emp001",
            "role": "employee",
            "iat": int(time.time()) - 7200,
            "exp": int(time.time()) - 3600,
        }
        expired_token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=expired_token)
        with pytest.raises(HTTPException) as exc_info:
            authenticate(creds)
        assert exc_info.value.status_code == 401
        assert "expired" in str(exc_info.value.detail).lower()


class TestAdminAuthenticate:
    """Tests for adminauthenticate dependency."""

    def test_admin_authenticate_allows_admin(self, admin_token):
        """Admin token passes adminauthenticate."""
        from fastapi.security import HTTPAuthorizationCredentials

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=admin_token)
        user = authenticate(creds)
        result = adminauthenticate(user)
        assert result["role"] == "admin"
        assert result["emp_id"] == "admin001"

    def test_admin_authenticate_rejects_employee(self, user_token):
        """Non-admin token raises 403."""
        from fastapi.security import HTTPAuthorizationCredentials

        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=user_token)
        user = authenticate(creds)
        with pytest.raises(HTTPException) as exc_info:
            adminauthenticate(user)
        assert exc_info.value.status_code == 403
        assert "Admin" in str(exc_info.value.detail)
