from fastapi import APIRouter, Depends
from typing import Any, Dict
from src.controllers.user_controller import user_controller
from src.middlewares.authmiddleware import authenticate

user_router = APIRouter()

# ✅ Get User Details Route (Requires Bearer Token)
@user_router.get("/getUserDetails")
async def get_user_route(user: Dict[str, Any] = Depends(authenticate)):  # Use authenticate
    return await user_controller(user)


















# from fastapi import APIRouter, Depends
# from typing import Any, Dict

# from src.controllers.user_controller import user_controller

# user_router = APIRouter()

# # ✅ Get User Details Route (Requires Bearer Token)
# @user_router.get("/user")
# async def get_user_route(user_data: Dict[str, Any] = Depends(user_controller)):
#     return {"user": user_data}


