

import motor.motor_asyncio
from beanie import init_beanie


from .employee import Employee
from .chats import Chat
from .feedback_ratings import Feedback_ratings
from dotenv import load_dotenv
load_dotenv()
import os
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")




async def init_db():
   
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]

   
    await init_beanie(database=db, document_models=[Employee, Chat, Feedback_ratings])
