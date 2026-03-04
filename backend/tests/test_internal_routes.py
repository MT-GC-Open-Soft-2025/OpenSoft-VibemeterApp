import pytest


@pytest.mark.asyncio
async def test_internal_sync_rejects_invalid_secret(client):
    response = await client.post(
        "/api/v1/internal/agent-sync/turn-completed",
        json={
            "convo_id": "conv-001",
            "agent_session_id": "session-001",
            "user_message": "hello",
            "bot_message": "hi",
        },
        headers={"X-Agent-Sync-Secret": "wrong-secret"},
    )
    assert response.status_code == 401
