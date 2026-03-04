import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Any
from uuid import uuid4

import httpx
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from jwt import InvalidTokenError
from pydantic import BaseModel, Field

from ai import stream_response_sse
from config import get_settings
from personas import get_persona
from session_store import store

import jwt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SessionStartPayload(BaseModel):
    convo_id: str
    emp_id: str
    session_token: str
    chat_context: str


class RuntimeMessagePayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


def decode_session_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        return jwt.decode(
            token,
            settings.agent_session_signing_secret,
            algorithms=["HS256"],
        )
    except InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid session token") from exc


async def sync_to_main_backend(path: str, payload: dict[str, Any]) -> None:
    settings = get_settings()
    headers = {"X-Agent-Sync-Secret": settings.agent_internal_sync_secret}
    last_error = None
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{settings.main_backend_internal_url.rstrip('/')}/{path.lstrip('/')}",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                return
        except Exception as exc:
            last_error = exc
            await asyncio.sleep(0.5 * (attempt + 1))
    logger.error("Failed to sync %s after retries: %s", path, last_error)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await store.connect()
    yield


app = FastAPI(lifespan=lifespan, title="WellBee Agent Runtime")
settings = get_settings()
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    settings = get_settings()
    persona = get_persona(settings.agent_persona_key)
    return {
        "status": "healthy",
        "agent_id": settings.agent_id,
        "display_name": settings.agent_display_name,
        "persona_key": settings.agent_persona_key,
        "style": persona["style"],
    }


@app.post("/v1/session/start")
async def start_session(payload: SessionStartPayload):
    claims = decode_session_token(payload.session_token)
    expected_runtime_id = get_settings().agent_id
    token_runtime_id = claims.get("agent_runtime_id", claims.get("agent_id"))
    if token_runtime_id != expected_runtime_id or claims.get("convo_id") != payload.convo_id:
        raise HTTPException(status_code=401, detail="Session token does not match runtime")

    agent_session_id = str(uuid4())
    persona = get_persona(get_settings().agent_persona_key)
    opener = persona["opener"]
    session = {
        "agent_session_id": agent_session_id,
        "convo_id": payload.convo_id,
        "emp_id": payload.emp_id,
        "session_token": payload.session_token,
        "chat_context": payload.chat_context,
        "history": [{"sender": "bot", "message": opener}],
    }
    await store.set(agent_session_id, session)
    asyncio.create_task(
        sync_to_main_backend(
            "agent-sync/session-started",
            {"convo_id": payload.convo_id, "agent_session_id": agent_session_id},
        )
    )
    return {"agent_session_id": agent_session_id, "opener": opener}


@app.post("/v1/session/{agent_session_id}/message")
async def send_message(
    agent_session_id: str,
    payload: RuntimeMessagePayload,
    authorization: str | None = Header(default=None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing session token")
    token = authorization.split(" ", 1)[1]
    claims = decode_session_token(token)
    session = await store.get(agent_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["session_token"] != token or claims.get("convo_id") != session["convo_id"]:
        raise HTTPException(status_code=401, detail="Session token mismatch")

    persona = get_persona(get_settings().agent_persona_key)
    history_text = "\n".join(f"{item['sender']}: {item['message']}" for item in session["history"])
    system_prompt = (
        f"You are {persona['display_name']}. Your conversational style is {persona['style']}."
        f" Follow this counseling context:\n{session['chat_context']}\n\n"
        f"Conversation so far:\n{history_text}\n"
        "Respond in under 100 words unless the user asks for more detail."
    )

    async def stream():
        collected: list[str] = []
        async for chunk in stream_response_sse(system_prompt, payload.message):
            if chunk.startswith("data: "):
                try:
                    data = json.loads(chunk[6:].strip())
                    if "text" in data:
                        collected.append(data["text"])
                except json.JSONDecodeError:
                    pass
            yield chunk

        bot_message = "".join(collected)
        session["history"].append({"sender": "user", "message": payload.message})
        session["history"].append({"sender": "bot", "message": bot_message})
        await store.set(agent_session_id, session)
        asyncio.create_task(
            sync_to_main_backend(
                "agent-sync/turn-completed",
                {
                    "convo_id": session["convo_id"],
                    "agent_session_id": agent_session_id,
                    "user_message": payload.message,
                    "bot_message": bot_message,
                },
            )
        )

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
