"""Tests for src.services.chat_service."""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from src.models.chats import Message
from src.services.chat_service import (
    _verify_chat_ownership,
    add_feedback,
    end_chat,
    get_chat,
    get_chat_feedback,
    get_feedback_questions,
    initiate_chat_service,
    send_message_stream_redis,
)


class TestGetFeedbackQuestions:
    """Tests for get_feedback_questions."""

    @pytest.mark.asyncio
    async def test_returns_feedback_questions(self):
        """get_feedback_questions returns questions from JSON file."""
        result = await get_feedback_questions()
        assert "response" in result
        questions = result["response"]
        assert isinstance(questions, list)
        assert len(questions) > 0
        assert "question_id" in questions[0]
        assert "question_text" in questions[0]


class TestVerifyChatOwnership:
    """Tests for _verify_chat_ownership."""

    @pytest.mark.asyncio
    async def test_owner_passes(self):
        """Chat owner passes verification."""
        chat = MagicMock()
        chat.empid = "emp001"
        await _verify_chat_ownership(chat, "emp001")

    @pytest.mark.asyncio
    async def test_non_owner_raises_403(self):
        """Non-owner raises 403."""
        chat = MagicMock()
        chat.empid = "emp001"
        with pytest.raises(HTTPException) as exc_info:
            await _verify_chat_ownership(chat, "other_emp")
        assert exc_info.value.status_code == 403
        assert "access" in str(exc_info.value.detail).lower()


class TestGetChat:
    """Tests for get_chat."""

    @pytest.mark.asyncio
    async def test_chat_not_found(self):
        """get_chat with non-existent conv_id raises 404."""
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await get_chat("nonexistent", "emp001")

            assert exc_info.value.status_code == 404
            assert "Chat not found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_returns_messages(self):
        """get_chat returns messages for owner."""
        chat = MagicMock()
        chat.empid = "emp001"
        chat.messages = [
            Message(sender="bot", timestamp=datetime.now(), message="Hello"),
        ]
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)

            result = await get_chat("conv-001", "emp001")

            assert "chat" in result
            assert len(result["chat"]) == 1
            assert result["chat"][0].sender == "bot"


class TestGetChatFeedback:
    """Tests for get_chat_feedback."""

    @pytest.mark.asyncio
    async def test_returns_feedback(self):
        """get_chat_feedback returns feedback string."""
        chat = MagicMock()
        chat.empid = "emp001"
        chat.feedback = "Great session!"
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)

            result = await get_chat_feedback("conv-001", "emp001")

            assert result["feedback"] == "Great session!"


class TestAddFeedback:
    """Tests for add_feedback."""

    @pytest.mark.asyncio
    async def test_add_feedback_success(self):
        """add_feedback inserts and returns success."""
        with patch("src.services.chat_service.Feedback_ratings", MagicMock()) as mock_fb:
            mock_instance = MagicMock()
            mock_instance.insert = AsyncMock(return_value=None)
            mock_fb.return_value = mock_instance

            result = await add_feedback(
                {"Q1": 4, "Q2": 5, "Q3": 3, "Q4": 4, "Q5": 5},
                emp_id="emp001",
            )

            assert result["response"] == "Feedback added successfully"
            mock_instance.insert.assert_called_once()


class TestInitiateChatService:
    """Tests for initiate_chat_service."""

    @pytest.mark.asyncio
    async def test_employee_not_found_raises_404(self):
        """initiate_chat_service with non-existent employee raises 404."""
        with patch("src.services.chat_service.Employee") as mock_employee:
            mock_employee.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await initiate_chat_service("conv-001", {"emp_id": "unknown"}, "anchor")

            assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_agent_start_failure_raises_503(self, mock_employee):
        """initiate_chat_service when agent start fails raises 503."""
        with patch("src.services.chat_service.Employee") as mock_emp_cls:
            mock_emp_cls.find.return_value.first_or_none = AsyncMock(return_value=mock_employee)
            with patch(
                "src.services.chat_service.get_agent_location", new_callable=AsyncMock
            ) as agent_loc:
                with patch(
                    "src.services.chat_service._start_agent_session", new_callable=AsyncMock
                ) as start_session:
                    with patch("src.services.chat_service.Chat") as chat_cls:
                        chat_instance = MagicMock()
                        chat_instance.insert = AsyncMock()
                        chat_cls.return_value = chat_instance
                        agent_loc.return_value = MagicMock(
                            agent_id="anchor",
                            slug="anchor",
                            display_name="Anchor",
                            public_base_url="http://localhost:8101",
                            persona_key="anchor",
                            base_url="http://localhost:8101",
                        )
                        start_session.side_effect = Exception("runtime down")

                        with pytest.raises(HTTPException) as exc_info:
                            await initiate_chat_service("conv-001", {"emp_id": "emp001"}, "anchor")

                        assert exc_info.value.status_code == 503
                        assert "unavailable" in str(exc_info.value.detail).lower()


