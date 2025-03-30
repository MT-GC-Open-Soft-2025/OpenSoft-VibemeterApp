from src.services.ai_services import analyze_response, generate_response, summarize_text
from src.models.employee import Employee
from src.models.chats import Chat, Message
from fastapi import HTTPException, status, Query
from src.models.feedback_ratings import Feedback_ratings
import datetime
from typing import Dict, Any,List
import json
import os
from src.services.ai_services import initialize as initi

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


async def initiate_chat_service(convo_id: str, user: Any) -> Dict[str, Any]:
    try:
    
            emp_id = user['emp_id']   
        
            emotion_score = user['vibe_score']
            factors = user['factors_in_sorted_order']            
            factors = ', '.join(factors)
            prompt_sad = f"This is employee {emp_id}. He is a sad person with vibe score of {emotion_score}/5. He has factors in sorted order as: {factors}. The first factor is affecting him most maybe then next and so on. Start talking to him about his first problem. If at any point you feel he isnt interested to talk about it move to next topic. Start your response greeting him. Also remember you are a company councellor. So act like one formal yet friendly. Also remember the factors have been decided from user and company data. So employee doesnt know there is something like the sorted list and he shouldnt know. So move topics swiftly when needed.Start the convo right away. Your name is Vibey. start with hello employee. Dont give any here we go, this is as follows or anything"
            prompt_happy = f"This is employee {emp_id}. He is more or less happy person with vibe score of {emotion_score}/5. The factors affects his mood inversely as per data is {factors}. Start talking to him about his day. If you feel that his vibe seems a bit low, intelligently ask him about factors which have been mentioned. Start your response greeting him. Also remember you are a company councellor. So act like one formal yet friendly. Also remember the factors have been decided from user and company data. So employee doesnt know there is something like the sorted list and he shouldnt know. So move topics swiftly when needed. Start the convo right away. Your name is Vibey. start with hello employee. Dont give any here we go, this is as follows or anything"
            prompt_neutral = f"This is employee {emp_id}. He is a neutral person with vibe score of {emotion_score}/5. The factors affects his mood inversely as per data is {factors}. Start talking to him about his day. Try to figure out intelligently what is stopping him from being happy. Start your response greeting him. Also remember you are a company councellor. So act like one formal yet friendly. Also remember the factors have been decided from user and company data. So employee doesnt know there is something like the sorted list and he shouldnt know. So move topics swiftly when needed. Start the convo right away. Your name is Vibey. start with hello employee. Dont give any here we go, this is as follows or anything"
            chatObj = initi()
            if emotion_score >= 3.5:
                prompt= prompt_happy
            elif emotion_score >=2.5 :
                prompt= prompt_neutral
            else :
                prompt= prompt_sad
                       
            bot_message_text = generate_response(prompt,chatObj) 
            print(bot_message_text)
            
        

        
            bot_message = Message(
                sender="bot",
                timestamp=datetime.datetime.now(),
                message=bot_message_text
            )

            new_chat_doc = Chat(
                convid=convo_id,
                empid=emp_id,
                initial_prompt=prompt,
                feedback="-1",
                summary="",
                messages=[bot_message]
            )

        #create new chat in chats collection
            await new_chat_doc.insert()
            return {"response":bot_message_text}
    except Exception as e:
        raise ValueError(str(e))    



async def send_message(user:any, msg:str, convid:str)-> Dict[str, Any]:
    
    
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    chatObj1= initi()  
   
    
    dict_user= Message(sender="user", timestamp=datetime.datetime.now(), message=msg)  
    chat_record.messages.append(dict_user)
    prompt = f"This is an ongoing chat. Initial prompt : {chat_record.initial_prompt}The messages or converstaion till now is as follows: {chat_record.messages} Continue the chat."
    print(prompt)
    que=generate_response(prompt,chatObj1)    
    dict_bot= Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    chat_record.messages.append(dict_bot)
    await chat_record.save()
    return {"response":que}

    
async def get_feedback_questions():
    qs_file_path = os.path.join(os.path.dirname(__file__),"..","utils", "Feedback_Bank.json")
    try:
        qs=[]
        with open(qs_file_path, "r") as qs_file:
            qs = json.load(qs_file)
        return {"response":qs}
    except Exception as e:
        raise ValueError(str(e))
  
async def add_feedback(feedback:Dict[str,int]) -> Dict[str, Any]:
    try:
       feedback_record = Feedback_ratings(**feedback)
       await feedback_record.insert()
       return {"response": "Feedback added successfully"}
    except Exception as e:
        raise ValueError(str(e))    
    
    
async def end_chat(convid:str, feedback:str) -> Dict[str, Any]:
   try:
        chat_record = await Chat.find(Chat.convid == convid).first_or_none()
        if(chat_record.feedback != "-1"):
            raise ValueError("Feedback already given")
        chat_record.feedback = feedback
        chatObj3= initi()
        text=str(chat_record.messages) 
        print(text)              
        summary = summarize_text(text,chatObj3)
        chat_record.summary = summary
        
        await chat_record.save()
        return {"response": summary}
   except Exception as e:
        raise ValueError(str(e))