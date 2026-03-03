import logging
from typing import Any, Dict

from fastapi import HTTPException

from src.services.admin_services import (
    fetch_average_feedback_score,
    fetch_employee_conversation,
    fetch_employee_conversationFeedback_byId,
    fetch_employee_conversationSummary_byId,
    fetch_employee_data,
    get_all_employees,
    specific_conversation,
)

logger = logging.getLogger(__name__)


async def get_all_employees_controller() -> Dict[str, Any]:
    try:
        employees = await get_all_employees()
        return {"employees": employees}
    except Exception as error:
        logger.error("Error fetching employees: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def get_employee_detail(employee_id: str) -> Dict[str, Any]:
    try:
        employee = await fetch_employee_data(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Error fetching employee detail: %s", error)
        raise HTTPException(status_code=400, detail=str(error))


async def get_employee_conversation(employee_id: str) -> Dict[str, Any]:
    try:
        convo_ids = await fetch_employee_conversation(employee_id)
        valid_convos = []
        for cid in convo_ids:
            feedback_data = await fetch_employee_conversationFeedback_byId(employee_id, cid)
            if feedback_data != "-1" and feedback_data != -1:
                valid_convos.append(cid)
        return {"ConvoID": valid_convos}
    except Exception as error:
        logger.error("Error fetching conversations: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def get_convo(employee_id: str, convo_id: str) -> Dict[str, Any]:
    try:
        return await specific_conversation(employee_id, convo_id)
    except HTTPException:
        raise
    except Exception as error:
        logger.error("Error fetching conversation: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def get_employee_conversationFeedback_byId(
    emp_id: str, convo_id: str
) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationFeedback_byId(emp_id, convo_id)
        return {"Feedback": convo}
    except Exception as error:
        logger.error("Error fetching conversation feedback: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def get_employee_conversationSummary_byId(
    emp_id: str, convo_id: str
) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationSummary_byId(emp_id, convo_id)
        return {"Summary": convo}
    except Exception as error:
        logger.error("Error fetching conversation summary: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def get_aggregate_list() -> Any:
    try:
        score_list = await fetch_average_feedback_score()
        return {"Average score list": score_list}
    except Exception as error:
        logger.error("Error fetching aggregate feedback: %s", error)
        raise HTTPException(status_code=500, detail=str(error))
