import logging
from typing import Any

from fastapi import HTTPException

from src.models.chats import Chat
from src.models.employee import Employee
from src.models.feedback_ratings import Feedback_ratings

logger = logging.getLogger(__name__)


async def get_all_employees() -> list[dict[str, Any]]:
    try:
        return await Employee.find_all().to_list()
    except Exception as error:
        logger.error("Error fetching all employees: %s", error)
        raise HTTPException(status_code=500, detail=str(error))


async def fetch_employee_data(employee_id: str) -> dict[str, Any]:
    user_record = await Employee.find(Employee.emp_id == employee_id).first_or_none()
    if not user_record:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"user_record": user_record}


async def fetch_employee_conversation(employee_id: str) -> list[str]:
    try:
        chats = await Chat.find(Chat.empid == employee_id).to_list()
        if not chats:
            return []
        return [chat.convid for chat in chats]
    except Exception as e:
        logger.error("Error fetching conversations: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


async def specific_conversation(employee_id: str, convo_id: str) -> dict[str, Any]:
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


async def get_runtime_metrics() -> dict:
    """Read stream timing metrics from Redis and return aggregated stats."""
    from src.models.redis_client import get_redis
    from src.services.redis_stream_service import METRICS_INDEX_KEY, make_metrics_key

    redis = get_redis()
    if redis is None:
        return {
            "available": False,
            "recent_count": 0,
            "streams": [],
            "avg_ttfb_ms": 0.0,
            "avg_duration_ms": 0.0,
        }

    try:
        # Get last 20 convids from sorted index (most recent first).
        members = await redis.zrevrange(METRICS_INDEX_KEY, 0, 19, withscores=True)
        streams = []
        for member, score in members:
            convid = member.decode() if isinstance(member, bytes) else str(member)
            metrics_key = make_metrics_key(convid)
            data = await redis.hgetall(metrics_key)
            if data:
                decoded = {
                    (k.decode() if isinstance(k, bytes) else k): (
                        v.decode() if isinstance(v, bytes) else v
                    )
                    for k, v in data.items()
                }
                streams.append(
                    {
                        "convid": convid,
                        "t_request_ms": float(decoded.get("t_request_ms", 0)),
                        "ttfb_ms": float(decoded.get("ttfb_ms", 0)),
                        "duration_ms": float(decoded.get("duration_ms", 0)),
                        "chunk_count": int(decoded.get("chunk_count", 0)),
                        "total_chars": int(decoded.get("total_chars", 0)),
                    }
                )

        valid_ttfb = [s["ttfb_ms"] for s in streams if s["ttfb_ms"] > 0]
        valid_dur = [s["duration_ms"] for s in streams if s["duration_ms"] > 0]
        avg_ttfb = round(sum(valid_ttfb) / len(valid_ttfb), 2) if valid_ttfb else 0.0
        avg_duration = round(sum(valid_dur) / len(valid_dur), 2) if valid_dur else 0.0

        return {
            "available": True,
            "recent_count": len(streams),
            "avg_ttfb_ms": avg_ttfb,
            "avg_duration_ms": avg_duration,
            "streams": streams,
        }
    except Exception as exc:
        logger.error("get_runtime_metrics: Redis error: %s", exc)
        return {
            "available": False,
            "recent_count": 0,
            "streams": [],
            "avg_ttfb_ms": 0.0,
            "avg_duration_ms": 0.0,
        }
