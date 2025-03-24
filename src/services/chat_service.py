from typing import Dict, Any
from datetime import datetime

from fastapi import HTTPException, status

from src.models.employee import Employee
from src.models.chats import Chat, Message
from src.services.ai_services import analyze_response, generate_response
from src.models.chats import Chat, Message
from fastapi import HTTPException, status, Query

counter=-1
async def send_response(user:any, que: str, msg:str, convid:str, chatObj):
    
    #Assume that previous chat history exists
    
        while (counter < len(user.factors_in_sorted_order)): 
        #Retrive Employee priority order list
          factor_in_sorted_order= user.factors_in_sorted_order
          sem_analyzer_response = await analyze_response(que, msg)
        
          if sem_analyzer_response:
            counter = counter+1
            return f"Are you upset about ${factor_in_sorted_order[counter]}"
          else:
            gen_ai_response= await generate_response(msg,chatObj)
            return gen_ai_response
          
async def get_chat(conv_id: str) -> Dict[str, Any]: # e.g. /chat?conv_id=123
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chat not found"
        )
    
    return {
        "chat": chat_record.messages,
    }
    




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
