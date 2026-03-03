
from fastapi import HTTPException, status

from src.models.chats import Chat
from src.models.employee import Employee


async def get_user_details(emp_id: str):
    user = await Employee.find(Employee.emp_id == emp_id).first_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return {
        "emp_id": user.emp_id,
        "role": user.role,
        "total_work_hours": user.total_work_hours,
        "leave_days": user.leave_days,
        "types_of_leave": user.types_of_leaves,
        "feedback": user.feedback,
        "weighted_performance": user.weighted_performance,
        "reward_points": user.reward_points,
        "award_list": user.award_list,
        "vibe_score": user.vibe_score,
        "factors_in_sorted_order": user.factors_in_sorted_order,
    }


async def get_all_convoid(emp_id: str):
    matched_chats = await Chat.find(Chat.empid == emp_id).to_list()
    convid_list: list[str] = [chat.convid for chat in matched_chats]
    return {"convid_list": convid_list}
