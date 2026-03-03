from typing import Any, Dict

from src.services.user_service import get_all_convoid, get_user_details


async def user_controller(user: Dict[str, Any]) -> Dict[str, Any]:
    return await get_user_details(user["emp_id"])


async def convoid_controller(user: Dict[str, Any]) -> Dict[str, Any]:
    return await get_all_convoid(user["emp_id"])
