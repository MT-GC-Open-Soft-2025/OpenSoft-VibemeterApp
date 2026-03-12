import datetime
from typing import Any
from urllib.parse import urlparse
from uuid import uuid4

from fastapi import HTTPException, status

from src.config import get_settings
from src.models.agent_location_events import AgentLocationEvent
from src.models.agents import Agent
from src.services.agent_health_service import check_agent_health

ALLOWED_AGENT_STATUSES = {"active", "inactive", "draining"}


def _validate_url(value: str, field_name: str) -> str:
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid {field_name}",
        )
    return value.rstrip("/")


async def _write_event(
    *,
    agent: Agent | None,
    agent_id: str,
    event_type: str,
    changed_fields: list[str],
    changed_by: str | None,
    previous_base_url: str | None,
    new_base_url: str | None,
    previous_public_base_url: str | None,
    new_public_base_url: str | None,
    previous_status: str | None,
    new_status: str | None,
) -> None:
    event = AgentLocationEvent(
        event_id=str(uuid4()),
        agent_id=agent_id,
        event_type=event_type,
        previous_base_url=previous_base_url,
        new_base_url=new_base_url,
        previous_public_base_url=previous_public_base_url,
        new_public_base_url=new_public_base_url,
        previous_status=previous_status,
        new_status=new_status,
        changed_fields=changed_fields,
        changed_by=changed_by,
        timestamp=datetime.datetime.now(datetime.UTC),
    )
    await event.insert()


def serialize_agent(agent: Agent) -> dict[str, Any]:
    return {
        "agent_id": agent.agent_id,
        "slug": agent.slug,
        "display_name": agent.display_name,
        "description": agent.description,
        "persona_key": agent.persona_key,
        "greeting_style": agent.greeting_style,
        "avatar_key": agent.avatar_key,
        "theme_key": agent.theme_key,
        "base_url": agent.base_url,
        "public_base_url": agent.public_base_url,
        "status": agent.status,
        "health_status": agent.health_status,
        "created_at": agent.created_at.isoformat(),
        "updated_at": agent.updated_at.isoformat(),
    }


def serialize_agent_summary(agent: Agent) -> dict[str, Any]:
    return {
        "agent_id": agent.agent_id,
        "slug": agent.slug,
        "display_name": agent.display_name,
        "description": agent.description,
        "avatar_key": agent.avatar_key,
        "theme_key": agent.theme_key,
    }


async def list_selectable_agents() -> list[dict[str, Any]]:
    agents = await Agent.find(Agent.status == "active").sort("display_name").to_list()
    return [serialize_agent_summary(agent) for agent in agents]


async def list_admin_agents() -> list[dict[str, Any]]:
    agents = await Agent.find_all().sort("display_name").to_list()
    return [serialize_agent(agent) for agent in agents]


async def get_agent_or_404(agent_id: str) -> Agent:
    agent = await Agent.find(Agent.agent_id == agent_id).first_or_none()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


async def get_agent_location(agent_id: str) -> Agent:
    agent = await get_agent_or_404(agent_id)
    if agent.status != "active":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Selected agent is not available for new chats",
        )
    return agent


async def create_agent(payload: dict[str, Any], changed_by: str | None = None) -> dict[str, Any]:
    now = datetime.datetime.now(datetime.UTC)
    status_value = payload.get("status", "active")
    if status_value not in ALLOWED_AGENT_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid status")

    agent = Agent(
        agent_id=payload.get("agent_id") or str(uuid4()),
        slug=payload["slug"],
        display_name=payload["display_name"],
        description=payload.get("description", ""),
        persona_key=payload["persona_key"],
        greeting_style=payload.get("greeting_style", ""),
        avatar_key=payload.get("avatar_key", "default"),
        theme_key=payload.get("theme_key", "default"),
        base_url=_validate_url(payload["base_url"], "base_url"),
        public_base_url=_validate_url(payload["public_base_url"], "public_base_url"),
        status=status_value,
        health_status="unknown",
        created_at=now,
        updated_at=now,
        created_by=changed_by,
        updated_by=changed_by,
    )
    agent.health_status = await check_agent_health(agent.base_url)
    await agent.insert()
    await _write_event(
        agent=agent,
        agent_id=agent.agent_id,
        event_type="created",
        changed_fields=["base_url", "public_base_url", "status"],
        changed_by=changed_by,
        previous_base_url=None,
        new_base_url=agent.base_url,
        previous_public_base_url=None,
        new_public_base_url=agent.public_base_url,
        previous_status=None,
        new_status=agent.status,
    )
    return serialize_agent(agent)


