import asyncio
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


async def send_message_stream_redis(user: Any, msg: str, convid: str) -> str:
    """Validate the request, append the user message, start a background producer,
    and return the Redis Stream key for the caller to consume.

    The caller is responsible for reading from the returned stream key via
    `consume_stream_sse` and forwarding the SSE chunks to the client.
    """
    emp_id = user.get("emp_id")
    chat_record = await Chat.find(Chat.convid == convid).first_or_none()

    if not chat_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    await _verify_chat_ownership(chat_record, emp_id)

    chatObj = initi()
    if isinstance(chatObj, dict) and "error" in chatObj:
        logger.error("AI Service initialization failed: %s", chatObj["error"])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service is currently unavailable.",
        )

    # Persist the user message immediately so it is visible before the bot replies.
    dict_user = Message(sender="user", timestamp=datetime.datetime.now(), message=msg)
    chat_record.messages.append(dict_user)
    await chat_record.save()

    prompt = _build_continuation_prompt(chat_record)
    stream_key = make_stream_key(convid)

    async def _produce_and_persist():
        """Background task: produce chunks to Redis, then persist the full bot reply to DB."""
        from src.models.redis_client import get_redis
        from src.services.redis_stream_service import STREAM_MAXLEN, STREAM_TTL_SECONDS

        full_text: list[str] = []
        redis = get_redis()

        # Delete any stale stream entries from a previous exchange on this conv
        # BEFORE writing new ones so the consumer always reads from id="0".
        if redis is not None:
            try:
                await redis.delete(stream_key)
                logger.info("Producer [%s]: Cleared stale stream entries", stream_key)
            except Exception as exc:
                logger.warning("Producer [%s]: Could not clear stale stream: %s", stream_key, exc)

        # Re-fetch chat record inside the background task to avoid stale state.
        record = await Chat.find(Chat.convid == convid).first_or_none()
        if record is None:
            logger.error("Producer [%s]: Chat not found — aborting", stream_key)
            return

        logger.info("Producer [%s]: Starting AI stream for conv=%s", stream_key, convid)
        chunk_count = 0

        # Collect chunks during production so we can persist the full response.
        try:
            async for sse_chunk in stream_response_sse(prompt, chatObj):
                if sse_chunk.startswith("data: "):
                    try:
                        data = json.loads(sse_chunk[6:].strip())
                        if "text" in data:
                            full_text.append(data["text"])
                    except json.JSONDecodeError:
                        pass

                # Also write to Redis Stream for the consumer.
                if redis is not None:
                    if sse_chunk.startswith("data: "):
                        try:
                            payload = json.loads(sse_chunk[6:].strip())
                        except json.JSONDecodeError:
                            continue
                        entry: dict[str, str] = {}
                        if "text" in payload:
                            entry = {"type": "chunk", "text": payload["text"]}
                            chunk_count += 1
                            logger.debug(
                                "Producer [%s]: Writing chunk #%d (%d chars)",
                                stream_key,
                                chunk_count,
                                len(payload["text"]),
                            )
                        elif "done" in payload:
                            entry = {"type": "done"}
                            logger.info(
                                "Producer [%s]: Writing 'done' sentinel after %d chunks",
                                stream_key,
                                chunk_count,
                            )
                        elif "error" in payload:
                            entry = {"type": "error", "message": payload["error"]}
                            logger.error(
                                "Producer [%s]: Writing 'error' sentinel: %s",
                                stream_key,
                                payload["error"],
                            )
                        if entry:
                            await redis.xadd(
                                stream_key, entry, maxlen=STREAM_MAXLEN, approximate=True
                            )
                            if entry["type"] in ("done", "error"):
                                await redis.expire(stream_key, STREAM_TTL_SECONDS)
                                break
            else:
                # Ensure a "done" sentinel is always written.
                if redis is not None:
                    logger.info(
                        "Producer [%s]: Stream exhausted — writing 'done' sentinel (%d chunks)",
                        stream_key,
                        chunk_count,
                    )
                    await redis.xadd(
                        stream_key, {"type": "done"}, maxlen=STREAM_MAXLEN, approximate=True
                    )
                    await redis.expire(stream_key, STREAM_TTL_SECONDS)
        except Exception as exc:
            logger.exception(
                "Producer [%s]: Unhandled error after %d chunks: %s", stream_key, chunk_count, exc
            )
            if redis is not None:
                try:
                    await redis.xadd(
                        stream_key,
                        {"type": "error", "message": str(exc)},
                        maxlen=STREAM_MAXLEN,
                        approximate=True,
                    )
                    await redis.expire(stream_key, STREAM_TTL_SECONDS)
                except Exception as inner:
                    logger.error(
                        "Producer [%s]: Also failed to write error sentinel: %s", stream_key, inner
                    )

        # Persist final bot reply to MongoDB.
        full_response = "".join(full_text)
        if full_response:
            logger.info(
                "Producer [%s]: Persisting bot reply to DB (%d chars)",
                stream_key,
                len(full_response),
            )
            dict_bot = Message(
                sender="bot", timestamp=datetime.datetime.now(), message=full_response
            )
            record.messages.append(dict_bot)
            await record.save()
        else:
            logger.warning("Producer [%s]: No text collected — nothing persisted to DB", stream_key)

    asyncio.create_task(_produce_and_persist())
    logger.info(
        "send_message_stream_redis: background producer launched for conv=%s, stream_key=%s",
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
