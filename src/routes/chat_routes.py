from fastapi import APIRouter, Depends, HTTPException,status
from typing import Dict, Any
from src.middlewares.authmiddleware import authenticate

from src.controllers.chat_controller import Chat_frontend, response_controller
chat_router =APIRouter()

@chat_router.post("/send")
async def send_chat(payload: Chat_frontend, user:Dict[str,Any]= Depends(authenticate)):

    response = await response_controller(payload,user) 
    return response 