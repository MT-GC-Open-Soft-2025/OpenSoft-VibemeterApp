from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  #Import CORS middleware
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from src.models.database import init_db
from src.models.chats import Chat, Message
from datetime import datetime, timezone
from src.routes.auth_routes import auth_router
from src.routes.user_routes import user_router  
from src.routes.chat_routes import chat_router

#enable cors
from fastapi.middleware.cors import CORSMiddleware



from src.routes.admin_routes import admin_router
import os

load_dotenv()

uri = os.getenv("MONGO_URI")

client = MongoClient(uri, server_api=ServerApi("1"))

try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


async def lifespan(app: FastAPI):
    print("Starting up")
    await init_db()
    yield
    print("Shutting down")

#enable cors


app = FastAPI(lifespan=lifespan)

#Add CORS middleware here
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  #your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])


@app.get("/")
def home():
    return {"message": "Backend Running"}
