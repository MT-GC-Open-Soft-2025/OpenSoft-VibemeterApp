import datetime
from typing import Any

from fastapi import HTTPException, status

from src.services.agent_sync_service import (
    mark_session_ended,
    mark_session_started,
    record_turn_completed,
    validate_agent_sync_secret,
)


async def session_started_controller(
    payload: dict[str, Any], sync_secret: str | None
) -> dict[str, Any]:
    validate_agent_sync_secret(sync_secret)
    return await mark_session_started(
        convid=payload["convo_id"],
        agent_session_id=payload["agent_session_id"],
        started_at=datetime.datetime.now(datetime.UTC),
    )


async def turn_completed_controller(
    payload: dict[str, Any], sync_secret: str | None
) -> dict[str, Any]:
    validate_agent_sync_secret(sync_secret)
    if not payload.get("convo_id") or payload.get("user_message") is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payload")
    return await record_turn_completed(
        convid=payload["convo_id"],
        agent_session_id=payload["agent_session_id"],
        user_message=payload["user_message"],
        bot_message=payload.get("bot_message", ""),
        occurred_at=datetime.datetime.now(datetime.UTC),
    )


async def session_ended_controller(
    payload: dict[str, Any], sync_secret: str | None
) -> dict[str, Any]:
    validate_agent_sync_secret(sync_secret)
    return await mark_session_ended(convid=payload["convo_id"])
