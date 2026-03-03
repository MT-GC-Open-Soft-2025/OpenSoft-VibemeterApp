"""Tests for server endpoints (home, health)."""

import pytest


@pytest.mark.asyncio
async def test_home_endpoint(client):
    """GET / returns backend running message."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Backend Running"


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """GET /health returns status (test app has disconnected DB)."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data
    assert data["version"] == "1.0.0"
