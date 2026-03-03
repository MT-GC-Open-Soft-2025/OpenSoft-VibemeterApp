from typing import Any, Dict

from fastapi import HTTPException, status
from pydantic import BaseModel, Field

from src.services.auth_service import signin as signin_service


class SignInRequest(BaseModel):
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)


async def signin_controller(payload: SignInRequest) -> Dict[str, Any]:
    if not payload.username or not payload.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing username or password",
        )

    return await signin_service(payload.username, payload.password)
