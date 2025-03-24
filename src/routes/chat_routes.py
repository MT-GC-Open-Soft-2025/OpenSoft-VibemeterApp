
from fastapi import APIRouter, Depends, HTTPException,status, Query
from typing import Dict, Any
from src.middlewares.authmiddleware import authenticate
from src.controllers.chat_controller import Chat_frontend, response_controller, getChat_controller, initiate_chat_controller

chat_router = APIRouter()


@chat_router.post("/initiate_chat/{convo_id}")
async def initiate_chat_route(convo_id: str, current_user: dict = Depends(authenticate)) -> Dict[str, Any]:

    emp_id = current_user.get("emp_id")
    new_chat_data = await initiate_chat_controller(convo_id, emp_id)

    return new_chat_data

@chat_router.post("/send")
async def send_chat(payload: Chat_frontend, user:Dict[str,str]= Depends(authenticate)):

    response = await response_controller(payload,user) 
    return response 

@chat_router.get("/chat/{conv_id}")
async def get_chat(conv_id:str) -> Dict[str,Any]:
    response = await getChat_controller(conv_id)
    return response