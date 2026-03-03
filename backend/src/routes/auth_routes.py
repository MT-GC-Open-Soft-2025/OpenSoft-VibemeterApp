from typing import Any, Dict

from fastapi import APIRouter

from src.controllers.auth_controller import SignInRequest, signin_controller

auth_router = APIRouter()


@auth_router.post("/signin")
async def signin_route(payload: SignInRequest) -> Dict[str, Any]:
    return await signin_controller(payload)
