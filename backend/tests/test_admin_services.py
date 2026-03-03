"""Tests for src.services.admin_services."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from src.services.admin_services import (
    fetch_average_feedback_score,
    fetch_employee_conversation,
    fetch_employee_conversationFeedback_byId,
    fetch_employee_conversationSummary_byId,
    fetch_employee_data,
    get_all_employees,
    specific_conversation,
)


class TestGetAllEmployees:
    """Tests for get_all_employees."""

    @pytest.mark.asyncio
    async def test_returns_employee_list(self, mock_employee):
        """get_all_employees returns list of employees."""
        with patch("src.services.admin_services.Employee") as mock_emp:
            mock_emp.find_all.return_value.to_list = AsyncMock(
                return_value=[mock_employee]
            )

            result = await get_all_employees()

            assert len(result) == 1
            assert result[0].emp_id == "emp001"


class TestFetchEmployeeData:
    """Tests for fetch_employee_data."""

    @pytest.mark.asyncio
    async def test_employee_not_found_raises_404(self):
        """fetch_employee_data with non-existent employee raises 404."""
        with patch("src.services.admin_services.Employee") as mock_emp:
            mock_emp.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await fetch_employee_data("unknown")

            assert exc_info.value.status_code == 404
            assert "Employee not found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_returns_user_record(self, mock_employee):
        """fetch_employee_data returns user_record dict."""
        with patch("src.services.admin_services.Employee") as mock_emp:
            mock_emp.find.return_value.first_or_none = AsyncMock(
                return_value=mock_employee
            )

            result = await fetch_employee_data("emp001")

            assert "user_record" in result
            assert result["user_record"].emp_id == "emp001"


class TestFetchEmployeeConversation:
    """Tests for fetch_employee_conversation."""

    @pytest.mark.asyncio
    async def test_returns_empty_when_no_chats(self):
        """fetch_employee_conversation returns empty list when no chats."""
        with patch("src.services.admin_services.Chat") as mock_chat:
            mock_chat.find.return_value.to_list = AsyncMock(return_value=[])

            result = await fetch_employee_conversation("emp001")

            assert result == []

    @pytest.mark.asyncio
    async def test_returns_convid_list(self):
        """fetch_employee_conversation returns list of convids."""
        chat1 = MagicMock()
        chat1.convid = "conv-001"
        chat2 = MagicMock()
        chat2.convid = "conv-002"
        with patch("src.services.admin_services.Chat") as mock_chat:
            mock_chat.find.return_value.to_list = AsyncMock(
                return_value=[chat1, chat2]
            )

            result = await fetch_employee_conversation("emp001")

            assert result == ["conv-001", "conv-002"]


class TestSpecificConversation:
    """Tests for specific_conversation."""

    @pytest.mark.asyncio
    async def test_conversation_not_found_raises_404(self):
        """specific_conversation with non-existent convo raises 404."""
        with patch("src.services.admin_services.Chat") as mock_chat:
            mock_chat.find_one = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await specific_conversation("emp001", "nonexistent")

            assert exc_info.value.status_code == 404
            assert "Conversation not found" in str(exc_info.value.detail)


class TestFetchEmployeeConversationFeedbackById:
    """Tests for fetch_employee_conversationFeedback_byId."""

    @pytest.mark.asyncio
    async def test_chat_not_found_raises_404(self):
        """Raises 404 when chat not found."""
        with patch("src.services.admin_services.Chat") as mock_chat:
            mock_chat.find_one = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await fetch_employee_conversationFeedback_byId("emp001", "conv-001")

            assert exc_info.value.status_code == 404


class TestFetchEmployeeConversationSummaryById:
    """Tests for fetch_employee_conversationSummary_byId."""

    @pytest.mark.asyncio
    async def test_chat_not_found_raises_404(self):
        """Raises 404 when chat not found."""
        with patch("src.services.admin_services.Chat") as mock_chat:
            mock_chat.find_one = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await fetch_employee_conversationSummary_byId("emp001", "conv-001")

            assert exc_info.value.status_code == 404


class TestFetchAverageFeedbackScore:
    """Tests for fetch_average_feedback_score."""

    @pytest.mark.asyncio
    async def test_empty_feedbacks_returns_zeros(self):
        """Returns list of zeros when no feedbacks."""
        with patch("src.services.admin_services.Feedback_ratings") as mock_fb:
            mock_fb.find_all.return_value.to_list = AsyncMock(return_value=[])

            result = await fetch_average_feedback_score()

            assert result == [0.0, 0.0, 0.0, 0.0, 0.0]

    @pytest.mark.asyncio
    async def test_computes_average(self):
        """Computes average of Q1-Q5 across feedbacks."""
        fb1 = MagicMock()
        fb1.Q1, fb1.Q2, fb1.Q3, fb1.Q4, fb1.Q5 = 4, 4, 4, 4, 4
        fb2 = MagicMock()
        fb2.Q1, fb2.Q2, fb2.Q3, fb2.Q4, fb2.Q5 = 2, 2, 2, 2, 2
        with patch("src.services.admin_services.Feedback_ratings") as mock_fb:
            mock_fb.find_all.return_value.to_list = AsyncMock(
                return_value=[fb1, fb2]
            )

            result = await fetch_average_feedback_score()

            assert result == [3.0, 3.0, 3.0, 3.0, 3.0]
