"""Unit tests for src.services.redis_stream_service."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------


def _make_entry(entry_id: str, fields: dict[str, str]) -> tuple:
    """Return a (entry_id_bytes, fields_bytes) tuple as redis.asyncio would."""
    return (
        entry_id.encode(),
        {k.encode(): v.encode() for k, v in fields.items()},
    )


# ---------------------------------------------------------------------------
# make_stream_key
# ---------------------------------------------------------------------------


class TestMakeStreamKey:
    def test_format(self):
        from src.services.redis_stream_service import make_stream_key

        key = make_stream_key("conv-123")
        assert key == "stream:chat:conv-123"

    def test_different_convids_produce_different_keys(self):
        from src.services.redis_stream_service import make_stream_key

        assert make_stream_key("conv-1") != make_stream_key("conv-2")

    def test_same_convid_produces_same_key(self):
        from src.services.redis_stream_service import make_stream_key

        # Deterministic by design: consumer can locate stream by convId alone.
        assert make_stream_key("conv-abc") == make_stream_key("conv-abc")


# ---------------------------------------------------------------------------
# produce_stream (via _produce_and_persist inside send_message_stream_redis)
# We test the standalone produce_stream helper directly.
# ---------------------------------------------------------------------------


class TestProduceStream:
    @pytest.mark.asyncio
    async def test_no_redis_logs_and_returns(self, caplog):
        """produce_stream exits gracefully when Redis is not configured."""
        from src.services.redis_stream_service import produce_stream

        with patch("src.services.redis_stream_service.get_redis", return_value=None):
            await produce_stream("stream:chat:c:abc123", "prompt", MagicMock())
        # No exception raised; log message emitted.
        assert any("Redis not available" in r.message for r in caplog.records)

    @pytest.mark.asyncio
    async def test_writes_chunks_and_done(self):
        """produce_stream writes chunk + done entries to Redis."""
        from src.services.redis_stream_service import produce_stream

        mock_redis = AsyncMock()
        mock_redis.xadd = AsyncMock()
        mock_redis.expire = AsyncMock()

        sse_chunks = [
            f"data: {json.dumps({'text': 'Hello'})}\n\n",
            f"data: {json.dumps({'text': ' world'})}\n\n",
            f"data: {json.dumps({'done': True})}\n\n",
        ]

        async def _fake_sse(*args, **kwargs):
            for c in sse_chunks:
                yield c

        with (
            patch("src.services.redis_stream_service.get_redis", return_value=mock_redis),
            patch("src.services.redis_stream_service.stream_response_sse", _fake_sse),
        ):
            await produce_stream("stream:chat:c:abc", "prompt", MagicMock())

        calls = mock_redis.xadd.call_args_list
        types = [c.args[1]["type"] for c in calls]
        assert "chunk" in types
        assert "done" in types
        # Texts
        chunks = [c.args[1]["text"] for c in calls if c.args[1]["type"] == "chunk"]
        assert chunks == ["Hello", " world"]

    @pytest.mark.asyncio
    async def test_writes_error_on_exception(self):
        """produce_stream writes an error entry when the stream raises."""
        from src.services.redis_stream_service import produce_stream

        mock_redis = AsyncMock()
        mock_redis.xadd = AsyncMock()
        mock_redis.expire = AsyncMock()

        async def _boom(*args, **kwargs):
            raise RuntimeError("AI exploded")
            yield  # make it an async generator

        with (
            patch("src.services.redis_stream_service.get_redis", return_value=mock_redis),
            patch("src.services.redis_stream_service.stream_response_sse", _boom),
        ):
            await produce_stream("stream:chat:c:xyz", "prompt", MagicMock())

        calls = mock_redis.xadd.call_args_list
        error_calls = [c for c in calls if c.args[1]["type"] == "error"]
        assert len(error_calls) == 1
        assert "AI exploded" in error_calls[0].args[1]["message"]


# ---------------------------------------------------------------------------
# consume_stream_sse
# ---------------------------------------------------------------------------


class TestConsumeStreamSse:
    @pytest.mark.asyncio
    async def test_no_redis_yields_error(self):
        """consume_stream_sse yields an error frame when Redis is not available."""
        from src.services.redis_stream_service import consume_stream_sse

        with patch("src.services.redis_stream_service.get_redis", return_value=None):
            chunks = [c async for c in consume_stream_sse("stream:chat:c:abc")]

        assert len(chunks) == 1
        data = json.loads(chunks[0].removeprefix("data: ").strip())
        assert "error" in data

    @pytest.mark.asyncio
    async def test_yields_text_chunks_then_done(self):
        """consume_stream_sse yields text SSE frames and stops on done."""
        from src.services.redis_stream_service import consume_stream_sse

        mock_redis = AsyncMock()

        # Two XREAD calls: first returns two text chunks, second returns done.
        entry1 = _make_entry("1-0", {"type": "chunk", "text": "Hi"})
        entry2 = _make_entry("2-0", {"type": "chunk", "text": " there"})
        entry_done = _make_entry("3-0", {"type": "done"})

        mock_redis.xread = AsyncMock(
            side_effect=[
                [(b"stream:chat:c:abc", [entry1, entry2])],
                [(b"stream:chat:c:abc", [entry_done])],
            ]
        )

        with patch("src.services.redis_stream_service.get_redis", return_value=mock_redis):
            chunks = [c async for c in consume_stream_sse("stream:chat:c:abc")]

        payloads = [json.loads(c.removeprefix("data: ").strip()) for c in chunks]
        texts = [p["text"] for p in payloads if "text" in p]
        assert texts == ["Hi", " there"]
        assert any("done" in p for p in payloads)

    @pytest.mark.asyncio
    async def test_yields_error_frame_on_error_entry(self):
        """consume_stream_sse yields an error SSE frame and exits on error entry."""
        from src.services.redis_stream_service import consume_stream_sse

        mock_redis = AsyncMock()
        entry_err = _make_entry("1-0", {"type": "error", "message": "Boom"})
        mock_redis.xread = AsyncMock(return_value=[(b"stream:chat:c:abc", [entry_err])])

        with patch("src.services.redis_stream_service.get_redis", return_value=mock_redis):
            chunks = [c async for c in consume_stream_sse("stream:chat:c:abc")]

        assert len(chunks) == 1
        data = json.loads(chunks[0].removeprefix("data: ").strip())
        assert data.get("error") == "Boom"

    @pytest.mark.asyncio
    async def test_timeout_after_max_empty_polls(self):
        """consume_stream_sse yields a timeout error after too many empty polls."""
        from src.services.redis_stream_service import (
            STREAM_TTL_SECONDS,
            XREAD_BLOCK_MS,
            consume_stream_sse,
        )

        mock_redis = AsyncMock()
        # Always return empty — simulate no producer arriving.
        mock_redis.xread = AsyncMock(return_value=[])

        max_polls = int((STREAM_TTL_SECONDS * 1000) / XREAD_BLOCK_MS) + 10

        with patch("src.services.redis_stream_service.get_redis", return_value=mock_redis):
            chunks = [c async for c in consume_stream_sse("stream:chat:c:abc")]

        assert mock_redis.xread.call_count == max_polls
        data = json.loads(chunks[-1].removeprefix("data: ").strip())
        assert "error" in data
        assert "timeout" in data["error"].lower()
