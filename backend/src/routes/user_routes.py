from typing import Any, Dict

from fastapi import APIRouter, Depends

from src.controllers.user_controller import convoid_controller, user_controller
from src.middlewares.authmiddleware import authenticate

user_router = APIRouter()


@user_router.get("/getUserDetails")
async def get_user_route(user: Dict[str, Any] = Depends(authenticate)):
    return await user_controller(user)


@user_router.get("/getConvoids")
async def get_convoids_route(user: Dict[str, Any] = Depends(authenticate)):
    return await convoid_controller(user)
