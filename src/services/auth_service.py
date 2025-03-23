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
         
        "iat": int(time.time()),
        "exp": int(time.time()) + int(TOKEN_EXPIRY_SECONDS)
    }

    
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": token,
        "token_type": "Bearer"
    }
