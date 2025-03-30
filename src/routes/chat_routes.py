from fastapi import APIRouter, Depends
from typing import Dict, Any, Any

from src.controllers.chat_controller import initiate_chat_controller,Chat_frontend,response_controller,end_chat_controller,feedback_controller, Feedback, add_feedback_controller

from src.middlewares.authmiddleware import authenticate

chat_router = APIRouter()


@chat_router.post("/initiate_chat/{convo_id}")
async def initiate_chat_route(convo_id: str, current_user: dict = Depends(authenticate)) -> Dict[str, Any]:
    print("current_user",current_user)   
    new_chat_data = await initiate_chat_controller(convo_id, current_user)

    return new_chat_data

@chat_router.post("/send")
async def send_chat(payload: Chat_frontend, user:Dict[str,Any]= Depends(authenticate)):

    response = await response_controller(payload,user) 
    return response 

@chat_router.get("/feedback")
async def feedback_route() -> Dict[str, Any]:
    feedback_questions = await feedback_controller()
    return feedback_questions

@chat_router.post("/end_chat/{convo_id}/{feedback}")
async def end_chat_route(convo_id: str, feedback:str,current_user: dict = Depends(authenticate)) -> Dict[str, Any]:
    print("current_user",current_user)   
    end_chat_data = await end_chat_controller(convo_id, feedback)

    return end_chat_data

@chat_router.post("/add_feedback")
async def add_feedback_route(payload :Dict[str,int]) -> Dict[str, Any]:
    print (payload, type(payload))
     
    feedback_data = await add_feedback_controller(payload)

    return feedback_data