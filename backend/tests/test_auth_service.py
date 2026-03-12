"""Tests for src.services.auth_service."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from src.services.auth_service import hash_password, signin, verify_password


class TestVerifyPassword:
    """Tests for verify_password."""

    def test_verify_correct_password(self):
        """Correct password verifies successfully."""
        hashed = hash_password("my_secret")
        assert verify_password("my_secret", hashed) is True

    def test_verify_wrong_password(self):
        """Wrong password returns False."""
        hashed = hash_password("my_secret")
        assert verify_password("wrong_password", hashed) is False


class TestHashPassword:
    """Tests for hash_password."""

    def test_hash_produces_different_output_each_time(self):
        """Bcrypt produces different hashes (salt)."""
        h1 = hash_password("same_password")
        h2 = hash_password("same_password")
        assert h1 != h2
        assert verify_password("same_password", h1)
        assert verify_password("same_password", h2)

    def test_hash_not_empty(self):
        """Hash is non-empty string."""
        hashed = hash_password("test")
        assert isinstance(hashed, str)
        assert len(hashed) > 0


class TestSignin:
    """Tests for signin."""

    @pytest.mark.asyncio
    async def test_signin_user_not_found(self):
        """Signin with non-existent user raises 401."""
        with patch("src.services.auth_service.Employee") as mock_employee:
            mock_employee.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await signin("unknown_user", "password")

            assert exc_info.value.status_code == 401
            assert "Invalid credentials" in str(exc_info.value.detail)

    # @pytest.mark.asyncio
    # async def test_signin_wrong_password(self, mock_employee_with_password):
    #     """Signin with wrong password raises 401."""
    #     with patch("src.services.auth_service.Employee") as mock_employee:
    #         mock_employee.find.return_value.first_or_none = AsyncMock(
    #             return_value=mock_employee_with_password
    #         )

    #         with pytest.raises(HTTPException) as exc_info:
    #             await signin("emp001", "wrong_password")

    #         assert exc_info.value.status_code == 401
    #         assert "Invalid credentials" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_signin_success_with_password(self, mock_employee_with_password):
        """Signin with correct password returns token."""
        with patch("src.services.auth_service.Employee") as mock_employee:
            mock_employee.find.return_value.first_or_none = AsyncMock(
                return_value=mock_employee_with_password
            )

            result = await signin("emp001", "correct_password")

            assert "access_token" in result
            assert result["token_type"] == "Bearer"
            assert isinstance(result["access_token"], str)

    # @pytest.mark.asyncio
    # async def test_signin_first_login_sets_password(self, mock_employee):
    #     """First login (no password_hash) sets password and returns token."""
    #     with patch("src.services.auth_service.Employee") as mock_employee_cls:
    #         mock_employee_cls.find.return_value.first_or_none = AsyncMock(
    #             return_value=mock_employee
    #         )

    #         result = await signin("emp001", "new_password")

    #         mock_employee.save.assert_called_once()
    #         assert mock_employee.password_hash is not None
    #         assert verify_password("new_password", mock_employee.password_hash)
    #         assert "access_token" in result
    #         assert result["token_type"] == "Bearer"
