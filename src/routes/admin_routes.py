from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Any, Dict
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId
from typing import List
import os

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI")
# DB_NAME = os.getenv("DB_NAME")

# security = HTTPBearer()
# client = AsyncIOMotorClient(MONGO_URI)
# db = client[DB_NAME]

admin_router = APIRouter()

@admin_router.get("/test")
def test_route()-> Dict[str, Any]:
    print(" Works!")
    return {"message": "Admin Route is Active"}
# async def test_route(token: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
#     return {"message": "Admin Route is Active"}

# @admin_router.get("/get_details")
# async def employeeData_route(token: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
#     try:
#         employees = await db["employees"].find().to_list(1000)
#         return {"employees": employees}
#     except Exception as error:
#         raise HTTPException(status_code=500, detail=str(error))
    
# @admin_router.get("/get_conversation/{item_id}")
# async def employeeConvo(item_id, token:HTTPAuthorizationCredentials=Depends(security))->Dict[str,Any]:
#     try:
#         employe = await db["employees"].find_one({"_id":ObjectId(item_id)})
#         if not employe:
#             raise HTTPException(status_code=404, detail="EMployee not found")
#         return {"ConvoID" : employe.get("convoID",[])}
#     except Exception as error: 
#         raise HTTPException(status_code=500,detail=str(error))    


