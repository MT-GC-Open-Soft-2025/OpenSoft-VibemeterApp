import datetime
import json
import logging
import os
from typing import Any

from fastapi import HTTPException, status

from src.models.chats import Chat, Message
from src.models.employee import Employee
from src.models.feedback_ratings import Feedback_ratings
from src.services.ai_services import (
    generate_response,
    stream_response_sse,
    summarize_text,
)
from src.services.ai_services import (
    initialize as initi,
)
from src.services.prompts import (
    build_prompt_happy,
    build_prompt_neutral,
    build_prompt_sad,
    build_prompt_unknown,
)

logger = logging.getLogger(__name__)


async def _get_employee(emp_id: str) -> Employee:
    employee = await Employee.find(Employee.emp_id == emp_id).first_or_none()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


async def _verify_chat_ownership(chat: Chat, emp_id: str) -> None:
    if chat.empid != emp_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this conversation.",
        )


async def initiate_chat_service(convo_id: str, user: Any) -> dict[str, Any]:
    emp_id = user.get("emp_id")
    employee = await _get_employee(emp_id)

    emotion_score = employee.vibe_score if employee.vibe_score is not None else -1
    factors_list = employee.factors_in_sorted_order or []
    factors = ", ".join(factors_list)

    data = {
        "total_work_hours": employee.total_work_hours,
        "leave_days": employee.leave_days,
        "types_of_leaves": employee.types_of_leaves,
        "feedback": employee.feedback,
        "weighted_performance": employee.weighted_performance,
        "reward_points": employee.reward_points,
        "award_list": employee.award_list,
    }

    if emotion_score >= 3.5:
        prompt = build_prompt_happy(emp_id, emotion_score, factors, **data)
    elif emotion_score >= 2.5:
        prompt = build_prompt_neutral(emp_id, emotion_score, factors, **data)
    elif emotion_score >= 0:
        prompt = build_prompt_sad(emp_id, emotion_score, factors, **data)
    else:
        prompt = build_prompt_unknown(emp_id, factors, **data)

    chatObj = initi()
    if isinstance(chatObj, dict) and "error" in chatObj:
        logger.error("AI Service initialization failed: %s", chatObj["error"])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    bot_message_text = generate_response(prompt, chatObj)

    bot_message = Message(sender="bot", timestamp=datetime.datetime.now(), message=bot_message_text)

    new_chat_doc = Chat(
        convid=convo_id,
        empid=emp_id,
        initial_prompt=prompt,
        feedback="-1",
        summary="",
        messages=[bot_message],
    )

    await new_chat_doc.insert()
    return {"response": bot_message_text}


async def get_chat(conv_id: str, emp_id: str | None = None) -> dict[str, Any]:
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    if emp_id:
        await _verify_chat_ownership(chat_record, emp_id)

    return {"chat": chat_record.messages}


async def get_chat_feedback(conv_id: str, emp_id: str | None = None) -> dict[str, Any]:
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    if emp_id:
        await _verify_chat_ownership(chat_record, emp_id)

    return {"feedback": chat_record.feedback}


def _build_continuation_prompt(chat_record: Chat) -> str:
    return (
        f"This is an ongoing chat. Initial prompt: {chat_record.initial_prompt}"
        f" The conversation so far: {chat_record.messages}"
        f" Continue the chat. Reply should not be more than 100 words."
    )


async def send_message(user: Any, msg: str, convid: str) -> dict[str, Any]:
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()

    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    await _verify_chat_ownership(chat_record, emp_id)

    chatObj1 = initi()
    if isinstance(chatObj1, dict) and "error" in chatObj1:
        logger.error("AI Service initialization failed: %s", chatObj1["error"])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)

    prompt = _build_continuation_prompt(chat_record)
    que = generate_response(prompt, chatObj1)
    dict_bot = Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    chat_record.messages.append(dict_bot)
    await chat_record.save()
    return {"response": que}


async def send_message_stream(user: Any, msg: str, convid: str):
    """Async generator yielding SSE chunks. Caller must persist final message to DB."""
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()

    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    await _verify_chat_ownership(chat_record, emp_id)

    chatObj1 = initi()
    if isinstance(chatObj1, dict) and "error" in chatObj1:
        logger.error("AI Service initialization failed: %s", chatObj1["error"])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)

    prompt = _build_continuation_prompt(chat_record)
    full_text: list[str] = []
    stream_error: str | None = None
    async for chunk in stream_response_sse(prompt, chatObj1):
        if chunk.startswith("data: "):
            try:
                data = json.loads(chunk[6:].strip())
                if "error" in data:
                    stream_error = data["error"]
                elif "text" in data:
                    full_text.append(data["text"])
            except json.JSONDecodeError:
                pass
        yield chunk

    full_response = "".join(full_text)
    if stream_error:
        logger.warning("AI stream error (partial response saved): %s", stream_error)
    dict_bot = Message(sender="bot", timestamp=datetime.datetime.now(), message=full_response)
    chat_record.messages.append(dict_bot)
    await chat_record.save()


async def get_feedback_questions():
    qs_file_path = os.path.join(os.path.dirname(__file__), "..", "utils", "Feedback_Bank.json")
    try:
        with open(qs_file_path) as qs_file:
            qs = json.load(qs_file)
        return {"response": qs}
    except Exception as e:
        logger.error("Failed to load feedback questions: %s", e)
        raise ValueError(str(e))


async def add_feedback(
    feedback: dict[str, int], emp_id: str | None = None, conv_id: str | None = None
) -> dict[str, Any]:
    try:
        feedback_record = Feedback_ratings(emp_id=emp_id, conv_id=conv_id, **feedback)
        await feedback_record.insert()
        return {"response": "Feedback added successfully"}
    except Exception as e:
        logger.error("Failed to add feedback: %s", e)
        raise ValueError(str(e))


async def end_chat(convid: str, feedback: str, emp_id: str) -> dict[str, Any]:
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    await _verify_chat_ownership(chat_record, emp_id)

    if chat_record.feedback != "-1":
        raise ValueError("Feedback already given")

    chat_record.feedback = feedback
    chatObj3 = initi()
    if isinstance(chatObj3, dict) and "error" in chatObj3:
        logger.error("AI Service initialization failed: %s", chatObj3["error"])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    text = str(chat_record.messages)
    summary = summarize_text(text, chatObj3)
    chat_record.summary = summary

    employee_record = await Employee.find(Employee.emp_id == chat_record.empid).first_or_none()

    if employee_record and employee_record.vibe_score == -1:
        prompt = (
            f"Based on the summary {summary} of the conversation between bot and employee"
            f" with id {chat_record.empid}, give a vibe score of the employee between 0-5."
            " Higher vibe score means employee is happy and lower means he is sad/stressed."
            " Only return the score, not any other text, it can be in decimal also."
        )
        resp = chatObj3.send_message(prompt)
        try:
            employee_record.vibe_score = float(resp.text.strip())
        except (ValueError, TypeError):
            logger.warning("Could not parse vibe score from AI response: %r", resp.text)
        await employee_record.save()

    await chat_record.save()
    return {"response": summary}
