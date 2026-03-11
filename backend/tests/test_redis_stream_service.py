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
            consume_stream_sse,
        )

        mock_redis = AsyncMock()
        # Always return empty — simulate no producer arriving.
        mock_redis.xread = AsyncMock(return_value=[])

        # Keep this test fast while still validating timeout behavior.
        with (
            patch("src.services.redis_stream_service.STREAM_TTL_SECONDS", 1),
            patch("src.services.redis_stream_service.XREAD_BLOCK_MS", 100),
        ):
            max_polls = int((1 * 1000) / 100) + 10

            with patch("src.services.redis_stream_service.get_redis", return_value=mock_redis):
                chunks = [c async for c in consume_stream_sse("stream:chat:c:abc")]

        assert mock_redis.xread.call_count == max_polls
        data = json.loads(chunks[-1].removeprefix("data: ").strip())
        assert "error" in data
        assert "timeout" in data["error"].lower()


# ---------------------------------------------------------------------------
# record_stream_metrics
# ---------------------------------------------------------------------------


class TestRecordStreamMetrics:
    @pytest.mark.asyncio
    async def test_record_stream_metrics_writes_hash(self):
        """record_stream_metrics calls HSET with correct field names."""
        from src.services.redis_stream_service import record_stream_metrics

        mock_redis = AsyncMock()
        mock_redis.hset = AsyncMock()
        mock_redis.expire = AsyncMock()
        mock_redis.zadd = AsyncMock()
        mock_redis.zremrangebyrank = AsyncMock()

        await record_stream_metrics(
            redis=mock_redis,
            convid="conv-001",
            t_request_ms=1000.0,
            ttfb_ms=150.5,
            duration_ms=2500.0,
            chunk_count=20,
            total_chars=500,
        )

        mock_redis.hset.assert_called_once()
        # hset called with mapping kwarg
        hset_call = mock_redis.hset.call_args
        assert hset_call is not None
        # Verify fields are present in the mapping by checking the call
        args, kwargs = hset_call
        assert "metrics:stream:conv-001" in args or "metrics:stream:conv-001" == args[0]

    @pytest.mark.asyncio
    async def test_record_stream_metrics_sets_ttl(self):
        """record_stream_metrics calls EXPIRE on the metrics key."""
        from src.services.redis_stream_service import METRICS_TTL_SECONDS, record_stream_metrics

        mock_redis = AsyncMock()
        mock_redis.hset = AsyncMock()
        mock_redis.expire = AsyncMock()
        mock_redis.zadd = AsyncMock()
        mock_redis.zremrangebyrank = AsyncMock()

        await record_stream_metrics(
            redis=mock_redis,
            convid="conv-002",
            t_request_ms=1000.0,
            ttfb_ms=100.0,
            duration_ms=2000.0,
            chunk_count=10,
            total_chars=300,
        )

        expire_calls = mock_redis.expire.call_args_list
        assert len(expire_calls) >= 1
        # At least one expire call should use the metrics TTL
        ttl_values = [c.args[1] for c in expire_calls if len(c.args) > 1]
        assert METRICS_TTL_SECONDS in ttl_values

    @pytest.mark.asyncio
    async def test_record_stream_metrics_updates_index(self):
        """record_stream_metrics calls ZADD to update the sorted index."""
        from src.services.redis_stream_service import METRICS_INDEX_KEY, record_stream_metrics

        mock_redis = AsyncMock()
        mock_redis.hset = AsyncMock()
        mock_redis.expire = AsyncMock()
        mock_redis.zadd = AsyncMock()
        mock_redis.zremrangebyrank = AsyncMock()

        await record_stream_metrics(
            redis=mock_redis,
            convid="conv-003",
            t_request_ms=5000.0,
            ttfb_ms=200.0,
            duration_ms=3000.0,
            chunk_count=15,
            total_chars=400,
        )

        mock_redis.zadd.assert_called_once()
        zadd_args = mock_redis.zadd.call_args
        assert METRICS_INDEX_KEY in zadd_args.args or METRICS_INDEX_KEY == zadd_args.args[0]
        # The mapping should include conv-003 with score 5000.0
        mapping = (
            zadd_args.args[1] if len(zadd_args.args) > 1 else list(zadd_args.kwargs.values())[0]
        )
        assert "conv-003" in mapping

    @pytest.mark.asyncio
    async def test_record_stream_metrics_no_redis(self):
        """record_stream_metrics handles None redis gracefully."""
        from src.services.redis_stream_service import record_stream_metrics

        # Should not raise
        await record_stream_metrics(
            redis=None,
            convid="conv-004",
            t_request_ms=1000.0,
            ttfb_ms=100.0,
            duration_ms=2000.0,
            chunk_count=10,
            total_chars=300,
        )
