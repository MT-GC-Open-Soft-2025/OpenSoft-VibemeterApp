import datetime
from typing import Any

from fastapi import HTTPException, status

from src.config import get_settings
from src.models.chats import Chat, Message


def validate_agent_sync_secret(secret: str | None) -> None:
    settings = get_settings()
    if not secret or secret != settings.agent_internal_sync_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid sync secret")


async def mark_session_started(
    *,
    convid: str,
    agent_session_id: str,
    started_at: datetime.datetime | None = None,
) -> dict[str, Any]:
    chat = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.agent_session_id = agent_session_id
    chat.agent_session_started_at = started_at or datetime.datetime.utcnow()
    await chat.save()
    return {"status": "ok"}


async def record_turn_completed(
    *,
    convid: str,
    agent_session_id: str,
    user_message: str,
    bot_message: str,
    occurred_at: datetime.datetime | None = None,
) -> dict[str, Any]:
    chat = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    message_time = occurred_at or datetime.datetime.utcnow()
    chat.agent_session_id = agent_session_id
    chat.messages.append(Message(sender="user", timestamp=message_time, message=user_message))
    chat.messages.append(Message(sender="bot", timestamp=message_time, message=bot_message))
    await chat.save()
    return {"status": "ok"}


async def mark_session_ended(*, convid: str) -> dict[str, Any]:
    chat = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"status": "ok"}
