from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from src.controllers.admin_controller import (
    create_agent_controller,
    get_agent_history_controller,
    get_agents_controller,
    get_aggregate_list,
    get_all_employees_controller,
    get_convo,
    get_employee_conversation,
    get_employee_conversationFeedback_byId,
    get_employee_conversationSummary_byId,
    get_employee_detail,
    get_runtime_metrics_controller,
    run_agent_healthcheck_controller,
    update_agent_controller,
)
from src.middlewares.authmiddleware import adminauthenticate

admin_router = APIRouter()


@admin_router.get("/test")
def test_route() -> dict[str, Any]:
    return {"message": "Admin Route is Active"}


@admin_router.get("/get_details")
async def employee_data_route(admin: dict = Depends(adminauthenticate)) -> dict[str, Any]:
    return await get_all_employees_controller()


@admin_router.get("/get_detail/{employee_id}")
async def employee_data_detail_route(
    employee_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    if not employee_id:
        raise HTTPException(status_code=404, detail="Employee id not found")
    return await get_employee_detail(employee_id)


@admin_router.get("/get_conversations/{employee_id}")
async def employee_convo_route(
    employee_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await get_employee_conversation(employee_id)


@admin_router.get("/get_conversation/{employee_id}/{convo_id}")
async def get_convo_route(
    employee_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await get_convo(employee_id, convo_id)


@admin_router.get("/get_conversationFeedback/{emp_id}/{convo_id}")
async def employee_convoId_feedback_route(
    emp_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await get_employee_conversationFeedback_byId(emp_id, convo_id)


@admin_router.get("/get_conversationSummary/{emp_id}/{convo_id}")
async def employee_convoId_summary_route(
    emp_id: str, convo_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await get_employee_conversationSummary_byId(emp_id, convo_id)


@admin_router.get("/get_aggregate_feedback")
async def get_aggregate_feedback(admin: dict = Depends(adminauthenticate)) -> Any:
    return await get_aggregate_list()


@admin_router.get("/agents")
async def get_agents(admin: dict = Depends(adminauthenticate)) -> dict[str, Any]:
    return await get_agents_controller()


@admin_router.post("/agents")
async def create_agent_route(
    payload: dict[str, Any], admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await create_agent_controller(payload, admin)


@admin_router.patch("/agents/{agent_id}")
async def update_agent_route(
    agent_id: str, payload: dict[str, Any], admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await update_agent_controller(agent_id, payload, admin)


@admin_router.get("/agents/{agent_id}/history")
async def get_agent_history_route(
    agent_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await get_agent_history_controller(agent_id)


@admin_router.post("/agents/{agent_id}/healthcheck")
async def run_agent_healthcheck_route(
    agent_id: str, admin: dict = Depends(adminauthenticate)
) -> dict[str, Any]:
    return await run_agent_healthcheck_controller(agent_id)


@admin_router.get("/runtime-metrics")
async def get_runtime_metrics_route(admin: dict = Depends(adminauthenticate)) -> dict[str, Any]:
    return await get_runtime_metrics_controller()