class TestEndChat:
    """Tests for end_chat."""

    @pytest.mark.asyncio
    async def test_chat_not_found_raises_404(self):
        """end_chat with non-existent chat raises 404."""
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await end_chat("nonexistent", "Great!", "emp001")

            assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_feedback_already_given_raises_value_error(self):
        """end_chat when feedback already given raises ValueError."""
        chat = MagicMock()
        chat.empid = "emp001"
        chat.feedback = "Already given"
        chat.messages = []
        chat.save = AsyncMock()
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)

            with pytest.raises(ValueError) as exc_info:
                await end_chat("conv-001", "New feedback", "emp001")

            assert "Feedback already given" in str(exc_info.value)


class TestSendMessageStreamRedis:
    """Tests for send_message_stream_redis."""

    @pytest.mark.asyncio
    async def test_raises_404_when_chat_not_found(self):
        """send_message_stream_redis raises 404 if the chat does not exist."""
        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await send_message_stream_redis({"emp_id": "emp001"}, "Hello", "conv-001")

            assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_raises_403_for_wrong_owner(self):
        """send_message_stream_redis raises 403 when user does not own the chat."""
        chat = MagicMock()
        chat.empid = "emp-other"
        chat.messages = []

        with patch("src.services.chat_service.Chat") as mock_chat:
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)

            with pytest.raises(HTTPException) as exc_info:
                await send_message_stream_redis({"emp_id": "emp001"}, "Hello", "conv-001")

            assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_returns_stream_key_string(self):
        """send_message_stream_redis returns a non-empty stream key on success."""
        chat = MagicMock()
        chat.empid = "emp001"
        chat.messages = []
        chat.initial_prompt = "system prompt"
        chat.active_topic = None
        chat.resolved_topics = []
        chat.turn_count = 0
        chat.last_sentiment = None
        chat.folded_summary = ""
        chat.save = AsyncMock()

        with (
            patch("src.services.chat_service.Chat") as mock_chat,
            patch(
                "src.services.chat_service.make_stream_key",
                return_value="stream:chat:conv-001:abc12345",
            ),
            # Mock the graph directly so no unawaited coroutine warning is raised.
            patch("src.services.chat_service.chat_turn_graph") as mock_graph,
        ):
            mock_graph.ainvoke = AsyncMock(return_value={})
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)

            result = await send_message_stream_redis({"emp_id": "emp001"}, "Hello", "conv-001")

        assert result == "stream:chat:conv-001:abc12345"
        chat.save.assert_called_once()  # user message persisted immediately


class TestSendMessageWithMemory:
    """Tests for send_message memory integration."""

    @pytest.mark.asyncio
    async def test_send_message_updates_turn_count(self):
        """send_message increments turn_count via update_chat_memory."""
        from src.services.chat_service import send_message

        chat = MagicMock()
        chat.empid = "emp001"
        chat.messages = []
        chat.initial_prompt = "You are a wellness bot."
        chat.active_topic = None
        chat.resolved_topics = []
        chat.turn_count = 2
        chat.last_sentiment = None
        chat.folded_summary = ""
        chat.save = AsyncMock()

        with (
            patch("src.services.chat_service.Chat") as mock_chat,
            patch(
                "src.services.chat_service.generate_response_async",
                new=AsyncMock(return_value="Bot reply"),
            ),
            patch("src.services.chat_service.should_fold", return_value=False),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)
            result = await send_message({"emp_id": "emp001"}, "Hello", "conv-001")

        assert result["response"] == "Bot reply"
        assert chat.turn_count == 3  # incremented from 2 to 3

    @pytest.mark.asyncio
    async def test_send_message_uses_langchain_messages(self):
        """send_message calls build_langchain_messages to build context."""
        from src.services.chat_service import send_message

        chat = MagicMock()
        chat.empid = "emp001"
        chat.messages = []
        chat.initial_prompt = "You are a wellness bot."
        chat.active_topic = None
        chat.resolved_topics = []
        chat.turn_count = 0
        chat.last_sentiment = None
        chat.folded_summary = ""
        chat.save = AsyncMock()

        fake_messages = ["fake_message_list"]

        with (
            patch("src.services.chat_service.Chat") as mock_chat,
            patch(
                "src.services.chat_service.build_langchain_messages", return_value=fake_messages
            ) as mock_build,
            patch(
                "src.services.chat_service.generate_response_async",
                new=AsyncMock(return_value="Reply"),
            ) as mock_gen,
            patch("src.services.chat_service.should_fold", return_value=False),
        ):
            mock_chat.find.return_value.first_or_none = AsyncMock(return_value=chat)
            await send_message({"emp_id": "emp001"}, "Hello", "conv-001")

        mock_build.assert_called_once_with(chat)
        mock_gen.assert_called_once_with(fake_messages)
