import motor.motor_asyncio
from beanie import init_beanie

from src.config import get_settings

from .chats import Chat
from .employee import Employee
from .feedback_ratings import Feedback_ratings


async def init_db():
    settings = get_settings()
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.db_name]
    await init_beanie(database=db, document_models=[Employee, Chat, Feedback_ratings])
