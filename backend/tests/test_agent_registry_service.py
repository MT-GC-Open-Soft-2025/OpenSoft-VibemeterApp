import datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from src.services.agent_registry_service import create_agent, get_agent_location, update_agent


@pytest.mark.asyncio
async def test_create_agent_writes_created_event():
    with patch(
        "src.services.agent_registry_service.check_agent_health", new_callable=AsyncMock
    ) as health:
        with patch("src.services.agent_registry_service.Agent") as agent_cls:
            with patch(
                "src.services.agent_registry_service._write_event", new_callable=AsyncMock
            ) as write_event:
                health.return_value = "healthy"
                agent_instance = agent_cls.return_value
                agent_instance.insert = AsyncMock()
                payload = {
                    "slug": "anchor",
                    "display_name": "Anchor",
                    "description": "desc",
                    "persona_key": "anchor",
                    "greeting_style": "calm",
                    "avatar_key": "anchor",
                    "theme_key": "anchor",
                    "base_url": "http://localhost:8101",
                    "public_base_url": "http://localhost:8101",
                    "status": "active",
                }

                await create_agent(payload, changed_by="admin001")

                agent_instance.insert.assert_called_once()
                write_event.assert_called_once()


@pytest.mark.asyncio
async def test_get_agent_location_rejects_inactive():
    inactive_agent = type("Agent", (), {"status": "inactive"})()
    with patch(
        "src.services.agent_registry_service.get_agent_or_404", new_callable=AsyncMock
    ) as get_agent:
        get_agent.return_value = inactive_agent
        with pytest.raises(HTTPException) as exc:
            await get_agent_location("agent-001")
        assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_update_agent_location_writes_location_event():
    agent = type(
        "Agent",
        (),
        {
            "agent_id": "agent-001",
            "display_name": "Anchor",
            "description": "desc",
            "persona_key": "anchor",
            "greeting_style": "calm",
            "avatar_key": "anchor",
            "theme_key": "anchor",
            "slug": "anchor",
            "base_url": "http://localhost:8101",
            "public_base_url": "http://localhost:8101",
            "status": "active",
            "health_status": "healthy",
            "created_at": datetime.datetime.utcnow(),
            "save": AsyncMock(),
        },
    )()
    with patch(
        "src.services.agent_registry_service.get_agent_or_404", new_callable=AsyncMock
    ) as get_agent:
        with patch(
            "src.services.agent_registry_service.check_agent_health", new_callable=AsyncMock
        ) as health:
            with patch(
                "src.services.agent_registry_service._write_event", new_callable=AsyncMock
            ) as write_event:
                get_agent.return_value = agent
                health.return_value = "healthy"
                result = await update_agent(
                    "agent-001",
                    {
                        "base_url": "http://localhost:9101",
                        "public_base_url": "http://localhost:9101",
                    },
                    changed_by="admin001",
                )
                assert result["base_url"] == "http://localhost:9101"
                write_event.assert_called_once()
