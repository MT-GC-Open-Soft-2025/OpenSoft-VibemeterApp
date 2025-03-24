from src.models.employee import Employee
from src.models.chats import Chat
from pydantic import BaseModel
from fastapi import HTTPException, status
from typing import Dict, Any

from src.services.chat_service import send_response, get_chat, initiate_chat_service


class Chat_frontend(BaseModel):
    convid: str
    message: str
    chatObj: any
    question: str


async def initiate_chat_controller(convo_id: str, emp_id: str) -> Dict[str, Any]:
    
    try:
        new_chat = await initiate_chat_service(convo_id, emp_id)
        return new_chat
    except ValueError as e:
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error initiating chat"
        )

async def response_controller(payload,user) -> Dict[str, Any]:
   convid= payload.convid
   message= payload.message
   chatObj= payload.chatObj
   que= payload.question

   chat_record = await Chat.find(Chat.convid==convid).first_or_none()
   if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not retrive chat session"
        )
   
   response= await send_response(user,que, message,convid, chatObj)
   return response

async def getChat_controller(conv_id: str) -> Dict[str, Any]:

    response = await get_chat(conv_id)
    return response # return list of messages