async def update_agent(
    agent_id: str, payload: dict[str, Any], changed_by: str | None = None
) -> dict[str, Any]:
    agent = await get_agent_or_404(agent_id)
    previous_base_url = agent.base_url
    previous_public_base_url = agent.public_base_url
    previous_status = agent.status

    mutable_fields = [
        "display_name",
        "description",
        "persona_key",
        "greeting_style",
        "avatar_key",
        "theme_key",
        "slug",
    ]
    changed_fields: list[str] = []
    for field in mutable_fields:
        if field in payload and payload[field] != getattr(agent, field):
            setattr(agent, field, payload[field])
            changed_fields.append(field)

    if "base_url" in payload:
        base_url = _validate_url(payload["base_url"], "base_url")
        if base_url != agent.base_url:
            agent.base_url = base_url
            changed_fields.append("base_url")

    if "public_base_url" in payload:
        public_base_url = _validate_url(payload["public_base_url"], "public_base_url")
        if public_base_url != agent.public_base_url:
            agent.public_base_url = public_base_url
            changed_fields.append("public_base_url")

    if "status" in payload:
        status_value = payload["status"]
        if status_value not in ALLOWED_AGENT_STATUSES:
            raise HTTPException(status_code=422, detail="Invalid status")
        if status_value != agent.status:
            agent.status = status_value
            changed_fields.append("status")

    if "base_url" in changed_fields or "public_base_url" in changed_fields:
        agent.health_status = await check_agent_health(agent.base_url)
    elif payload.get("run_healthcheck"):
        agent.health_status = await check_agent_health(agent.base_url)

    agent.updated_at = datetime.datetime.now(datetime.UTC)
    agent.updated_by = changed_by
    await agent.save()

    if changed_fields:
        event_type = "updated"
        if "status" in changed_fields and len(changed_fields) == 1:
            event_type = "status_changed"
        elif "base_url" in changed_fields or "public_base_url" in changed_fields:
            event_type = "location_changed"

        await _write_event(
            agent=agent,
            agent_id=agent.agent_id,
            event_type=event_type,
            changed_fields=changed_fields,
            changed_by=changed_by,
            previous_base_url=previous_base_url,
            new_base_url=agent.base_url,
            previous_public_base_url=previous_public_base_url,
            new_public_base_url=agent.public_base_url,
            previous_status=previous_status,
            new_status=agent.status,
        )

    return serialize_agent(agent)


async def get_agent_history(agent_id: str) -> list[dict[str, Any]]:
    await get_agent_or_404(agent_id)
    events = (
        await AgentLocationEvent.find(AgentLocationEvent.agent_id == agent_id)
        .sort("-timestamp")
        .to_list()
    )
    return [
        {
            "event_id": event.event_id,
            "event_type": event.event_type,
            "changed_fields": event.changed_fields,
            "previous_base_url": event.previous_base_url,
            "new_base_url": event.new_base_url,
            "previous_public_base_url": event.previous_public_base_url,
            "new_public_base_url": event.new_public_base_url,
            "previous_status": event.previous_status,
            "new_status": event.new_status,
            "changed_by": event.changed_by,
            "timestamp": event.timestamp.isoformat(),
        }
        for event in events
    ]


async def run_agent_healthcheck(agent_id: str) -> dict[str, Any]:
    agent = await get_agent_or_404(agent_id)
    agent.health_status = await check_agent_health(agent.base_url)
    agent.updated_at = datetime.datetime.now(datetime.UTC)
    await agent.save()
    return {"agent_id": agent.agent_id, "health_status": agent.health_status}


async def seed_default_agents() -> None:
    settings = get_settings()
    if not settings.seed_default_agents:
        return

    def _base_url(override: str, port: int) -> str:
        return override if override else f"{settings.agent_seed_base_host}:{port}"

    def _public_url(override: str, port: int) -> str:
        return override if override else f"{settings.agent_seed_base_host}:{port}"

    defaults = [
        {
            "slug": "anchor",
            "display_name": "Anchor",
            "description": "Calm, grounding support focused on steady guidance.",
            "persona_key": "anchor",
            "greeting_style": "reassuring",
            "avatar_key": "anchor",
            "theme_key": "anchor",
            "base_url": _base_url(settings.agent_seed_anchor_base_url, 8101),
            "public_base_url": _public_url(settings.agent_seed_anchor_public_url, 8101),
            "status": "active",
        },
        {
            "slug": "spark",
            "display_name": "Spark",
            "description": "Upbeat and energizing support with positive framing.",
            "persona_key": "spark",
            "greeting_style": "energetic",
            "avatar_key": "spark",
            "theme_key": "spark",
            "base_url": _base_url(settings.agent_seed_spark_base_url, 8102),
            "public_base_url": _public_url(settings.agent_seed_spark_public_url, 8102),
            "status": "active",
        },
        {
            "slug": "sage",
            "display_name": "Sage",
            "description": "Reflective, structured support for thoughtful conversations.",
            "persona_key": "sage",
            "greeting_style": "reflective",
            "avatar_key": "sage",
            "theme_key": "sage",
            "base_url": _base_url(settings.agent_seed_sage_base_url, 8103),
            "public_base_url": _public_url(settings.agent_seed_sage_public_url, 8103),
            "status": "active",
        },
    ]

    for payload in defaults:
        existing = await Agent.find(Agent.slug == payload["slug"]).first_or_none()
        if existing:
            continue
        await create_agent(payload, changed_by="system")
