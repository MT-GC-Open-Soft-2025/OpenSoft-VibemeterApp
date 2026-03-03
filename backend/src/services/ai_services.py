import asyncio
import json
import logging

import google.genai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

from src.config import get_settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_key)
    return _client


def initialize():
    try:
        settings = get_settings()
        client = _get_client()
        chat = client.chats.create(model=settings.gemini_model)
        return chat
    except Exception as e:
        logger.error("Failed to initialize AI chat: %s", e)
        return {"error": str(e)}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
def generate_response(user_input: str, chat1) -> str:
    response = chat1.send_message(user_input)
    return response.text


def generate_response_stream(user_input: str, chat1):
    """Sync generator that yields text chunks from the model. Runs in executor for async use."""
    try:
        for chunk in chat1.send_message_stream(user_input):
            yield chunk.text or ""
    except Exception as e:
        logger.error("Streaming error: %s", e)
        raise


async def stream_response_sse(user_input: str, chat1):
    """Async generator that yields SSE-formatted chunks. Runs sync stream in executor."""
    loop = asyncio.get_running_loop()
    queue = asyncio.Queue()

    def run_stream():
        try:
            for text in generate_response_stream(user_input, chat1):
                loop.call_soon_threadsafe(queue.put_nowait, ("chunk", text))
        except Exception as e:
            loop.call_soon_threadsafe(queue.put_nowait, ("error", str(e)))
        loop.call_soon_threadsafe(queue.put_nowait, ("done", None))

    loop.run_in_executor(None, run_stream)

    while True:
        msg_type, value = await queue.get()
        if msg_type == "error":
            yield f"data: {json.dumps({'error': value})}\n\n"
            break
        if msg_type == "done":
            yield f"data: {json.dumps({'done': True})}\n\n"
            break
        yield f"data: {json.dumps({'text': value})}\n\n"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
def summarize_text(text, chatObj):
    prompt = (
        "Based on current conversation between bot and user, summarize it in points in"
        " concise and clear manner highlighting the problems faced by user and how bot"
        " helps him. In the end give the main issue in 1-2 lines why you think user is"
        " sad, in case he admits that he is sad. Also analyse sentiment on scale of 0-1"
        " as to how intense is his situation and say whether HR needs to intervene or not."
        f"\n\n{text}"
    )
    response = chatObj.send_message(prompt)
    return response.text
