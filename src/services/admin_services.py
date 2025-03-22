from fastapi import HTTPException
from typing import Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from src.models.employee import Employee

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def fetch_all_employees() -> List[Dict[str, Any]]:
    try:
        employees = await db["employees"].find().to_list(1000)
        for employee in employees:
            employee["_id"] = str(employee["_id"])
        return employees
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def fetch_employee_data(employee_id) -> Dict[str, Any]:
    try:
        user_record = await db["employees"].find_one({"emp_id" :employee_id})
        if not user_record:
            raise HTTPException(status_code=404, detail="Employee not found")
        user_record["_id"] = str(user_record["_id"])
        return user_record
    
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


async def fetch_employee_conversation(employee_id: str) -> List[str]:
    try:
        employee = await db["employees"].find_one({"emp_id": employee_id})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee.get("convo_id", [])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


async def specific_conversation(employee_id: str, convo_id: str) -> Dict[str, Any]:
    try:
        conversation = await db["chats"].find_one({"emp_id": employee_id, "convo_id": convo_id})

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        conversation["_id"] = str(conversation["_id"]) 
        return conversation

    except HTTPException as http_error:
        raise http_error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def fetch_employee_conversationFeedback_byId(emp_id: str, convo_id: str) -> Any:
    try:
        chat = await db["chats"].find_one({"emp_id": emp_id, "convo_id": convo_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat.get("feedback", None)  # Assuming "feedback" is the field you want
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
    

async def fetch_employee_conversationSummary_byId(emp_id: str, convo_id: str) -> Any:
    try:
        chat = await db["chats"].find_one({"emp_id": emp_id, "convo_id": convo_id})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat.get("summary", None)  # Assuming "feedback" is the field you want
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))