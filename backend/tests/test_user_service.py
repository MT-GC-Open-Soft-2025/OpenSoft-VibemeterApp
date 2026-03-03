"""Tests for src.services.user_service."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from src.services.user_service import get_all_convoid, get_user_details


class TestGetUserDetails:
    """Tests for get_user_details."""

    @pytest.mark.asyncio
    async def test_user_not_found(self):
        """get_user_details with non-existent user raises 404."""
        with patch("src.services.user_service.Employee") as mock_employee:
            mock_employee.find.return_value.first_or_none = AsyncMock(return_value=None)

            with pytest.raises(HTTPException) as exc_info:
                await get_user_details("unknown")

            assert exc_info.value.status_code == 404
            assert "User not found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_user_found_returns_details(self, mock_employee):
        """get_user_details returns user data."""
        with patch("src.services.user_service.Employee") as mock_employee_cls:
            mock_employee_cls.find.return_value.first_or_none = AsyncMock(
                return_value=mock_employee
            )

            result = await get_user_details("emp001")

            assert result["emp_id"] == "emp001"
            assert result["role"] == "employee"
            assert result["total_work_hours"] == 8.5
            assert result["leave_days"] == 5.0
            assert result["reward_points"] == 100
            assert result["award_list"] == ["Star Performer"]
            assert result["factors_in_sorted_order"] == ["leaves", "performance"]


class TestGetAllConvoid:
    """Tests for get_all_convoid."""

    @pytest.mark.asyncio
    async def test_no_chats_returns_empty_list(self):
        """User with no chats gets empty convid_list."""
        with patch("src.services.user_service.Chat") as mock_chat:
            mock_chat.find.return_value.to_list = AsyncMock(return_value=[])

            result = await get_all_convoid("emp001")

            assert result["convid_list"] == []

    @pytest.mark.asyncio
    async def test_returns_convid_list(self):
        """Returns list of conversation IDs."""
        with patch("src.services.user_service.Chat") as mock_chat:
            chat1 = MagicMock()
            chat1.convid = "conv-001"
            chat2 = MagicMock()
            chat2.convid = "conv-002"
            mock_chat.find.return_value.to_list = AsyncMock(return_value=[chat1, chat2])

            result = await get_all_convoid("emp001")

            assert result["convid_list"] == ["conv-001", "conv-002"]
