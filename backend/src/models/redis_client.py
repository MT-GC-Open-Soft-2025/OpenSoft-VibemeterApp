from redis.asyncio import Redis

from src.config import get_settings

_redis_client: Redis | None = None


async def init_redis() -> Redis | None:
    """Initialise a global async Redis client from settings.

    Returns the client or None if `redis_url` is not configured.
    """
    global _redis_client
    settings = get_settings()
    if not settings.redis_url:
        return None

    if _redis_client is None:
        _redis_client = Redis.from_url(settings.redis_url, db=settings.redis_db)
        try:
            await _redis_client.ping()
        except Exception:
            # If ping fails, leave client as-is - callers should handle None or exceptions
            pass

    return _redis_client


async def close_redis() -> None:
    """Close and cleanup the global Redis client if present."""
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.close()
            await _redis_client.connection_pool.disconnect()
        except Exception:
            pass
        _redis_client = None


def get_redis() -> Redis | None:
    return _redis_client
