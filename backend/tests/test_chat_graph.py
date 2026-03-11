"""Tests for src.services.chat_graph."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.services.chat_graph import ChatTurnState, node_persist, node_stream_generate


def _make_state(**overrides) -> ChatTurnState:
    base: ChatTurnState = {
        "convid": "conv-test",
        "stream_key": "stream:chat:conv-test",
        "full_text": "",
        "chunk_count": 0,
        "total_chars": 0,
        "ttfb_ms": 0.0,
        "duration_ms": 0.0,
        "t_request_ms": 0.0,
        "error": None,
    }
    base.update(overrides)
    return base


def _make_chat_record(convid="conv-test", messages=None):
    from src.models.chats import Message

    record = MagicMock()
    record.convid = convid
    record.initial_prompt = "You are a wellness bot."
    record.messages = messages or [
        Message(sender="user", timestamp=datetime.now(), message="Hello"),
    ]
    record.active_topic = None
    record.resolved_topics = []
    record.folded_summary = ""
    record.last_sentiment = None
    record.turn_count = 1
    record.save = AsyncMock()
    return record


# ---------------------------------------------------------------------------
# node_stream_generate
# ---------------------------------------------------------------------------


class TestNodeStreamGenerate:
    @pytest.mark.asyncio
    async def test_chat_not_found_returns_error_state(self):
        """node_stream_generate returns error state when chat record not found."""
        state = _make_state()

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=None),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)
            result = await node_stream_generate(state)

        assert result["error"] == "Chat not found"

    @pytest.mark.asyncio
    async def test_chat_not_found_writes_error_to_redis(self):
        """node_stream_generate writes error entry to Redis when chat not found."""
        state = _make_state()
        mock_redis = AsyncMock()
        mock_redis.xadd = AsyncMock()
        mock_redis.expire = AsyncMock()

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=mock_redis),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)
            await node_stream_generate(state)

        mock_redis.xadd.assert_called()
        call_args = mock_redis.xadd.call_args_list
        error_calls = [c for c in call_args if c.args[1].get("type") == "error"]
        assert len(error_calls) == 1

    @pytest.mark.asyncio
    async def test_writes_chunks_and_done_to_redis(self):
        """node_stream_generate streams LLM response as chunk entries to Redis."""
        state = _make_state()
        record = _make_chat_record()

        mock_redis = AsyncMock()
        mock_redis.delete = AsyncMock()
        mock_redis.xadd = AsyncMock()
        mock_redis.expire = AsyncMock()

        # Fake timing callback
        fake_timing_cb = MagicMock()
        fake_timing_cb.ttfb_ms = 120.0
        fake_timing_cb.duration_ms = 1500.0

        # Fake LLM that yields two chunks
        async def fake_astream(messages):
            for text in ["Hello ", "world!"]:
                chunk = MagicMock()
                chunk.content = text
                yield chunk

        fake_llm = MagicMock()
        fake_llm.astream = fake_astream

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=mock_redis),
            patch("src.services.chat_graph.get_timing_callback", return_value=fake_timing_cb),
            patch("src.services.chat_graph.get_llm", return_value=fake_llm),
            patch("src.services.chat_graph.build_langchain_messages", return_value=[]),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=record)
            result = await node_stream_generate(state)

        # Verify chunk entries were written
        xadd_calls = mock_redis.xadd.call_args_list
        chunk_calls = [c for c in xadd_calls if c.args[1].get("type") == "chunk"]
        done_calls = [c for c in xadd_calls if c.args[1].get("type") == "done"]
        assert len(chunk_calls) == 2
        assert len(done_calls) == 1

        # Verify full_text collected
        assert result["full_text"] == "Hello world!"
        assert result["chunk_count"] == 2
        assert result["total_chars"] == 12
        assert result["error"] is None

        # Verify timing captured
        assert result["ttfb_ms"] == 120.0
        assert result["duration_ms"] == 1500.0


# ---------------------------------------------------------------------------
# node_persist
# ---------------------------------------------------------------------------


class TestNodePersist:
    @pytest.mark.asyncio
    async def test_saves_bot_message(self):
        """node_persist appends bot reply to messages and saves."""
        state = _make_state(
            full_text="Bot reply text", chunk_count=3, total_chars=14, t_request_ms=1000.0
        )
        record = _make_chat_record()
        initial_count = len(record.messages)

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=None),
            patch("src.services.chat_graph.should_fold", return_value=False),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=record)
            await node_persist(state)

        # Bot message should be appended
        assert len(record.messages) == initial_count + 1
        assert record.messages[-1].sender == "bot"
        assert record.messages[-1].message == "Bot reply text"
        record.save.assert_called_once()

    @pytest.mark.asyncio
    async def test_chat_not_found_returns_state_unchanged(self):
        """node_persist returns state unchanged when chat record not found."""
        state = _make_state(full_text="Some text")

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=None),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)
            result = await node_persist(state)

        assert result == state

    @pytest.mark.asyncio
    async def test_records_metrics_when_redis_available(self):
        """node_persist calls record_stream_metrics when Redis is available."""
        state = _make_state(
            full_text="Bot reply",
            chunk_count=5,
            total_chars=9,
            t_request_ms=2000.0,
            ttfb_ms=150.0,
            duration_ms=1800.0,
        )
        record = _make_chat_record()
        mock_redis = AsyncMock()

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=mock_redis),
            patch("src.services.chat_graph.should_fold", return_value=False),
            patch("src.services.chat_graph.record_stream_metrics", new=AsyncMock()) as mock_metrics,
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=record)
            await node_persist(state)

        mock_metrics.assert_called_once_with(
            redis=mock_redis,
            convid="conv-test",
            t_request_ms=2000.0,
            ttfb_ms=150.0,
            duration_ms=1800.0,
            chunk_count=5,
            total_chars=9,
        )

    @pytest.mark.asyncio
    async def test_no_metrics_when_redis_unavailable(self):
        """node_persist does not call record_stream_metrics when Redis is None."""
        state = _make_state(full_text="Bot reply", t_request_ms=2000.0)
        record = _make_chat_record()

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=None),
            patch("src.services.chat_graph.should_fold", return_value=False),
            patch("src.services.chat_graph.record_stream_metrics", new=AsyncMock()) as mock_metrics,
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=record)
            await node_persist(state)

        mock_metrics.assert_not_called()

    @pytest.mark.asyncio
    async def test_fold_summary_updated_when_threshold_reached(self):
        """node_persist updates folded_summary when should_fold returns True."""
        state = _make_state(full_text="Bot reply", t_request_ms=1000.0)
        record = _make_chat_record()

        with (
            patch("src.services.chat_graph.Chat") as mock_chat,
            patch("src.services.chat_graph.get_redis", return_value=None),
            patch("src.services.chat_graph.should_fold", return_value=True),
            patch(
                "src.services.chat_graph.create_fold_summary",
                new=AsyncMock(return_value="Summarized context"),
            ),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=record)
            await node_persist(state)

        assert record.folded_summary == "Summarized context"
