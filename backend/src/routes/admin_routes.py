from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from src.controllers.admin_controller import (
    get_aggregate_list,
    get_all_employees_controller,
    get_convo,
    get_employee_conversation,
    get_employee_conversationFeedback_byId,
    get_employee_conversationSummary_byId,
    get_employee_detail,
)
from src.middlewares.authmiddleware import adminauthenticate

admin_router = APIRouter()


@admin_router.get("/test")
def test_route() -> Dict[str, Any]:
    return {"message": "Admin Route is Active"}


@admin_router.get("/get_details")
async def employee_data_route(admin: dict = Depends(adminauthenticate)) -> Dict[str, Any]:
    return await get_all_employees_controller()


@admin_router.get("/get_detail/{employee_id}")
async def employee_data_detail_route(
    employee_id: str, admin: dict = Depends(adminauthenticate)
) -> Dict[str, Any]:
    if not employee_id:
        raise HTTPException(status_code=404, detail="Employee id not found")
    return await get_employee_detail(employee_id)


@admin_router.get("/get_conversations/{employee_id}")
async def employee_convo_route(
    employee_id: str, admin: dict = Depends(adminauthenticate)
) -> Dict[str, Any]:
    return await get_employee_conversation(employee_id)


@admin_router.get("/get_conversation/{employee_id}/{convo_id}")
async def get_convo_route(
    employee_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> Dict[str, Any]:
    return await get_convo(employee_id, convo_id)


@admin_router.get("/get_conversationFeedback/{emp_id}/{convo_id}")
async def employee_convoId_feedback_route(
    emp_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> Dict[str, Any]:
    return await get_employee_conversationFeedback_byId(emp_id, convo_id)


@admin_router.get("/get_conversationSummary/{emp_id}/{convo_id}")
async def employee_convoId_summary_route(
    emp_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> Dict[str, Any]:
    return await get_employee_conversationSummary_byId(emp_id, convo_id)


@admin_router.get("/get_aggregate_feedback")
async def get_aggregate_feedback(admin: dict = Depends(adminauthenticate)) -> Any:
    return await get_aggregate_list()
