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
        client = _get_client()
        chat = client.chats.create(model="gemini-2.0-flash")
        return chat
    except Exception as e:
        logger.error("Failed to initialize AI chat: %s", e)
        return {"error": str(e)}


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
def generate_response(user_input: str, chat1) -> str:
    response = chat1.send_message(user_input)
    return response.text


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
