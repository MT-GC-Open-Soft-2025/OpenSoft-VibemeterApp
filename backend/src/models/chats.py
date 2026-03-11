from datetime import datetime

from beanie import Document, Indexed
from pydantic import BaseModel


class Message(BaseModel):
    sender: str
    timestamp: datetime
    message: str


class Chat(Document):
    convid: Indexed(str, unique=True)
    empid: Indexed(str)
    initial_prompt: str
    messages: list[Message]
    feedback: str
    summary: str
    agent_id: str | None = None
    agent_name_snapshot: str | None = None
    agent_public_base_url_snapshot: str | None = None
    agent_persona_snapshot: str | None = None
    agent_session_id: str | None = None
    agent_connection_mode: str = "direct"
    agent_session_started_at: datetime | None = None

    # Conversation memory fields
    active_topic: str | None = None
    resolved_topics: list[str] = []
    folded_summary: str = ""
    last_sentiment: str | None = None
    turn_count: int = 0

    class Settings:
        name = "chats"
