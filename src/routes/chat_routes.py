from fastapi import APIRouter, Depends, HTTPException,status
from typing import Dict

from src.controllers.chat_controller import Chat_frontend
chat_router =APIRouter()

@chat_router.post("/send")
async def send_chat(paylaod: Chat_frontend, user:Dict[str,str]= Depends(authenticate)):

    response = await response_controller(payload,user) 
    return response 