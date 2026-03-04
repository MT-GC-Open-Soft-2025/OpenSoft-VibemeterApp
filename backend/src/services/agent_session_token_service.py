import time
from typing import Any

import jwt

from src.config import get_settings


def create_agent_session_token(
    *,
    agent_id: str,
    agent_runtime_id: str | None,
    convo_id: str,
    emp_id: str,
    public_base_url: str,
) -> str:
    settings = get_settings()
    now = int(time.time())
    payload = {
        "sub": "agent-session",
        "agent_id": agent_id,
        "agent_runtime_id": agent_runtime_id or agent_id,
        "convo_id": convo_id,
        "emp_id": emp_id,
        "public_base_url": public_base_url,
        "iat": now,
        "exp": now + settings.agent_bootstrap_token_ttl_seconds,
    }
    return jwt.encode(
        payload,
        settings.agent_session_signing_secret,
        algorithm=settings.jwt_algorithm,
    )


def decode_agent_session_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(
        token,
        settings.agent_session_signing_secret,
        algorithms=[settings.jwt_algorithm],
    )
