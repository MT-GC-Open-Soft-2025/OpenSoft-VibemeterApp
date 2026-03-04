from typing import Any

from fastapi import APIRouter, Header

from src.controllers.internal_controller import (
    session_ended_controller,
    session_started_controller,
    turn_completed_controller,
)

internal_router = APIRouter()


@internal_router.post("/agent-sync/session-started")
async def agent_sync_session_started(
    payload: dict[str, Any], x_agent_sync_secret: str | None = Header(default=None)
) -> dict[str, Any]:
    return await session_started_controller(payload, x_agent_sync_secret)


@internal_router.post("/agent-sync/turn-completed")
async def agent_sync_turn_completed(
    payload: dict[str, Any], x_agent_sync_secret: str | None = Header(default=None)
) -> dict[str, Any]:
    return await turn_completed_controller(payload, x_agent_sync_secret)


@internal_router.post("/agent-sync/session-ended")
async def agent_sync_session_ended(
    payload: dict[str, Any], x_agent_sync_secret: str | None = Header(default=None)
) -> dict[str, Any]:
    return await session_ended_controller(payload, x_agent_sync_secret)
