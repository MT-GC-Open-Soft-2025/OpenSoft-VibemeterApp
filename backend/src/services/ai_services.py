"""AI service layer — backed by LangChain + Google Gemini.

This module provides the primary interface for all LLM interactions in the
WellBee backend.  It replaces the direct ``google.genai`` SDK calls with
LangChain's ``ChatGoogleGenerativeAI`` which gives us:

- Native async ``astream()`` (no more ``run_in_executor`` threading)
- Standardised callback system (used by ``StreamTimingCallback``)
- Proper structured messages (SystemMessage / HumanMessage / AIMessage)
- Easy LLM provider swap in the future
"""

import json
import logging

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from src.config import get_settings
from src.services.stream_timing_callback import StreamTimingCallback

logger = logging.getLogger(__name__)

_llm: ChatGoogleGenerativeAI | None = None


def get_llm(callbacks: list | None = None) -> ChatGoogleGenerativeAI:
    """Return a (singleton when no callbacks) ChatGoogleGenerativeAI instance."""
    global _llm
    settings = get_settings()
    if callbacks is None:
        # Reuse singleton for calls that don't need per-request callbacks.
        if _llm is None:
            _llm = ChatGoogleGenerativeAI(
                model=settings.gemini_model,
                google_api_key=settings.gemini_key,
            )
        return _llm
    # With callbacks, return a fresh instance so callback state is isolated.
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.gemini_key,
        callbacks=callbacks,
    )


def initialize():
    """Backward-compatible initialisation stub.

    Returns the shared LLM instance or ``{"error": "..."}`` on failure.
    Callers should check ``isinstance(result, dict) and "error" in result``.
    """
    try:
        return get_llm()
    except Exception as exc:
        logger.error("Failed to initialise AI service: %s", exc)
        return {"error": str(exc)}


async def generate_response_async(messages: list) -> str:
    """Async invoke: pass a list of LangChain messages, return the reply text."""
    llm = get_llm()
    response = await llm.ainvoke(messages)
    return response.content


def generate_response(user_input: str, llm_or_chat) -> str:  # noqa: ANN001
    """Backward-compatible sync generate.

    Accepts the LLM object returned by ``initialize()``.
    Runs the LLM synchronously via ``invoke``.
    """
    if isinstance(llm_or_chat, dict):
        raise ValueError("AI service not initialised")
    llm = llm_or_chat
    response = llm.invoke([HumanMessage(content=user_input)])
    return response.content


async def stream_response_sse(
    messages_or_prompt: list | str, llm_or_chat=None, callbacks: list | None = None
):
    """Async generator yielding SSE-formatted text chunks.

    Supports two calling conventions:
    - New: ``stream_response_sse(messages_list, callbacks=[...])``
    - Legacy: ``stream_response_sse(prompt_string, chat_obj)``
    """
    if isinstance(messages_or_prompt, str):
        # Legacy interface: wrap in a single HumanMessage
        messages = [HumanMessage(content=messages_or_prompt)]
    else:
        messages = messages_or_prompt

    llm = get_llm(callbacks=callbacks)
    try:
        async for chunk in llm.astream(messages):
            text = chunk.content
            if text:
                yield f"data: {json.dumps({'text': text})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"
    except Exception as exc:
        logger.error("stream_response_sse error: %s", exc)
        yield f"data: {json.dumps({'error': str(exc)})}\n\n"


async def stream_response_sse_with_system_prompt(
    system_prompt: str, user_input: str, model: str | None = None
):
    """Stream with explicit system prompt and user input."""
    from langchain_core.messages import SystemMessage

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_input),
    ]
    async for chunk in stream_response_sse(messages):
        yield chunk


def generate_response_with_system_prompt(
    system_prompt: str, user_input: str, model: str | None = None
) -> str:
    """Sync generate with system prompt."""
    from langchain_core.messages import SystemMessage

    llm = get_llm()
    response = llm.invoke(
        [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_input),
        ]
    )
    return response.content


async def summarize_text_async(text: str) -> str:
    """Async chat summarization using LangChain."""
    prompt = (
        "Based on the current conversation between bot and user, summarize it in points in "
        "a concise and clear manner highlighting the problems faced by the user and how the bot "
        "helps them. In the end give the main issue in 1-2 lines explaining why you think the user "
        "is sad (if they admit to being sad). Also analyse the sentiment on a scale of 0-1 as to "
        "how intense the situation is and say whether HR needs to intervene or not."
        f"\n\n{text}"
    )
    llm = get_llm()
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    return response.content


def summarize_text(text: str, llm_or_chat=None) -> str:
    """Backward-compatible sync summarize."""
    prompt = (
        "Based on the current conversation between bot and user, summarize it in points in "
        "a concise and clear manner highlighting the problems faced by the user and how the bot "
        "helps them. In the end give the main issue in 1-2 lines explaining why you think the user "
        "is sad (if they admit to being sad). Also analyse the sentiment on a scale of 0-1 as to "
        "how intense the situation is and say whether HR needs to intervene or not."
        f"\n\n{text}"
    )
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content


def get_timing_callback() -> StreamTimingCallback:
    """Convenience factory for StreamTimingCallback."""
    return StreamTimingCallback()
