from fastapi import HTTPException
from typing import Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from src.models.employee import Employee
from src.models.chats import Chat
from src.models.feedback_ratings import Feedback_ratings

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

async def get_all_employees() -> List[Dict[str, Any]]:
    try:
        employees = await Employee.find_all().to_list()  
        print("employees",employees)       
        return employees    
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def fetch_employee_data(employee_id) -> Dict[str, Any]:
    try:
        user_record = await Employee.find(Employee.emp_id==employee_id).first_or_none()
        print("user",user_record)
        if not user_record:
            raise HTTPException(status_code=404, detail="Employee not found")        
        print("user_record",user_record)
        if user_record:               
            return {
                "user_record":user_record
            }
    
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


async def fetch_employee_conversation(employee_id: str) -> List[str]:
    try:        
        chats = await Chat.find(Chat.empid == employee_id).to_list()
        if not chats:
            return []
        
        convo_ids = [chat.convid for chat in chats]
        return convo_ids
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def specific_conversation(employee_id: str, convo_id: str) -> Dict[str, Any]:
    try:
        conversation = await Chat.find_one(Chat.convid == convo_id)
        print("conversation",conversation)

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        messages= conversation.messages
        return {
            "convo_id": messages
        }       

    except HTTPException as http_error:
        raise http_error
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

async def fetch_employee_conversationFeedback_byId(emp_id: str, convo_id: str) -> Any:
    try:
        print(convo_id)
        chat = await Chat.find_one(Chat.convid==convo_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat.feedback
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
    

async def fetch_employee_conversationSummary_byId(emp_id: str, convo_id: str) -> Any:
    try:
        chat = await Chat.find_one(Chat.convid==convo_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return chat.summary
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
    
async def fetch_average_feedback_score() -> Any:
    try:
        feedbacks = await Feedback_ratings.find_all().to_list()
        scores = [0 for _ in range(5)] # initially score is zero for each of the 5 questions
        for feedback in feedbacks:
            scores[0] = scores[0] + feedback.Q1
            scores[1] = scores[1] + feedback.Q2
            scores[2] = scores[2] + feedback.Q3
            scores[3] = scores[3] + feedback.Q4
            scores[4] = scores[4] + feedback.Q5

        for score in scores:
            score = score/len(feedbacks) # find average
        
        return scores # return a list with average scores for each question
    
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))