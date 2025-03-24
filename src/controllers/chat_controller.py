from src.services.chat_service import send_message
from src.models.employee import Employee
from src.models.chats import Chat
from pydantic import BaseModel
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from src.services.chat_service import send_response


class Chat_frontend(BaseModel):
    convid: str
    message: str
    chatObj: any
    question: str


async def response_controller(payload,user) -> Dict[str, Any]:
   convid= payload.convid
   message= payload.message
   chatObj= payload.chatObj

   chat_record = await Chat.find(Chat.convid==convid).first_or_none()
   if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not retrive chat session"
        )
   
   response= await send_response(user,message,convid, chatObj)
   return response