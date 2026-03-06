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

import asyncio
import json
import logging
from collections.abc import AsyncGenerator

from src.models.redis_client import get_redis
from src.services.ai_services import stream_response_sse

logger = logging.getLogger(__name__)

# Stream entries older than this (seconds) are auto-deleted.
STREAM_TTL_SECONDS = 300

# Approximate max number of entries kept per stream (backpressure cap).
STREAM_MAXLEN = 500

# How long (ms) to block on XREAD when no new entries are available.
XREAD_BLOCK_MS = 100

# How many entries to fetch per XREAD call.
XREAD_COUNT = 20


def make_stream_key(convid: str) -> str:
    """Return a stable Redis Stream key for this conversation's current exchange.

    Keyed purely on convid so the consumer can locate the stream without
    needing a separate lookup.  The old messages are overwritten each time
    a new message is sent (stream is deleted before the producer starts).
    """
    return f"stream:chat:{convid}"


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
        logger.error("Producer [%s]: Redis not available — cannot write stream", stream_key)
        return

    logger.info("Producer [%s]: Starting — deleting any stale stream entries", stream_key)
    try:
        # Delete any leftover entries from a previous exchange on this conv.
        await redis.delete(stream_key)
    except Exception as exc:
        logger.warning("Producer [%s]: Could not delete stale stream: %s", stream_key, exc)

    chunk_count = 0
    try:
        async for sse_chunk in stream_response_sse(user_input, chat_obj):
            # sse_chunk is already formatted as "data: {...}\n\n"
            # Parse out the inner payload so we store structured fields.
            if sse_chunk.startswith("data: "):
                try:
                    payload = json.loads(sse_chunk[6:].strip())
                except json.JSONDecodeError:
                    logger.warning(
                        "Producer [%s]: Failed to decode SSE chunk, skipping", stream_key
                    )
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
                        "Producer [%s]: Writing 'error' sentinel: %s", stream_key, payload["error"]
                    )
                else:
                    continue

                await redis.xadd(stream_key, entry, maxlen=STREAM_MAXLEN, approximate=True)

                if entry["type"] in ("done", "error"):
                    break

    except Exception as exc:
        logger.exception(
            "Producer [%s]: Unhandled error after %d chunks: %s", stream_key, chunk_count, exc
        )
        try:
            await redis.xadd(
                stream_key,
                {"type": "error", "message": str(exc)},
                maxlen=STREAM_MAXLEN,
                approximate=True,
            )
        except Exception as inner:
            logger.error(
                "Producer [%s]: Also failed to write error sentinel: %s", stream_key, inner
            )
    finally:
        # Set TTL so orphaned streams don't linger in Redis.
        try:
            await redis.expire(stream_key, STREAM_TTL_SECONDS)
            logger.info(
                "Producer [%s]: TTL set to %ds — stream complete", stream_key, STREAM_TTL_SECONDS
            )
        except Exception as exc:
            logger.error("Producer [%s]: Failed to set TTL: %s", stream_key, exc)


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
        logger.error("Consumer [%s]: Redis not available", stream_key)
        yield f"data: {json.dumps({'error': 'Redis not available'})}\n\n"
        return

    logger.info("Consumer [%s]: Connected — reading from id='%s'", stream_key, last_id)
    # Yield to the event loop once before the first XREAD so the background
    # producer task (created just before this consumer started) gets a chance
    # to begin writing.  Without this, the very first XREAD may hit an empty /
    # non-existent stream even though the producer is ready to run.
    await asyncio.sleep(0)

    current_id = last_id
    consecutive_empty = 0
    # Use wall-clock seconds for timeout rather than counting polls, because
    # XREAD on a non-existent key may return immediately (no blocking) on some
    # Redis / client versions, making poll-based timeouts unreliable.
    max_empty_polls = int((STREAM_TTL_SECONDS * 1000) / XREAD_BLOCK_MS) + 10
    delivered_chunks = 0

    while True:
        try:
            results = await redis.xread(
                {stream_key: current_id},
                count=XREAD_COUNT,
                block=XREAD_BLOCK_MS,
            )
        except Exception as exc:
            logger.error("Consumer [%s]: XREAD error: %s", stream_key, exc)
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        if not results:
            # No new entries yet — stream may still be producing.
            consecutive_empty += 1
            if consecutive_empty % 50 == 0:
                logger.debug(
                    "Consumer [%s]: Waiting for producer — %d empty polls so far",
                    stream_key,
                    consecutive_empty,
                )
            if consecutive_empty >= max_empty_polls:
                logger.warning(
                    "Consumer [%s]: Timed out after %d polls (delivered %d chunks)",
                    stream_key,
                    consecutive_empty,
                    delivered_chunks,
                )
                yield f"data: {json.dumps({'error': 'Stream timeout'})}\n\n"
                return
            # If XREAD returned immediately (non-existent key on some Redis
            # versions), sleep for the nominal polling interval so we don't
            # spin and starve the background producer task.
            await asyncio.sleep(XREAD_BLOCK_MS / 1000)
            continue

        consecutive_empty = 0
        _stream_name, entries = results[0]
        logger.debug("Consumer [%s]: Received batch of %d entries", stream_key, len(entries))

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
                delivered_chunks += 1
                logger.debug("Consumer [%s]: Forwarding chunk #%d", stream_key, delivered_chunks)
                yield f"data: {json.dumps({'text': text})}\n\n"

            elif entry_type == "done":
                logger.info(
                    "Consumer [%s]: Done sentinel received — delivered %d chunks total",
                    stream_key,
                    delivered_chunks,
                )
                yield f"data: {json.dumps({'done': True})}\n\n"
                return

            elif entry_type == "error":
                message = (
                    fields.get(b"message", b"Unknown error").decode()
                    if isinstance(fields.get(b"message"), bytes)
                    else fields.get("message", "Unknown error")
                )
                logger.error("Consumer [%s]: Error sentinel received: %s", stream_key, message)
                yield f"data: {json.dumps({'error': message})}\n\n"
                return
