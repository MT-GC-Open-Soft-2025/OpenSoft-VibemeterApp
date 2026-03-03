import logging
from typing import Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.config import get_settings

logger = logging.getLogger(__name__)

bearer_scheme = HTTPBearer()


def authenticate(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict:
    settings = get_settings()
    token = credentials.credentials

    try:
        user = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )


def adminauthenticate(
    user: dict = Depends(authenticate),
) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin only.",
        )
    return user
