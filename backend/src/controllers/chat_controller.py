import logging
from typing import Any

from fastapi import HTTPException, status
from pydantic import BaseModel, Field

from src.models.redis_client import get_redis
from src.services.chat_service import (
    add_feedback,
    end_chat,
    get_chat,
    get_chat_feedback,
    get_feedback_questions,
    initiate_chat_service,
    send_message,
    send_message_stream,
    send_message_stream_redis,
)
from src.services.redis_stream_service import consume_stream_sse

logger = logging.getLogger(__name__)


class Chat_frontend(BaseModel):
    convid: str
    message: str = Field(..., min_length=1, max_length=5000)


class Feedback(BaseModel):
    feedback: dict[str, int]


async def initiate_chat_controller(convo_id: str, user: Any) -> dict[str, Any]:
    try:
        return await initiate_chat_service(convo_id, user)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("Error initiating chat: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error initiating chat",
        )


async def response_controller(payload: Chat_frontend, user: Any) -> dict[str, Any]:
    if not payload.convid or not payload.message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payload")

    try:
        return await send_message(user, payload.message, payload.convid)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Error sending message: %s", error)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


async def response_stream_controller(payload: Chat_frontend, user: Any):
    """StreamingResponse generator. Yields SSE chunks."""
    if not payload.convid or not payload.message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payload")

    try:
        async for chunk in send_message_stream(user, payload.message, payload.convid):
            yield chunk
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Error streaming message: %s", error)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error))


async def response_stream_redis_controller(payload: Chat_frontend, user: Any):
    """StreamingResponse generator backed by Redis Streams.

    Launches the AI producer as a background task (decoupled from the HTTP
    connection), then consumes the Redis Stream and forwards SSE chunks.
    Returns 503 if Redis is not configured.
    """
    if not payload.convid or not payload.message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payload")

    redis = get_redis()
    if redis is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis is not configured. Set REDIS_URL to use this endpoint.",
        )

    try:
        stream_key = await send_message_stream_redis(user, payload.message, payload.convid)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Error starting Redis stream: %s", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))

    try:
        async for chunk in consume_stream_sse(stream_key):
            yield chunk
    except Exception as error:
        logger.error("Error consuming Redis stream: %s", error)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(error))


async def feedback_controller() -> dict[str, Any]:
    try:
        return await get_feedback_questions()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("Error getting feedback questions: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting feedback questions",
        )


async def add_feedback_controller(feedback: dict[str, int], user: Any) -> dict[str, Any]:
    try:
        emp_id = user.get("emp_id") if user else None
        return await add_feedback(feedback, emp_id=emp_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("Error adding feedback: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error adding feedback",
        )


async def end_chat_controller(convo_id: str, feedback: str, user: Any) -> dict[str, Any]:
    try:
        emp_id = user.get("emp_id")
        return await end_chat(convo_id, feedback, emp_id)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error("Error ending chat: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error ending chat",
        )


async def getChat_controller(conv_id: str, user: Any) -> dict[str, Any]:
    try:
        emp_id = user.get("emp_id")
        return await get_chat(conv_id, emp_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting chat: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting chat",
        )


async def get_chat_feedback_controller(conv_id: str, user: Any) -> dict[str, Any]:
    try:
        emp_id = user.get("emp_id")
        return await get_chat_feedback(conv_id, emp_id)
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
