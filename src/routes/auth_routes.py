from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any, Dict


from src.controllers.auth_controller import signin_controller,SignInRequest

auth_router = APIRouter()

@auth_router.post("/signin")
async def signin_route(payload: SignInRequest) -> Dict[str, Any]:
    
    response = await signin_controller(payload)
    return response