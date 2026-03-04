import logging
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.config import get_settings
from src.models.database import init_db
from src.models.redis_client import close_redis, init_redis
from src.routes.admin_routes import admin_router
from src.routes.auth_routes import auth_router
from src.routes.chat_routes import chat_router
from src.routes.internal_routes import internal_router
from src.routes.user_routes import user_router
from src.services.agent_registry_service import seed_default_agents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


async def lifespan(app: FastAPI):
    logger.info("Starting up — initialising database")
    await init_db()
    await seed_default_agents()
    # Initialise Redis (optional; requires REDIS_URL in env/.env)
    try:
        redis_client = await init_redis()
        if redis_client is not None:
            app.state.redis = redis_client
            logger.info("Redis initialised")
        else:
            logger.info("Redis not configured (no redis_url provided)")
    except Exception:
        logger.exception("Failed to initialise Redis")
    yield
    logger.info("Shutting down")
    try:
        await close_redis()
        logger.info("Redis connection closed")
    except Exception:
        logger.exception("Error while closing Redis")


settings = get_settings()

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app = FastAPI(lifespan=lifespan, title="WellBee API", version="1.0.0")
app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(internal_router, prefix="/api/v1/internal", tags=["Internal"])

# Backward-compatible prefixes (can be removed after frontend migration)
app.include_router(auth_router, prefix="/auth", tags=["Auth"], include_in_schema=False)
app.include_router(user_router, prefix="/user", tags=["User"], include_in_schema=False)
app.include_router(admin_router, prefix="/admin", tags=["Admin"], include_in_schema=False)
app.include_router(chat_router, prefix="/chat", tags=["Chat"], include_in_schema=False)
app.include_router(internal_router, prefix="/internal", tags=["Internal"], include_in_schema=False)


@app.get("/")
def home():
    return {"message": "Backend Running"}


@app.get("/health")
async def health():
    from motor.motor_asyncio import AsyncIOMotorClient

    from src.models.redis_client import get_redis

    try:
        client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    redis_client = get_redis()
    if redis_client is None:
        redis_status = "not_configured"
    else:
        try:
            await redis_client.ping()
            redis_status = "connected"
        except Exception:
            redis_status = "disconnected"

    all_ok = db_status == "connected" and redis_status in ("connected", "not_configured")
    return {
        "status": "healthy" if all_ok else "degraded",
        "version": "1.0.0",
        "database": db_status,
        "redis": redis_status,
    }
