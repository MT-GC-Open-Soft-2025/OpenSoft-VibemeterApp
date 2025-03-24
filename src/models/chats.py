# models/chat_model.py
from beanie import Document
from pydantic import BaseModel
from typing import List
from datetime import datetime

class Message(BaseModel):
    sender: str         
    timestamp: datetime
    message: str

class Chat(Document):
    convid: str
    empid: str
    messages: List[Message]  
    class Settings:
        name = "chats"
