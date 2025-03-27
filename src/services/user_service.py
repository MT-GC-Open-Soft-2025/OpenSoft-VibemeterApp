from src.models.employee import Employee
from fastapi import HTTPException, status

async def get_user_details(emp_id: str):
    user = await Employee.find(Employee.emp_id == emp_id).first_or_none()

    if user:
        return {
            
            "emp_id": user.emp_id,
            #if emotion score there else dont show
            "emotion_score" : user.emotion_score,
            "vibe_score" : user.vibe_score,
            "factors_in_sorted_order" : user.factors_in_sorted_order,
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )