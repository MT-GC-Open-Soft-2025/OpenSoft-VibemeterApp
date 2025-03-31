from src.services.ai_services import analyze_response, generate_response, summarize_text
from src.models.employee import Employee
from src.models.chats import Chat, Message
from src.models.feedback_ratings import Feedback_ratings
import datetime
from typing import Dict, Any,List
import json
import os
from src.services.ai_services import initialize as initi

async def initiate_chat_service(convo_id: str, user: Any) -> Dict[str, Any]:
    try:
    
            emp_id = user['emp_id']   
        
            emotion_score = user['vibe_score']
            factors = user['factors_in_sorted_order'] 
            total_work_hours = user['total_work_hours']
            leave_days = user['leave_days']
            types_of_leaves = user['types_of_leave']
            feedback = user['feedback']
            weighted_performance = user['weighted_performance']
            reward_points = user['reward_points']
            award_list = user['award_list']
                       
            factors = ', '.join(factors)
            
            prompt_sad = f"""This is employee {emp_id}. He is a sad person with vibe score of {emotion_score}/5. He has factors in sorted order as: {factors}. The first factor is affecting him most maybe then next and so on.           
            Start talking to him about his first problem. If at any point you feel he isnt interested to talk about it move to next topic. 
            Details of user are as follows: Total work hours: {total_work_hours}, Leave days: {leave_days}, Types of leaves: {types_of_leaves}, Feedback: {feedback}, Weighted performance: {weighted_performance}, Reward points: {reward_points}, Award list: {award_list}.
            If you talk about leaves, use leaves data for more precise conversation. Avg leave days is 4.74. Ask qs regarding any sharp changes you observe like excess in any particular leave data or smthg like that then ask why so excess if there is any issue.If low ask why not good leaves. If noting like that, ask genearlly whether he has problems to apply for leaves or whether not getting approved etc etc. Be very formal.
            If you talk about rewards, use rewards data for more precise conversation. Ask qs regarding if you think he is not satified with rewards or if he is not getting rewards for his work etc etc. Praise him if he has any rewards and praise the type on which he got reward. Be very formal. 
            If you talk about performance, use performance data for more precise conversation. Ask qs regarding if he thinks he is not getting what he deserves or if he thinks he is getting more than what he deserves or not getting promoted etc etc. Be very formal.
            If you talk about activity, use work hours data for more precise conversation. Avg value is 8.6. Ask qs regarding sharp fluctuations.If ok, ask how he feels. Be very formal.
            If he is allright, u can ask about onbarding feedback using feedback data, whether he was happy with comapny policies and all. Be very formal.
            Also remember you are a company councellor.
            So act like one formal yet friendly. Also remember the factors have been decided from user and company data. 
            So employee doesnt know there is something like the sorted list and he shouldnt know. So move topics swiftly when needed.
            When you talk about a particular topic dont ask all suggested qs or flood him with his user data at once. He shouldnt know u know the data. Use data only for your reference. Ask qs sensing his emotion. First ask if that factor is affecting him, based on his responses frame next qs.
            Try helping him out as much as possible.
            Again: User doesnt know u have his data, so do not mention any user data which is fed to u. Just use it for your own refernce.
            Start the convo right away. Start with the topics as it is in factors array. The first factor is affecting him most maybe then next and so on. As I said move swiftly when u feel he is disinteretsed. Your name is Vibey. start with hello employee. Dont give any here we go, this is as follows or anything
            """
            
            
            
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