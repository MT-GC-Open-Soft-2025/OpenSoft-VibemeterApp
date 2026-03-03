import logging
from typing import Any, Dict, List

from fastapi import HTTPException

from src.models.chats import Chat
from src.models.employee import Employee
from src.models.feedback_ratings import Feedback_ratings

logger = logging.getLogger(__name__)


async def get_all_employees() -> List[Dict[str, Any]]:
    try:
        return await Employee.find_all().to_list()
    except Exception as error:
        logger.error("Error fetching all employees: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def fetch_employee_data(employee_id: str) -> Dict[str, Any]:
    user_record = await Employee.find(Employee.emp_id == employee_id).first_or_none()
    if not user_record:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"user_record": user_record}


async def fetch_employee_conversation(employee_id: str) -> List[str]:
    try:
        chats = await Chat.find(Chat.empid == employee_id).to_list()
        if not chats:
            return []
        return [chat.convid for chat in chats]
    except Exception as e:
        logger.error("Error fetching conversations: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


async def specific_conversation(employee_id: str, convo_id: str) -> Dict[str, Any]:
    conversation = await Chat.find_one(Chat.convid == convo_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"convo_id": conversation.messages}


async def fetch_employee_conversationFeedback_byId(emp_id: str, convo_id: str) -> Any:
    chat = await Chat.find_one(Chat.convid == convo_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.feedback


async def fetch_employee_conversationSummary_byId(emp_id: str, convo_id: str) -> Any:
    chat = await Chat.find_one(Chat.convid == convo_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat.summary


async def fetch_average_feedback_score() -> Any:
    try:
        feedbacks = await Feedback_ratings.find_all().to_list()
        scores = [0.0] * 5
        for fb in feedbacks:
            scores[0] += fb.Q1
            scores[1] += fb.Q2
            scores[2] += fb.Q3
            scores[3] += fb.Q4
            scores[4] += fb.Q5

        if feedbacks:
            count = len(feedbacks)
            scores = [s / count for s in scores]

        return scores
    except Exception as error:
        logger.error("Error fetching average feedback: %s", error)
        raise HTTPException(status_code=500, detail=str(error))
