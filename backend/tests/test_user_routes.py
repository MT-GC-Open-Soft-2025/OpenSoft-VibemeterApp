"""Tests for user API routes."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_get_user_details_success(client, user_token):
    """GET /getUserDetails with valid token returns user data."""
    with patch(
        "src.controllers.user_controller.get_user_details", new_callable=AsyncMock
    ) as m:
        m.return_value = {
            "emp_id": "emp001",
            "role": "employee",
            "total_work_hours": 8.5,
            "reward_points": 100,
        }

        response = await client.get(
            "/api/v1/user/getUserDetails",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["emp_id"] == "emp001"
        assert data["role"] == "employee"


@pytest.mark.asyncio
async def test_get_user_details_unauthorized(client):
    """GET /getUserDetails without token returns 401."""
    response = await client.get("/api/v1/user/getUserDetails")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_user_details_invalid_token(client):
    """GET /getUserDetails with invalid token returns 401."""
    response = await client.get(
        "/api/v1/user/getUserDetails",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_convoids_success(client, user_token):
    """GET /getConvoids with valid token returns convoid list."""
    with patch(
        "src.controllers.user_controller.get_all_convoid", new_callable=AsyncMock
    ) as m:
        m.return_value = {"convid_list": ["conv-001", "conv-002"]}

        response = await client.get(
            "/api/v1/user/getConvoids",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["convid_list"] == ["conv-001", "conv-002"]


@pytest.mark.asyncio
async def test_get_convoids_unauthorized(client):
    """GET /getConvoids without token returns 401."""
    response = await client.get("/api/v1/user/getConvoids")
    assert response.status_code == 401
