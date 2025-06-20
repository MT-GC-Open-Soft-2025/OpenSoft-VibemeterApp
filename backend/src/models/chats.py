# models/chat_model.py
from beanie import Document
from pydantic import BaseModel
from typing import List
from datetime import datetime
from pymongo import ASCENDING


class Message(BaseModel):
    sender: str         
    timestamp: datetime
    message: str

class Chat(Document):
    #hw to make convid unique
    
    convid: str 
    empid: str
    initial_prompt: str
    messages: List[Message]  
    feedback:str
    summary:str
    class Settings:
        name = "chats"
        
