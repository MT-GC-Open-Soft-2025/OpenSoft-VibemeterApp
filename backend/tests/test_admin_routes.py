"""Tests for admin API routes."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_admin_test_route_no_auth(client):
    """GET /test does not require auth."""
    response = await client.get("/api/v1/admin/test")
    assert response.status_code == 200
    assert response.json()["message"] == "Admin Route is Active"


@pytest.mark.asyncio
async def test_get_details_requires_admin(client, admin_token):
    """GET /get_details requires admin token."""
    with patch("src.controllers.admin_controller.get_all_employees", new_callable=AsyncMock) as m:
        m.return_value = [{"emp_id": "emp001"}]

        response = await client.get(
            "/api/v1/admin/get_details",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        assert "employees" in response.json()


@pytest.mark.asyncio
async def test_get_details_rejects_employee(client, user_token):
    """GET /get_details rejects non-admin token."""
    response = await client.get(
        "/api/v1/admin/get_details",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_detail_employee_success(client, admin_token):
    """GET /get_detail/{employee_id} returns employee data."""
    with patch("src.controllers.admin_controller.fetch_employee_data", new_callable=AsyncMock) as m:
        m.return_value = {"user_record": {"emp_id": "emp001"}}

        response = await client.get(
            "/api/v1/admin/get_detail/emp001",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        assert "user_record" in response.json()


@pytest.mark.asyncio
async def test_get_conversations_success(client, admin_token):
    """GET /get_conversations/{employee_id} returns convo IDs."""
    with patch(
        "src.controllers.admin_controller.fetch_employee_conversation",
        new_callable=AsyncMock,
    ) as m_conv:
        with patch(
            "src.controllers.admin_controller.fetch_employee_conversationFeedback_byId",
            new_callable=AsyncMock,
        ) as m_fb:
            m_conv.return_value = ["conv-001", "conv-002"]
            m_fb.return_value = "Great"  # Not -1, so included

            response = await client.get(
                "/api/v1/admin/get_conversations/emp001",
                headers={"Authorization": f"Bearer {admin_token}"},
            )

            assert response.status_code == 200
            assert "ConvoID" in response.json()


@pytest.mark.asyncio
async def test_get_conversation_success(client, admin_token):
    """GET /get_conversation/{employee_id}/{convo_id} returns messages."""
    with patch(
        "src.controllers.admin_controller.specific_conversation", new_callable=AsyncMock
    ) as m:
        m.return_value = {"convo_id": [{"sender": "bot", "message": "Hello"}]}

        response = await client.get(
            "/api/v1/admin/get_conversation/emp001/conv-001",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        assert "convo_id" in response.json()


@pytest.mark.asyncio
async def test_get_aggregate_feedback_success(client, admin_token):
    """GET /get_aggregate_feedback returns average scores."""
    with patch(
        "src.controllers.admin_controller.fetch_average_feedback_score",
        new_callable=AsyncMock,
    ) as m:
        m.return_value = [3.5, 4.0, 3.8, 4.2, 3.9]

        response = await client.get(
            "/api/v1/admin/get_aggregate_feedback",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        assert "Average score list" in response.json()
        assert response.json()["Average score list"] == [3.5, 4.0, 3.8, 4.2, 3.9]
