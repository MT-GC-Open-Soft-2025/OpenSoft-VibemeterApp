from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from src.controllers.chat_controller import (
    Chat_frontend,
    ChatInitiationPayload,
    add_feedback_controller,
    consume_stream_redis_controller,
    end_chat_controller,
    feedback_controller,
    get_chat_feedback_controller,
    getChat_controller,
    initiate_chat_controller,
    response_controller,
    response_stream_controller,
    start_stream_redis_controller,
)
from src.middlewares.authmiddleware import authenticate
from src.services.agent_registry_service import list_selectable_agents

chat_router = APIRouter()


@chat_router.get("/agents")
async def get_agents_route(current_user: dict = Depends(authenticate)) -> dict[str, Any]:
    return {"agents": await list_selectable_agents()}


@chat_router.post("/initiate_chat/{convo_id}")
async def initiate_chat_route(
    convo_id: str,
    payload: ChatInitiationPayload,
    current_user: dict = Depends(authenticate),
) -> dict[str, Any]:
    return await initiate_chat_controller(convo_id, payload, current_user)


@chat_router.post("/send")
async def send_chat(payload: Chat_frontend, user: dict[str, Any] = Depends(authenticate)):
    return await response_controller(payload, user)


@chat_router.post("/send_stream")
async def send_chat_stream(payload: Chat_frontend, user: dict[str, Any] = Depends(authenticate)):
    return StreamingResponse(
        response_stream_controller(payload, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@chat_router.post("/send_stream_redis")
async def send_chat_stream_redis_start(
    payload: Chat_frontend, user: dict[str, Any] = Depends(authenticate)
):
    """Start the Redis-backed AI producer as a background task and return immediately.

    After this returns 200, the client should open a separate authenticated GET
    connection to /chat/consume_stream/{convid} to receive the SSE stream.
    Splitting into two requests avoids the browser's behaviour of dropping the
    Authorization header when following a 303 redirect.

    Requires REDIS_URL to be configured; returns 503 otherwise.
    """
    await start_stream_redis_controller(payload, user)
    return {"status": "started", "convid": payload.convid}


@chat_router.get("/consume_stream/{conv_id}")
async def consume_chat_stream_redis(conv_id: str, user: dict[str, Any] = Depends(authenticate)):
    """Consume the Redis-backed AI response for *conv_id* as a Server-Sent Events stream.

    Connect here immediately after POST /send_stream_redis returns.
    Reads from entry id="0" so all chunks are delivered regardless of when
    the client connects relative to the producer.

    SSE format is identical to /send_stream so the frontend only needs to
    change the URL and split the request into two calls.
    """
    return StreamingResponse(
        consume_stream_redis_controller(conv_id, user),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@chat_router.get("/chat/{conv_id}")
async def get_chat(conv_id: str, current_user: dict = Depends(authenticate)) -> dict[str, Any]:
    return await getChat_controller(conv_id, current_user)


@chat_router.get("/chat_feedback/{conv_id}")
async def get_chat_feedback(
    conv_id: str, current_user: dict = Depends(authenticate)
) -> dict[str, Any]:
    return await get_chat_feedback_controller(conv_id, current_user)


@chat_router.get("/feedback")
async def feedback_route() -> dict[str, Any]:
    return await feedback_controller()


@chat_router.post("/end_chat/{convo_id}")
async def end_chat_route(
    convo_id: str,
    payload: dict[str, Any],
    current_user: dict = Depends(authenticate),
) -> dict[str, Any]:
    feedback = payload.get("feedback", "")
    return await end_chat_controller(convo_id, feedback, current_user)


@chat_router.post("/add_feedback")
async def add_feedback_route(
    payload: dict[str, int], current_user: dict = Depends(authenticate)
) -> dict[str, Any]:
    return await add_feedback_controller(payload, current_user)
