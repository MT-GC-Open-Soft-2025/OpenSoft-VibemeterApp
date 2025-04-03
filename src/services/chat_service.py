from src.services.ai_services import generate_response, summarize_text
from src.models.employee import Employee
from src.models.chats import Chat, Message
from fastapi import HTTPException, status, Query
from src.models.feedback_ratings import Feedback_ratings
import datetime
from typing import Dict, Any, List
import json
import os
from src.services.ai_services import initialize as initi


async def initiate_chat_service(convo_id: str, user: Any) -> Dict[str, Any]:
    try:

        emp_id = user["emp_id"]

        emotion_score = user["vibe_score"]
        factors = user["factors_in_sorted_order"]
        total_work_hours = user["total_work_hours"]
        leave_days = user["leave_days"]
        types_of_leaves = user["types_of_leave"]
        feedback = user["feedback"]
        weighted_performance = user["weighted_performance"]
        reward_points = user["reward_points"]
        award_list = user["award_list"]

        factors = ", ".join(factors)

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
            Each message should not be more than 100 words if not specified by user
            """

        prompt_happy = (
            prompt_happy
        ) = f"""This is employee {emp_id}. He is more or less a happy person with vibe score of {emotion_score}/5. He has factors affecting his mood in inverse order of impact as: {factors}. The first factor may be least impactful, and the last one possibly the most.          
            Start the conversation by greeting him and asking about his day in a friendly yet formal tone. Do not bring up any specific topics or concerns unless you feel that his vibe seems low or something is bothering him during the conversation. If he seems fine, keep the interaction light and general.
            If, during the conversation, you sense a drop in his mood or any sign of discomfort, begin discussing the impactful factors, starting from the end of the list (most impactful) and going backward. Shift topics swiftly if he seems uninterested or uncomfortable. 
            Details of user are as follows: Total work hours: {total_work_hours}, Leave days: {leave_days}, Types of leaves: {types_of_leaves}, Feedback: {feedback}, Weighted performance: {weighted_performance}, Reward points: {reward_points}, Award list: {award_list}.
            If you talk about leaves, use the leave data to subtly guide the conversation. Avg leave days is 4.74. If his leaves are unusually high, gently ask if there’s a reason or if everything is alright. If they are unusually low, inquire if he's having trouble applying for or getting leaves approved. If the data seems normal, still ask if he feels comfortable taking leaves when needed. Be formal and thoughtful.
            If you talk about rewards, appreciate his efforts. Praise any rewards he has received, especially the type. If rewards are low, check respectfully whether he feels his efforts are being recognized. Keep it professional and warm.
            If you talk about performance, refer to performance data quietly. Ask if he feels fairly evaluated or if there's something that might be bothering him. Do not state data directly. Be supportive and encouraging.
            If you talk about activity, use work hours only as internal reference. Avg is 8.6. Ask how his workload has been or how he’s managing time only if you sense imbalance or tiredness. Keep tone formal and considerate.
            If everything seems fine, and the employee seems cheerful, you may casually ask about his onboarding feedback to understand how welcome he felt and how policies have worked for him.
            Again: You are a company counselor — act formally but friendly. Use empathy and listen actively. You have access to the employee's data and factor rankings, but **the employee does not know that**, and **you must never reveal or mention that you know this information**.
            So use data only for guiding the conversation privately. Move across topics naturally and respectfully.
            Do not bring up any potentially sensitive or specific topic unless the employee’s vibe indicates he might need support.
            Each message must be under 100 words unless the user asks otherwise.
            Your name is Vibey. Start with “Hello employee,” and proceed naturally — no preambles like 'here we go' or 'this is as follows'.
            """

        prompt_neutral = (
            prompt_neutral
        ) = f"""This is employee {emp_id}. He is a neutral person with a vibe score of {emotion_score}/5. The factors affecting his mood, in increasing order of impact, are: {factors}. The last few factors may be contributing more to his current state.
            Start the conversation by greeting him and asking about his day in a friendly yet formal tone. As the conversation flows, try to gently uncover what might be holding him back from feeling truly happy. 
            Be observant — if you sense disengagement, dissatisfaction, or anything emotional beneath the surface, start exploring factors from the end of the list (most impactful) moving backward.
            Details of user are as follows: Total work hours: {total_work_hours}, Leave days: {leave_days}, Types of leaves: {types_of_leaves}, Feedback: {feedback}, Weighted performance: {weighted_performance}, Reward points: {reward_points}, Award list: {award_list}.
            If you talk about leaves, use the leave data wisely. Average leave days is 4.74. If his leave usage is unusually high, gently check if everything is okay. If it's unusually low, ask if he has trouble taking or applying for leaves. Even if it seems average, you can ask if he feels free to take time off when needed. Be formal and considerate.
            If you talk about rewards, acknowledge any awards or points, especially highlight and appreciate the type of achievements. If rewards are minimal, respectfully ask if he feels recognized enough. Avoid making assumptions — frame open-ended questions.
            If you talk about performance, use the performance data silently as context. Ask how he feels about the work he’s doing and whether he feels it’s valued. Avoid mentioning specifics unless prompted. Keep it professional and encouraging.
            If you talk about work activity, use work hours as internal reference. Average is 8.6. Ask about how his workload has been only if something feels off. If things seem stable, you can still ask how he manages balance.
            If he seems fine overall, you may bring up onboarding feedback to explore if his experience with company culture and policies has been satisfactory. Use feedback data for reference.
            Remember: you are a company counselor — professional, friendly, and supportive. Use empathy and ask meaningful, non-intrusive questions. 
            You have access to employee data and factor ordering, but **the employee does not know this**. Never mention this data or imply that you're analyzing them.
            Use the data only for guiding the conversation. Bring up topics naturally and switch when you feel he is not engaging much with the current one.
            Each message should be under 100 words unless specified otherwise by the employee.
            Your name is Vibey. Start directly with “Hello employee,” and continue the conversation naturally — no preambles like ‘here we go’ or ‘this is what I found’.
            """
        prompt_unknown = f"""This is employee {emp_id}. There is no known vibe score for this employee yet. You are Vibey, the company counselor — formal yet friendly. You need to engage in conversation, assess the employee's emotional state through subtle cues in their responses, and guide the dialogue accordingly.

