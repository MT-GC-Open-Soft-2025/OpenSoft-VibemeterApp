
from fastapi import HTTPException, status
from typing import Dict, Any
from pydantic import BaseModel


from src.services.auth_service import signin as signin_service

class SignInRequest(BaseModel):
     username: str

async def signin_controller(payload: SignInRequest) -> Dict[str, Any]:
    
    if not payload.username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username"
        )

   
    result = await signin_service(payload.username)
    return result
