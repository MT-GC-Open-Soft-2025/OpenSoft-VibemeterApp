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

async def fetch_employee_data(employee_id: str) -> Dict[str, Any]:
    try:
        user_record = await Employee.find(Employee.emp_id == employee_id).first_or_none()
       
        if not user_record:
            raise HTTPException(status_code=404, detail="Employee not found")
        # user_record["_id"] = str(user_record["_id"])
        return user_record
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def fetch_employee_conversation(item_id: str) -> List[str]:
    try:
        employee = await db["employees"].find_one({"_id": ObjectId(item_id)})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return employee.get("convoID", [])
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
