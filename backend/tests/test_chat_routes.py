"""Tests for chat API routes."""

from unittest.mock import AsyncMock, patch

import pytest


@pytest.mark.asyncio
async def test_initiate_chat_success(client, user_token):
    """POST /initiate_chat/{convo_id} returns bot response."""
    with patch(
        "src.controllers.chat_controller.initiate_chat_service", new_callable=AsyncMock
    ) as m:
        m.return_value = {"response": "Hello! How can I help you today?"}

        response = await client.post(
            "/api/v1/chat/initiate_chat/conv-001",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert "response" in response.json()
        assert "Hello" in response.json()["response"]


@pytest.mark.asyncio
async def test_initiate_chat_unauthorized(client):
    """POST /initiate_chat without token returns 401."""
    response = await client.post("/api/v1/chat/initiate_chat/conv-001")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_send_message_success(client, user_token):
    """POST /send returns bot response."""
    with patch(
        "src.controllers.chat_controller.send_message", new_callable=AsyncMock
    ) as m:
        m.return_value = {"response": "I understand. Let me help."}

        response = await client.post(
            "/api/v1/chat/send",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"convid": "conv-001", "message": "I need help"},
        )

        assert response.status_code == 200
        assert response.json()["response"] == "I understand. Let me help."


@pytest.mark.asyncio
async def test_send_message_missing_payload(client, user_token):
    """POST /send with empty message returns 422."""
    response = await client.post(
        "/api/v1/chat/send",
        headers={"Authorization": f"Bearer {user_token}"},
        json={"convid": "conv-001", "message": ""},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_chat_success(client, user_token):
    """GET /chat/{conv_id} returns chat messages."""
    with patch(
        "src.controllers.chat_controller.get_chat", new_callable=AsyncMock
    ) as m:
        m.return_value = {
            "chat": [
                {"sender": "bot", "message": "Hello", "timestamp": "2024-01-01T00:00:00"},
            ]
        }

        response = await client.get(
            "/api/v1/chat/chat/conv-001",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert "chat" in response.json()


@pytest.mark.asyncio
async def test_get_chat_feedback_success(client, user_token):
    """GET /chat_feedback/{conv_id} returns feedback."""
    with patch(
        "src.controllers.chat_controller.get_chat_feedback", new_callable=AsyncMock
    ) as m:
        m.return_value = {"feedback": "Great session!"}

        response = await client.get(
            "/api/v1/chat/chat_feedback/conv-001",
            headers={"Authorization": f"Bearer {user_token}"},
        )

        assert response.status_code == 200
        assert response.json()["feedback"] == "Great session!"


@pytest.mark.asyncio
async def test_feedback_route_no_auth(client):
    """GET /feedback does not require auth and returns questions."""
    response = await client.get("/api/v1/chat/feedback")
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert isinstance(data["response"], list)


@pytest.mark.asyncio
async def test_end_chat_success(client, user_token):
    """POST /end_chat/{convo_id} returns summary."""
    with patch(
        "src.controllers.chat_controller.end_chat", new_callable=AsyncMock
    ) as m:
        m.return_value = {"response": "Summary of the conversation."}

        response = await client.post(
            "/api/v1/chat/end_chat/conv-001",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"feedback": "Very helpful"},
        )

        assert response.status_code == 200
        assert "response" in response.json()


@pytest.mark.asyncio
async def test_add_feedback_success(client, user_token):
    """POST /add_feedback adds feedback."""
    with patch(
        "src.controllers.chat_controller.add_feedback", new_callable=AsyncMock
    ) as m:
        m.return_value = {"response": "Feedback added successfully"}

        response = await client.post(
            "/api/v1/chat/add_feedback",
            headers={"Authorization": f"Bearer {user_token}"},
            json={"Q1": 4, "Q2": 5, "Q3": 3, "Q4": 4, "Q5": 5},
        )

        assert response.status_code == 200
        assert "Feedback added successfully" in response.json()["response"]
