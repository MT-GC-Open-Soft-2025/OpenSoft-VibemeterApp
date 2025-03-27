

from src.services.chat_service import send_message
from src.models.employee import Employee
from src.models.chats import Chat
from pydantic import BaseModel
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from src.services.chat_service import send_message
from src.services.chat_service import initiate_chat_service


class Chat_frontend(BaseModel):
    convid: str
    message: str
    


async def initiate_chat_controller(convo_id: str, user:Any) -> Dict[str, Any]:
    
    try:
        new_chat = await initiate_chat_service(convo_id, user)
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
    #chatObj= payload.chatObj
    
    try:
        #chat_record = await Chat.find(Chat.convid == convid).first_or_none()

        if not convid or not message:
            raise HTTPException(
                status_code=404,
                detail="Could not get payload"
            )
        
        response = await send_message(user, message, convid)
        return response
        
    except Exception as error:
            raise HTTPException(status_code=400, detail=str(error))
