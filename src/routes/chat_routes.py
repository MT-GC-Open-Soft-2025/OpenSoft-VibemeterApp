from fastapi import APIRouter, Depends
from typing import Dict, Any

from controllers.chat_controller import initiate_chat_controller

from src.middlewares.authmiddleware import authenticate

chat_router = APIRouter()


@chat_router.post("/initiate_chat/{convo_id}")
async def initiate_chat_route(convo_id: str, current_user: dict = Depends(authenticate)) -> Dict[str, Any]:

    emp_id = current_user.get("emp_id")
    new_chat_data = await initiate_chat_controller(convo_id, emp_id)

    return new_chat_data
