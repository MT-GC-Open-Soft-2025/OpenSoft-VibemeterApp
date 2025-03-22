from fastapi import HTTPException
from typing import Dict, Any
from src.services.admin_services import fetch_all_employees, fetch_employee_data, fetch_employee_conversation, fetch_employee_conversationFeedback_byId, fetch_employee_conversationSummary_byId,specific_conversation

async def get_all_employees() -> Dict[str, Any]:
    try:
        employees = await fetch_all_employees()
        return {"employees": employees}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def get_employee_detail(employee_id) -> Dict[str, Any]:
    try:
        employee = await fetch_employee_data(employee_id)
        if not employee :
            raise HTTPException(status_code=404, detail="Employee not found")
        return  employee
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))

async def get_employee_conversation(employee_id: str) -> Dict[str, Any]:
    try:
        convo_id = await fetch_employee_conversation(employee_id)
        return {"ConvoID": convo_id}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
async def get_convo(employee_id:str,convo_id:str)->Dict[str,Any]:
    try:
        conversation=await specific_conversation(employee_id,convo_id)
        return conversation
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
            



async def get_employee_conversationFeedback_byId(emp_id: str, convo_id:str) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationFeedback_byId(emp_id, convo_id)

        return {"Feedback of the particular particular ConvoId": convo}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


async def get_employee_conversationSummary_byId(emp_id: str, convo_id:str) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationSummary_byId(emp_id, convo_id)

        return {"Summary of the particular particular ConvoId": convo}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