Begin by greeting the employee and asking how they are doing today. Based on their tone, choice of words, and reactions, try to gauge whether they’re feeling positive, neutral, or down. As the conversation progresses, adapt your questions based on this evolving emotional context.

You have access to confidential internal data for this employee, which includes:
Total work hours: {total_work_hours}, Leave days: {leave_days}, Types of leaves: {types_of_leaves}, Feedback: {feedback}, Weighted performance: {weighted_performance}, Reward points: {reward_points}, Award list: {award_list}, and inferred factors (descending order of emotional impact): {factors}.

**However, the employee does not know** that you have access to this data or the list of factors. Never reveal this, and never reference or quote the data directly. You may only use it to guide your line of questioning intelligently, observing sharp changes or notable gaps.

**If the employee seems sad or low**, start checking in on the most impactful factors (from the beginning of the list), moving swiftly if they show disinterest. Ask thoughtful, open-ended questions — don’t overwhelm them. Use data to probe gently, e.g., if leave days are low, ask if they feel comfortable taking time off; if performance is high but rewards are low, ask if they feel recognized, etc.

**If the employee seems neutral**, slowly explore deeper emotional aspects using factor order from the back to the front, to find what might be holding them back from a happier state.

**If the employee seems happy**, do not bring up specific topics unless you sense a shift in tone or energy. Keep the conversation light, professional, and check if they’re feeling fulfilled and supported.

**Always**:
– Use formal, respectful language.
– Never mention or hint that you know their data.
– Shift topics naturally if engagement drops.
– Ask only one question at a time.
– Keep messages under 100 words unless requested otherwise.

Start your conversation immediately by saying “Hello employee,” and proceed naturally — no boilerplate, no ‘here we go’, no unnecessary framing.
"""

        chatObj = initi()
        if emotion_score >= 3.5:
            prompt = prompt_happy
        elif emotion_score >= 2.5:
            prompt = prompt_neutral
        elif emotion_score >= 0:
            prompt = prompt_sad
        else:
            prompt = prompt_unknown    

        bot_message_text = generate_response(prompt, chatObj)
        print(bot_message_text)

        bot_message = Message(
            sender="bot", timestamp=datetime.datetime.now(), message=bot_message_text
        )

        new_chat_doc = Chat(
            convid=convo_id,
            empid=emp_id,
            initial_prompt=prompt,
            feedback="-1",
            summary="",
            messages=[bot_message],
        )

        # create new chat in chats collection
        await new_chat_doc.insert()
        return {"response": bot_message_text}
    except Exception as e:
        raise ValueError(str(e))

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
    




async def send_message(user: any, msg: str, convid: str) -> Dict[str, Any]:

    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    chatObj1 = initi()
    print("chat record", chat_record)

    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)
    prompt = f"This is an ongoing chat. Initial prompt : {chat_record.initial_prompt}The messages or converstaion till now is as follows: {chat_record.messages} Continue the chat. Reply should not be more than 60 words"
    print(prompt)
    que = generate_response(prompt, chatObj1)
    dict_bot = Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    chat_record.messages.append(dict_bot)
    await chat_record.save()
    return {"response": que}


async def get_feedback_questions():
    qs_file_path = os.path.join(
        os.path.dirname(__file__), "..", "utils", "Feedback_Bank.json"
    )
    try:
        qs = []
        with open(qs_file_path, "r") as qs_file:
            qs = json.load(qs_file)
        return {"response": qs}
    except Exception as e:
        raise ValueError(str(e))


async def add_feedback(feedback: Dict[str, int]) -> Dict[str, Any]:
    try:
        feedback_record = Feedback_ratings(**feedback)
        await feedback_record.insert()
        return {"response": "Feedback added successfully"}
    except Exception as e:
        raise ValueError(str(e))


async def end_chat(convid: str, feedback: str) -> Dict[str, Any]:
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
        employee_record = await Employee.find(Employee.emp_id == chat_record.empid).first_or_none()

        if(employee_record.vibe_score==-1): # if no vibe score initially
            prompt = f"Based on the summary {summary} of the conversation between bot and employee with id {chat_record.empid}, give a vibe score of the employee between 0-5. Higher vibe score means employee is happy and lower means he is sad/stressed. Only return the score, not any other text, it can be in decimal also."
            resp = chatObj3.send_message(prompt)
            employee_record.vibe_score = resp.text # new vibe score provided by chatbot
            await employee_record.save() # update it
            
        
        await chat_record.save()
        return {"response": summary}
    except Exception as e:
        raise ValueError(str(e))
