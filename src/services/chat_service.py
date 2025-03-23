from typing import Dict, Any
from datetime import datetime

from fastapi import HTTPException, status

from src.models.employee import Employee
from src.models.chats import Chat, Message


async def initiate_chat_service(convo_id: str, emp_id: str) -> Dict[str, Any]:
    
    employee_doc = await Employee.find_one(Employee.emp_id == emp_id).first_or_none()
    if not employee_doc:       
        raise ValueError(f"Employee with ID '{emp_id}' not found.")

  
    emotion_score = employee_doc.emotion_score
    factors = employee_doc.factors_in_sorted_order or []

   
    if emotion_score < 5:
       
        topic = factors[0] if factors else "some topic"
        bot_message_text = f"Hello, we noticed you are upset about {topic}."
    else:
       
        bot_message_text = "Hello, what's up? Is there anything bothering you?"

 
    bot_message = Message(
        sender="bot",
        timestamp=datetime.now(),
        message=bot_message_text
    )

    new_chat_doc = Chat(
        convid=convo_id,
        empid=emp_id,
        # feedback=-1,
        # summary=None,
        messages=[bot_message]
    )

    inserted_chat = await new_chat_doc.insert()  
    return inserted_chat.model_dump()
