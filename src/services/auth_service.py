import time
import jwt
from fastapi import HTTPException, status
from typing import Dict
import os
from dotenv import load_dotenv
from src.models.employee import Employee
load_dotenv()
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
TOKEN_EXPIRY_SECONDS = os.getenv("TOKEN_EXPIRY_SECONDS")


async def signin(username:str) -> Dict[str, str]:
   
    user_record = await Employee.find(Employee.emp_id == username).first_or_none()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username"
        )

    
    payload = {
        "emp_id": user_record.emp_id, 
        "total_work_hours": user_record.total_work_hours,
        "leave_days": user_record.leave_days,
        "types_of_leave": user_record.types_of_leaves,
        "feedback": user_record.feedback,
        "weighted_performance": user_record.weighted_performance,
        "reward_points": user_record.reward_points,
        "award_list": user_record.award_list,        
        "vibe_score" : user_record.vibe_score,
        "factors_in_sorted_order" : user_record.factors_in_sorted_order,
        "iat": int(time.time()),
        "exp": int(time.time()) + int(TOKEN_EXPIRY_SECONDS)
    }

    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    print("token", token)

    return {
        "access_token": token,
        "token_type": "Bearer"
    }
