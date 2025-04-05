from fastapi import HTTPException
from typing import Dict, Any
from src.services.admin_services import get_all_employees, fetch_employee_data, fetch_employee_conversation, fetch_employee_conversationFeedback_byId, fetch_employee_conversationSummary_byId,specific_conversation,fetch_average_feedback_score

async def get_all_employees_controller() -> Dict[str, Any]:
    try:
        print("HI2")
        employees = await get_all_employees()
        return {"employees": employees}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def get_employee_detail(employee_id) -> Dict[str, Any]:
    try:
        print("employee_id",employee_id)
        employee = await fetch_employee_data(employee_id)
        if not employee :
            raise HTTPException(status_code=404, detail="Employee not found")
        return  employee
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))

async def get_employee_conversation(employee_id: str) -> Dict[str, Any]:
    try:
        convo_id = await fetch_employee_conversation(employee_id)
        valid_convos = []
        print("convo_id",convo_id)
        for convo_id in convo_id:
            feedback_data = await fetch_employee_conversationFeedback_byId(employee_id, convo_id)
            feedback = feedback_data
            if feedback != "-1" and feedback != -1:
                valid_convos.append(convo_id)
        return {"ConvoID": valid_convos}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
async def get_convo(employee_id:str,convo_id:str)->Dict[str,Any]:
    try:
        conversation=await specific_conversation(employee_id,convo_id)
        return conversation
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
async def get_aggregate_list() -> Any:
    try:
        score_list = await fetch_average_feedback_score()
        return {"Average score list": score_list}
    
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))    
            



async def get_employee_conversationFeedback_byId(emp_id: str, convo_id:str) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationFeedback_byId(emp_id, convo_id)

        return {"Feedback ": convo}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


async def get_employee_conversationSummary_byId(emp_id: str, convo_id:str) -> Dict[str, Any]:
    try:
        convo = await fetch_employee_conversationSummary_byId(emp_id, convo_id)

        return {"Summary ": convo}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    

async def get_aggregate_list() -> Any:
    try:
        score_list = await fetch_average_feedback_score()
        return {"Average score list": score_list}
    
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
