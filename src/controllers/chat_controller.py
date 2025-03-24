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


async def response_controller(payload,user) -> Dict[str, Any]:
   convid= payload.convid
   message= payload.message
   chatObj= payload.chatObj
    
try:
        chat_record = await Chat.find(Chat.convid == convid).first_or_none()

        if not chat_record:
            raise HTTPException(
                status_code=404,
                detail="Could not retrieve chat session"
            )
        
        response = await send_response(user, message, convid, chatObj)
        return response
        
except Exception as error:
            raise HTTPException(status_code=400, detail=str(error))
