import asyncio
import json
import logging

import google.genai as genai

from config import get_settings

logger = logging.getLogger(__name__)

_client = None


def _get_client():
    global _client
    if _client is None:
        settings = get_settings()
        _client = genai.Client(api_key=settings.gemini_key)
    return _client


async def stream_response_sse(system_prompt: str, user_input: str):
    loop = asyncio.get_running_loop()
    queue = asyncio.Queue()

    def run_stream():
        try:
            settings = get_settings()
            client = _get_client()
            stream = client.models.generate_content_stream(
                model=settings.gemini_model,
                contents=f"{system_prompt}\n\nUser: {user_input}",
            )
            for chunk in stream:
                loop.call_soon_threadsafe(queue.put_nowait, ("chunk", chunk.text or ""))
        except Exception as exc:
            logger.error("Runtime stream error: %s", exc)
            loop.call_soon_threadsafe(queue.put_nowait, ("error", str(exc)))
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
