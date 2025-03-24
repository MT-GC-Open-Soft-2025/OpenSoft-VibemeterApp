from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Any, Dict
from src.controllers.admin_controller import (
    get_all_employees_controller,
    get_employee_detail,
    get_employee_conversation,
    get_convo,
    get_employee_conversationFeedback_byId,
    get_employee_conversationSummary_byId
)
from src.middlewares.authmiddleware import adminauthenticate
from src.models.chats import Message
#import list
from typing import List



security = HTTPBearer()
admin_router = APIRouter()

@admin_router.get("/test")
def test_route() -> Dict[str, Any]:
    return {"message": "Admin Route is Active"}

@admin_router.get("/get_details")
async def employee_data_route(admin:dict=Depends(adminauthenticate)) -> Dict[str, Any]:
    print("Hi1")
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    return await get_all_employees_controller()

@admin_router.get("/get_detail/{employee_id}")
async def employee_data_detail_route(employee_id:str, admin:dict = Depends(adminauthenticate)) -> Dict[str, Any]:
    print(employee_id)
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    if not employee_id:
        raise HTTPException(status_code=404, detail="Employee id not found")
    return (await get_employee_detail(employee_id))

@admin_router.get("/get_conversations/{employee_id}")
async def employee_convo_route(employee_id:str, admin:dict = Depends(adminauthenticate)) -> Dict[str, Any]:
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    return await get_employee_conversation(employee_id)

@admin_router.get("/get_conversation/{employee_id}/{convo_id}")
async def get_convo_route(employee_id:str, convo_id : str, admin:dict=Depends(adminauthenticate))->Dict[str,Any]:
    
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    return await get_convo(employee_id,convo_id)


@admin_router.get("/get_conversationFeedback/{emp_id}/{convo_id}")
async def employee_convoId_feedback_route(emp_id: str, convo_id: str, admin:dict=Depends(adminauthenticate)) -> Dict[str, Any]:
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    return await get_employee_conversationFeedback_byId(emp_id, convo_id)

@admin_router.get("/get_conversationSummary/{emp_id}/{convo_id}")
async def employee_convoId_summary_route(emp_id: str, convo_id: str,admin:dict=Depends(adminauthenticate)) -> Dict[str, Any]:
    if(not admin):
        print("Admin not found")
        return {"message":"Admin not found"}
    return await get_employee_conversationSummary_byId(emp_id, convo_id)


