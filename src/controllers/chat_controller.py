from src.models.employee import Employee
from src.models.chats import Chat
from pydantic import BaseModel
from fastapi import HTTPException, status
from typing import Dict, Any

from src.services.chat_service import send_message, get_chat, initiate_chat_service,end_chat


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
    
    try:       

        if not convid or not message:
            raise HTTPException(
                status_code=404,
                detail="Could not get payload"
            )
        
        response = await send_message(user, message, convid)
        return response
        
    except Exception as error:
            raise HTTPException(status_code=400, detail=str(error))

async def end_chat_controller(convo_id: str, feedback: str) -> Dict[str, Any]:
    try:
        end_chat_data = await end_chat(convo_id, feedback)
        return end_chat_data
    except ValueError as e:
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error ending chat"
        )

async def getChat_controller(conv_id: str) -> Dict[str, Any]:

    response = await get_chat(conv_id)
    return response # return list of messages