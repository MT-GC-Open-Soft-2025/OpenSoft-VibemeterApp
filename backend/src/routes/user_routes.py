from fastapi import APIRouter, Depends
from typing import Any, Dict
from src.controllers.user_controller import user_controller, convoid_controller
from src.middlewares.authmiddleware import authenticate

user_router = APIRouter()

@user_router.get("/getUserDetails")
async def get_user_route(user: Dict[str, Any] = Depends(authenticate)):  
    return await user_controller(user)

@user_router.get("/getConvoids")
async def get_convoids_route(user: Dict[str, Any] = Depends(authenticate)):
    return await convoid_controller(user)
