from datetime import datetime
from typing import List

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
    messages: List[Message]
    feedback: str
    summary: str

    class Settings:
        name = "chats"
