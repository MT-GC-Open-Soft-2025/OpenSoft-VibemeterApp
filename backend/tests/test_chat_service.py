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
                await initiate_chat_service("conv-001", {"emp_id": "unknown"})

            assert exc_info.value.status_code == 404

    @pytest.mark.asyncio
    async def test_ai_init_failure_raises_503(self, mock_employee):
        """initiate_chat_service when AI init fails raises 503."""
        with patch("src.services.chat_service.Employee") as mock_emp_cls:
            mock_emp_cls.find.return_value.first_or_none = AsyncMock(return_value=mock_employee)
            with patch("src.services.chat_service.initi") as mock_init:
                mock_init.return_value = {"error": "API key invalid"}

                with pytest.raises(HTTPException) as exc_info:
                    await initiate_chat_service("conv-001", {"emp_id": "emp001"})

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
