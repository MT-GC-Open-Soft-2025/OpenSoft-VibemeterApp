from typing import Dict, Any
from src.services.user_service import get_user_details


async def user_controller(user: Dict[str, Any]) -> Dict[str, Any]:
    return await get_user_details(user["emp_id"])








