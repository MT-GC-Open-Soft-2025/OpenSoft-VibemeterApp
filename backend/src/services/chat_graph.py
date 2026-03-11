"""LangGraph state machine for WellBee chat turn processing.

The graph runs as a background asyncio task launched by ``send_message_stream_redis``.

Graph:
    stream_generate → persist → END

State: ``ChatTurnState`` (TypedDict)

Nodes:
    stream_generate — call LLM with astream(), write chunks to Redis, capture timing
    persist         — save bot reply to DB, fold old messages if needed, record metrics
"""

import datetime
import logging
import time
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from src.models.chats import Chat, Message
from src.models.redis_client import get_redis
from src.services.ai_services import get_llm, get_timing_callback
from src.services.conversation_memory_service import (
    build_langchain_messages,
    create_fold_summary,
    should_fold,
)
from src.services.redis_stream_service import (
    STREAM_MAXLEN,
    STREAM_TTL_SECONDS,
    record_stream_metrics,
)

logger = logging.getLogger(__name__)


class ChatTurnState(TypedDict):
    """State carried through the LangGraph chat-turn pipeline."""

    convid: str
    stream_key: str
    # Populated by stream_generate:
    full_text: str
    chunk_count: int
    total_chars: int
    ttfb_ms: float
    duration_ms: float
    t_request_ms: float
    # Populated if an error occurs:
    error: str | None


# ---------------------------------------------------------------------------
# Node: stream_generate
# ---------------------------------------------------------------------------


async def node_stream_generate(state: ChatTurnState) -> dict[str, Any]:
    """Load chat record, stream LLM response to Redis, capture timing."""
    convid = state["convid"]
    stream_key = state["stream_key"]
    redis = get_redis()

    t_request_ms = time.time() * 1000

    # Re-fetch the record (already has user message + updated memory fields).
    record = await Chat.find(Chat.convid == convid).first_or_none()
    if record is None:
        logger.error("node_stream_generate [%s]: Chat not found — aborting", stream_key)
        if redis is not None:
            await redis.xadd(
                stream_key,
                {"type": "error", "message": "Chat not found"},
                maxlen=STREAM_MAXLEN,
                approximate=True,
            )
            await redis.expire(stream_key, STREAM_TTL_SECONDS)
        return {**state, "error": "Chat not found", "t_request_ms": t_request_ms}

    # Build structured LangChain message list (includes folded_summary, topic context,
    # recent turns).
    messages = build_langchain_messages(record)
    logger.info(
        "node_stream_generate [%s]: Starting stream (%d messages in context)",
        stream_key,
        len(messages),
    )

    # Clear any stale stream entries.
    if redis is not None:
        try:
            await redis.delete(stream_key)
        except Exception as exc:
            logger.warning(
                "node_stream_generate [%s]: Could not clear stale stream: %s", stream_key, exc
            )

    timing_cb = get_timing_callback()
    llm = get_llm(callbacks=[timing_cb])

    full_text: list[str] = []
    chunk_count = 0
    total_chars = 0

    try:
        async for chunk in llm.astream(messages):
            text = chunk.content
            if not text:
                continue
            full_text.append(text)
            chunk_count += 1
            total_chars += len(text)
            logger.debug(
                "node_stream_generate [%s]: chunk #%d (%d chars)",
                stream_key,
                chunk_count,
                len(text),
            )
            if redis is not None:
                await redis.xadd(
                    stream_key,
                    {"type": "chunk", "text": text},
                    maxlen=STREAM_MAXLEN,
                    approximate=True,
                )

        # Write done sentinel.
        if redis is not None:
            await redis.xadd(stream_key, {"type": "done"}, maxlen=STREAM_MAXLEN, approximate=True)
            await redis.expire(stream_key, STREAM_TTL_SECONDS)
        logger.info(
            "node_stream_generate [%s]: done — %d chunks, %d chars",
            stream_key,
            chunk_count,
            total_chars,
        )

    except Exception as exc:
        logger.exception("node_stream_generate [%s]: unhandled error: %s", stream_key, exc)
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
                    "node_stream_generate [%s]: failed to write error sentinel: %s",
                    stream_key,
                    inner,
                )
        return {
            **state,
            "full_text": "".join(full_text),
            "chunk_count": chunk_count,
            "total_chars": total_chars,
            "ttfb_ms": timing_cb.ttfb_ms,
            "duration_ms": timing_cb.duration_ms,
            "t_request_ms": t_request_ms,
            "error": str(exc),
        }

    return {
        **state,
        "full_text": "".join(full_text),
        "chunk_count": chunk_count,
        "total_chars": total_chars,
        "ttfb_ms": timing_cb.ttfb_ms,
        "duration_ms": timing_cb.duration_ms,
        "t_request_ms": t_request_ms,
        "error": None,
    }


# ---------------------------------------------------------------------------
# Node: persist
# ---------------------------------------------------------------------------


async def node_persist(state: ChatTurnState) -> dict[str, Any]:
    """Persist bot reply to DB, update fold summary, record metrics to Redis."""
    convid = state["convid"]
    full_text = state.get("full_text", "")

    record = await Chat.find(Chat.convid == convid).first_or_none()
    if record is None:
        logger.error("node_persist [%s]: Chat not found", convid)
        return state

    # Append bot message.
    if full_text:
        bot_msg = Message(
            sender="bot",
            timestamp=datetime.datetime.now(),
            message=full_text,
        )
        record.messages.append(bot_msg)
        logger.info(
            "node_persist [%s]: Persisting bot reply (%d chars, %d chunks)",
            convid,
            state.get("total_chars", 0),
            state.get("chunk_count", 0),
        )

    # Asynchronously update fold summary if message history is long enough.
    if should_fold(record.messages):
        try:
            new_summary = await create_fold_summary(record)
            record.folded_summary = new_summary
            logger.debug(
                "node_persist [%s]: Updated folded_summary (%d chars)", convid, len(new_summary)
            )
        except Exception as exc:
            logger.warning("node_persist [%s]: fold summary failed: %s", convid, exc)

    await record.save()

    # Record stream metrics to Redis.
    redis = get_redis()
    if redis is not None and state.get("t_request_ms"):
        try:
            await record_stream_metrics(
                redis=redis,
                convid=convid,
                t_request_ms=state["t_request_ms"],
                ttfb_ms=state.get("ttfb_ms", 0.0),
                duration_ms=state.get("duration_ms", 0.0),
                chunk_count=state.get("chunk_count", 0),
                total_chars=state.get("total_chars", 0),
            )
        except Exception as exc:
            logger.warning("node_persist [%s]: metrics recording failed: %s", convid, exc)

    return state


# ---------------------------------------------------------------------------
# Build graph
# ---------------------------------------------------------------------------

_builder = StateGraph(ChatTurnState)
_builder.add_node("stream_generate", node_stream_generate)
_builder.add_node("persist", node_persist)
_builder.set_entry_point("stream_generate")
_builder.add_edge("stream_generate", "persist")
_builder.add_edge("persist", END)

chat_turn_graph = _builder.compile()
