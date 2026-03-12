import asyncio
import datetime
import json
import logging
import os
from typing import Any

import httpx
from fastapi import HTTPException, status
from langchain_core.messages import HumanMessage

from src.models.chats import Chat, Message
from src.models.employee import Employee
from src.models.feedback_ratings import Feedback_ratings
from src.services.agent_registry_service import get_agent_location, serialize_agent_summary
from src.services.agent_session_token_service import create_agent_session_token
from src.services.ai_services import (
    generate_response_async,
    get_llm,
    stream_response_sse,
    summarize_text_async,
)
from src.services.chat_graph import ChatTurnState, chat_turn_graph
from src.services.conversation_memory_service import (
    build_langchain_messages,
    create_fold_summary,
    should_fold,
    update_chat_memory,
)
from src.services.prompts import (
    build_prompt_happy,
    build_prompt_neutral,
    build_prompt_sad,
    build_prompt_unknown,
)
from src.services.redis_stream_service import make_stream_key

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


def _build_employee_context_prompt(employee: Employee) -> str:
    emp_id = employee.emp_id
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
        return build_prompt_happy(emp_id, emotion_score, factors, **data)
    if emotion_score >= 2.5:
        return build_prompt_neutral(emp_id, emotion_score, factors, **data)
    if emotion_score >= 0:
        return build_prompt_sad(emp_id, emotion_score, factors, **data)
    return build_prompt_unknown(emp_id, factors, **data)


async def _start_agent_session(
    *,
    agent_base_url: str,
    convo_id: str,
    emp_id: str,
    session_token: str,
    chat_context: str,
) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.post(
            f"{agent_base_url.rstrip('/')}/v1/session/start",
            json={
                "convo_id": convo_id,
                "emp_id": emp_id,
                "session_token": session_token,
                "chat_context": chat_context,
            },
        )
        response.raise_for_status()
        return response.json()


async def initiate_chat_service(convo_id: str, user: Any, agent_id: str) -> dict[str, Any]:
    emp_id = user.get("emp_id")
    employee = await _get_employee(emp_id)
    agent = await get_agent_location(agent_id)
    prompt = _build_employee_context_prompt(employee)
    session_token = create_agent_session_token(
        agent_id=agent.agent_id,
        agent_runtime_id=agent.slug,
        convo_id=convo_id,
        emp_id=emp_id,
        public_base_url=agent.public_base_url,
    )

    new_chat_doc = Chat(
        convid=convo_id,
        empid=emp_id,
        initial_prompt=prompt,
        feedback="-1",
        summary="",
        messages=[],
        agent_id=agent.agent_id,
        agent_name_snapshot=agent.display_name,
        agent_public_base_url_snapshot=agent.public_base_url,
        agent_persona_snapshot=agent.persona_key,
        agent_connection_mode="direct",
    )

    await new_chat_doc.insert()
    try:
        session_data = await _start_agent_session(
            agent_base_url=agent.base_url,
            convo_id=convo_id,
            emp_id=emp_id,
            session_token=session_token,
            chat_context=prompt,
        )
    except Exception as exc:
        logger.error("Failed to start agent session: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Selected agent is currently unavailable.",
        )

    bot_message_text = session_data["opener"]
    bot_message = Message(sender="bot", timestamp=datetime.datetime.now(), message=bot_message_text)
    new_chat_doc.messages.append(bot_message)
    new_chat_doc.agent_session_id = session_data["agent_session_id"]
    new_chat_doc.agent_session_started_at = datetime.datetime.now(datetime.UTC)
    await new_chat_doc.save()
    return {
        "convo_id": convo_id,
        "agent": serialize_agent_summary(agent),
        "connection": {
            "public_base_url": agent.public_base_url,
            "agent_session_id": session_data["agent_session_id"],
            "session_token": session_token,
            "send_path": f"/v1/session/{session_data['agent_session_id']}/message",
            "health_path": "/health",
        },
        "opener": bot_message_text,
    }


async def get_chat(conv_id: str, emp_id: str | None = None) -> dict[str, Any]:
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    if emp_id:
        await _verify_chat_ownership(chat_record, emp_id)

    return {
        "chat": chat_record.messages,
        "meta": {
            "agent_id": chat_record.agent_id,
            "agent_name": chat_record.agent_name_snapshot,
            "agent_persona": chat_record.agent_persona_snapshot,
        },
    }


