"""Redis Streams-backed producer and consumer for AI chat streaming.

Architecture
------------
Producer  (`produce_stream`):
  - Runs as a background asyncio task.
  - Iterates the existing `stream_response_sse` async generator (Gemini SDK).
  - Writes each chunk as a Redis Stream entry with MAXLEN capping memory usage.
  - Writes a final "done" (or "error") sentinel entry.
  - Sets a TTL on the stream key so orphaned streams auto-expire.

Consumer  (`consume_stream_sse`):
  - Async generator called by the HTTP request handler.
  - Reads from the Redis Stream via XREAD (with blocking wait).
  - Yields SSE-formatted strings compatible with the existing frontend SSE parser.
  - Stops on a "done" or "error" sentinel entry.
  - Supports Last-Event-ID reconnection — callers can pass `last_id` to resume.
"""

import json
import logging
import uuid
from collections.abc import AsyncGenerator

from src.models.redis_client import get_redis
from src.services.ai_services import stream_response_sse

logger = logging.getLogger(__name__)

# Stream entries older than this (seconds) are auto-deleted.
STREAM_TTL_SECONDS = 300

# Approximate max number of entries kept per stream (backpressure cap).
STREAM_MAXLEN = 500

# How long (ms) to block on XREAD when no new entries are available.
XREAD_BLOCK_MS = 1000

# How many entries to fetch per XREAD call.
XREAD_COUNT = 20


def make_stream_key(convid: str) -> str:
    """Return a unique Redis Stream key for this message exchange."""
    short_id = uuid.uuid4().hex[:8]
    return f"stream:chat:{convid}:{short_id}"


# ---------------------------------------------------------------------------
# Producer
# ---------------------------------------------------------------------------


async def produce_stream(stream_key: str, user_input: str, chat_obj) -> None:
    """Write AI response chunks from `chat_obj` into `stream_key`.

    Intended to be launched as a background asyncio task so the HTTP
    connection only needs to run the consumer.

    Parameters
    ----------
    stream_key:
        Redis Stream key (from `make_stream_key`).
    user_input:
        The prompt / continuation text to send to the AI.
    chat_obj:
        An initialised Gemini chat object (from `ai_services.initialize()`).
    """
    redis = get_redis()
    if redis is None:
        logger.error("Producer: Redis not available — cannot write stream %s", stream_key)
        return

    try:
        async for sse_chunk in stream_response_sse(user_input, chat_obj):
            # sse_chunk is already formatted as "data: {...}\n\n"
            # Parse out the inner payload so we store structured fields.
            if sse_chunk.startswith("data: "):
                try:
                    payload = json.loads(sse_chunk[6:].strip())
                except json.JSONDecodeError:
                    continue

                entry: dict[str, str] = {}
                if "text" in payload:
                    entry = {"type": "chunk", "text": payload["text"]}
                elif "done" in payload:
                    entry = {"type": "done"}
                elif "error" in payload:
                    entry = {"type": "error", "message": payload["error"]}
                else:
                    continue

                await redis.xadd(stream_key, entry, maxlen=STREAM_MAXLEN, approximate=True)

                if entry["type"] in ("done", "error"):
                    break

    except Exception as exc:
        logger.exception("Producer: unhandled error on stream %s: %s", stream_key, exc)
        try:
            await redis.xadd(
                stream_key,
                {"type": "error", "message": str(exc)},
                maxlen=STREAM_MAXLEN,
                approximate=True,
            )
        except Exception:
            pass
    finally:
        # Set TTL so orphaned streams don't linger in Redis.
        try:
            await redis.expire(stream_key, STREAM_TTL_SECONDS)
        except Exception:
            pass


# ---------------------------------------------------------------------------
# Consumer
# ---------------------------------------------------------------------------


async def consume_stream_sse(
    stream_key: str,
    last_id: str = "0",
) -> AsyncGenerator[str, None]:
    """Async generator that reads from `stream_key` and yields SSE frames.

    Parameters
    ----------
    stream_key:
        Redis Stream key to read from.
    last_id:
        Start offset. Use ``"0"`` to read from the beginning (default),
        or pass the last received entry ID to resume after a reconnect.

    Yields
    ------
    str
        SSE-formatted strings compatible with the existing frontend parser,
        e.g. ``"data: {\"text\": \"hello\"}\\n\\n"``.
    """
    redis = get_redis()
    if redis is None:
        yield f"data: {json.dumps({'error': 'Redis not available'})}\n\n"
        return

    current_id = last_id
    consecutive_empty = 0
    max_empty_polls = int((STREAM_TTL_SECONDS * 1000) / XREAD_BLOCK_MS) + 10

    while True:
        try:
            results = await redis.xread(
                {stream_key: current_id},
                count=XREAD_COUNT,
                block=XREAD_BLOCK_MS,
            )
        except Exception as exc:
            logger.error("Consumer: XREAD error on %s: %s", stream_key, exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        if not results:
            # No new entries yet — stream may still be producing.
            consecutive_empty += 1
            if consecutive_empty >= max_empty_polls:
                logger.warning(
                    "Consumer: timed out waiting for entries on %s after %d polls",
                    stream_key,
                    consecutive_empty,
                )
                yield f"data: {json.dumps({'error': 'Stream timeout'})}\n\n"
                return
            continue

        consecutive_empty = 0
        _stream_name, entries = results[0]

        for entry_id, fields in entries:
            current_id = entry_id  # advance cursor for next XREAD / reconnect

            entry_type = (
                fields.get(b"type", b"").decode()
                if isinstance(fields.get(b"type"), bytes)
                else fields.get("type", "")
            )

            if entry_type == "chunk":
                text = (
                    fields.get(b"text", b"").decode()
                    if isinstance(fields.get(b"text"), bytes)
                    else fields.get("text", "")
                )
                yield f"data: {json.dumps({'text': text})}\n\n"

            elif entry_type == "done":
                yield f"data: {json.dumps({'done': True})}\n\n"
                return

            elif entry_type == "error":
                message = (
                    fields.get(b"message", b"Unknown error").decode()
                    if isinstance(fields.get(b"message"), bytes)
                    else fields.get("message", "Unknown error")
                )
                yield f"data: {json.dumps({'error': message})}\n\n"
                return
