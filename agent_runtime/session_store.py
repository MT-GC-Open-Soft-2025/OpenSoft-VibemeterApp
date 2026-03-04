import asyncio
import json
import time
from typing import Any

from redis.asyncio import Redis

from config import get_settings


class SessionStore:
    def __init__(self):
        self._memory: dict[str, dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._redis: Redis | None = None

    async def connect(self) -> None:
        settings = get_settings()
        if settings.redis_url:
            self._redis = Redis.from_url(settings.redis_url, decode_responses=True)

    async def get(self, key: str) -> dict[str, Any] | None:
        if self._redis:
            payload = await self._redis.get(key)
            return json.loads(payload) if payload else None
        async with self._lock:
            payload = self._memory.get(key)
            if not payload:
                return None
            if payload["expires_at"] < time.time():
                self._memory.pop(key, None)
                return None
            return payload

    async def set(self, key: str, value: dict[str, Any]) -> None:
        settings = get_settings()
        value["expires_at"] = time.time() + settings.session_ttl_seconds
        if self._redis:
            await self._redis.set(key, json.dumps(value), ex=settings.session_ttl_seconds)
            return
        async with self._lock:
            self._memory[key] = value


store = SessionStore()
