from fastapi import APIRouter, Depends, HTTPException,status, Query
from typing import Dict
from src.middlewares.authmiddleware import authenticate

from src.controllers.chat_controller import Chat_frontend, response_controller, getChat_controller
chat_router =APIRouter()

@chat_router.post("/send")
async def send_chat(payload: Chat_frontend, user:Dict[str,str]= Depends(authenticate)):

    response = await response_controller(payload,user) 
    return response 

@chat_router.get("/chat")
async def get_chat(conv_id: str = Query(..., description="Conversation ID to fetch the chat")):
    response = await getChat_controller(conv_id)
    return response