async def get_chat_feedback(conv_id: str, emp_id: str | None = None) -> dict[str, Any]:
    chat_record = await Chat.find(Chat.convid == conv_id).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    if emp_id:
        await _verify_chat_ownership(chat_record, emp_id)

    return {"feedback": chat_record.feedback}


async def send_message(user: Any, msg: str, convid: str) -> dict[str, Any]:
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    await _verify_chat_ownership(chat_record, emp_id)

    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)
    update_chat_memory(chat_record, msg)

    messages = build_langchain_messages(chat_record)
    try:
        que = await generate_response_async(messages)
    except Exception as exc:
        logger.error("AI generate_response_async failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    dict_bot = Message(sender="bot", timestamp=datetime.datetime.now(), message=que)
    chat_record.messages.append(dict_bot)

    if should_fold(chat_record.messages):
        try:
            chat_record.folded_summary = await create_fold_summary(chat_record)
        except Exception as exc:
            logger.warning("send_message: fold summary failed: %s", exc)

    await chat_record.save()
    return {"response": que}


async def send_message_stream(user: Any, msg: str, convid: str):
    """Async generator yielding SSE chunks."""
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    await _verify_chat_ownership(chat_record, emp_id)

    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)
    update_chat_memory(chat_record, msg)

    messages = build_langchain_messages(chat_record)
    full_text: list[str] = []

    async for chunk in stream_response_sse(messages):
        if chunk.startswith("data: "):
            try:
                data = json.loads(chunk[6:].strip())
                if "text" in data:
                    full_text.append(data["text"])
            except json.JSONDecodeError:
                pass
        yield chunk

    full_response = "".join(full_text)
    dict_bot = Message(sender="bot", timestamp=datetime.datetime.now(), message=full_response)
    chat_record.messages.append(dict_bot)

    if should_fold(chat_record.messages):
        try:
            chat_record.folded_summary = await create_fold_summary(chat_record)
        except Exception as exc:
            logger.warning("send_message_stream: fold summary failed: %s", exc)

    await chat_record.save()


async def send_message_stream_redis(user: Any, msg: str, convid: str) -> str:
    """Validate the request, append the user message, start a LangGraph background task,
    and return the Redis Stream key for the caller to consume.

    The caller is responsible for reading from the returned stream key via
    `consume_stream_sse` and forwarding the SSE chunks to the client.
    """
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()
    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    await _verify_chat_ownership(chat_record, emp_id)

    # Persist user message and update memory fields immediately.
    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)
    update_chat_memory(chat_record, msg)
    await chat_record.save()

    stream_key = make_stream_key(convid)

    # Launch LangGraph turn as background task.
    initial_state: ChatTurnState = {
        "convid": convid,
        "stream_key": stream_key,
        "full_text": "",
        "chunk_count": 0,
        "total_chars": 0,
        "ttfb_ms": 0.0,
        "duration_ms": 0.0,
        "t_request_ms": 0.0,
        "error": None,
    }
    asyncio.create_task(chat_turn_graph.ainvoke(initial_state))
    logger.info(
        "send_message_stream_redis: LangGraph task launched for conv=%s, stream_key=%s",
        convid,
        stream_key,
    )
    return stream_key


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
    text = str(chat_record.messages)

    try:
        summary = await summarize_text_async(text)
    except Exception as exc:
        logger.error("summarize_text_async failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    chat_record.summary = summary

    employee_record = await Employee.find(Employee.emp_id == chat_record.empid).first_or_none()

    if employee_record and employee_record.vibe_score == -1:
        prompt = (
            f"Based on the summary {summary} of the conversation between bot and employee"
            f" with id {chat_record.empid}, give a vibe score of the employee between 0-5."
            " Higher vibe score means employee is happy and lower means he is sad/stressed."
            " Only return the score, not any other text, it can be in decimal also."
        )
        try:
            llm = get_llm()
            resp = await llm.ainvoke([HumanMessage(content=prompt)])
            employee_record.vibe_score = float(resp.content.strip())
        except (ValueError, TypeError, Exception) as exc:
            logger.warning("Could not parse vibe score: %s", exc)
        await employee_record.save()

    await chat_record.save()
    return {"response": summary}
