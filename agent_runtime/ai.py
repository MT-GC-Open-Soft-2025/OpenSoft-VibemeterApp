"""Agent runtime AI layer — LangChain-backed streaming.

Replaces the direct ``google.genai`` SDK calls with LangChain's
``ChatGoogleGenerativeAI``, which provides:
- Native async ``astream()`` — no more executor threading
- Proper structured chat messages instead of text concatenation
"""

import json
import logging

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from config import get_settings

logger = logging.getLogger(__name__)

_llm: ChatGoogleGenerativeAI | None = None


def get_llm() -> ChatGoogleGenerativeAI:
    global _llm
    if _llm is None:
        settings = get_settings()
        _llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_key,
        )
    return _llm


def build_messages(system_prompt: str, history: list[dict], user_input: str) -> list:
    """Build a structured LangChain message list from session history."""
    messages: list = [SystemMessage(content=system_prompt)]
    for item in history:
        sender = item.get("sender", "")
        text = item.get("message", "")
        if sender == "user":
            messages.append(HumanMessage(content=text))
        elif sender == "bot":
            messages.append(AIMessage(content=text))
    messages.append(HumanMessage(content=user_input))
    return messages


async def stream_response_sse(system_prompt: str, user_input: str, history: list[dict] | None = None):
    """Async generator yielding SSE-formatted chunks.

    Backward-compatible signature (still accepts system_prompt + user_input) but
    now also accepts history for proper multi-turn context.
    """
    messages = build_messages(system_prompt, history or [], user_input)
    llm = get_llm()

    try:
        async for chunk in llm.astream(messages):
            text = chunk.content
            if text:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as exc:
        logger.error("Runtime stream error: %s", exc)
        yield f"data: {json.dumps({'error': str(exc)})}\n\n"
