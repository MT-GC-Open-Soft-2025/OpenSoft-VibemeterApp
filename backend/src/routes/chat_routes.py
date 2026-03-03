from typing import Any

from fastapi import APIRouter, Depends

from src.controllers.chat_controller import (
    Chat_frontend,
    add_feedback_controller,
    end_chat_controller,
    feedback_controller,
    get_chat_feedback_controller,
    getChat_controller,
    initiate_chat_controller,
    response_controller,
)
from src.middlewares.authmiddleware import authenticate

chat_router = APIRouter()


@chat_router.post("/initiate_chat/{convo_id}")
async def initiate_chat_route(
    convo_id: str, current_user: dict = Depends(authenticate)
) -> dict[str, Any]:
    return await initiate_chat_controller(convo_id, current_user)


@chat_router.post("/send")
async def send_chat(
    payload: Chat_frontend, user: dict[str, Any] = Depends(authenticate)
):
    return await response_controller(payload, user)


@chat_router.get("/chat/{conv_id}")
async def get_chat(
    conv_id: str, current_user: dict = Depends(authenticate)
) -> dict[str, Any]:
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
