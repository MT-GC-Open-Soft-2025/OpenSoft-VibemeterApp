
from typing import Dict, Any
from fastapi import HTTPException, status


from src.services.chat_service import initiate_chat_service

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
