import logging

import httpx

logger = logging.getLogger(__name__)


async def check_agent_health(base_url: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{base_url.rstrip('/')}/health")
            response.raise_for_status()
        return "healthy"
    except Exception as exc:
        logger.warning("Agent health check failed for %s: %s", base_url, exc)
        return "unhealthy"
