"""Tests for auth API routes."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_signin_success(client):
    """POST /signin with valid credentials returns token."""
    with patch(
        "src.controllers.auth_controller.signin_service", new_callable=AsyncMock
    ) as mock_signin:
        mock_signin.return_value = {"access_token": "fake-token", "token_type": "Bearer"}

        response = await client.post(
            "/api/v1/auth/signin",
            json={"username": "emp001", "password": "correct_password"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "Bearer"
        mock_signin.assert_called_once_with("emp001", "correct_password")


@pytest.mark.asyncio
async def test_signin_invalid_credentials(client):
    """POST /signin with invalid credentials returns 401."""
    with patch("src.services.auth_service.Employee") as mock_employee:
        mock_employee.find.return_value.first_or_none = AsyncMock(return_value=None)

        response = await client.post(
            "/api/v1/auth/signin",
            json={"username": "unknown", "password": "wrong"},
        )

        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_signin_missing_username(client):
    """POST /signin without username returns 422 (validation error)."""
    response = await client.post(
        "/api/v1/auth/signin",
        json={"username": "", "password": "secret"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_signin_missing_password(client):
    """POST /signin without password returns 422."""
    response = await client.post(
        "/api/v1/auth/signin",
        json={"username": "user", "password": ""},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_signin_missing_body(client):
    """POST /signin without body returns 422."""
    response = await client.post("/api/v1/auth/signin", json={})
    assert response.status_code == 422
