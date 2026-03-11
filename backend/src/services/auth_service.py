import logging
import time

import bcrypt
import jwt
from fastapi import HTTPException, status

from src.config import get_settings
from src.models.employee import Employee

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


async def signin(username: str, password: str) -> dict[str, str]:
    settings = get_settings()

    user_record = await Employee.find(Employee.emp_id == username).first_or_none()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # If password_hash exists, verify the password
    if user_record.password_hash:
        if not verify_password(password, user_record.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
    else:
        # First login: set password
        user_record.password_hash = hash_password(password)
        await user_record.save()

    payload = {
        "emp_id": user_record.emp_id,
        "role": user_record.role,
        "iat": int(time.time()),
        "exp": int(time.time()) + int(settings.token_expiry_seconds),
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return {"access_token": token, "token_type": "Bearer", "role": user_record.role}
