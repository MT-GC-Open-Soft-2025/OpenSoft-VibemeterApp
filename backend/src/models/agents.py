from datetime import datetime
from typing import Literal

from beanie import Document, Indexed


class Agent(Document):
    agent_id: Indexed(str, unique=True)
    slug: Indexed(str, unique=True)
    display_name: str
    description: str
    persona_key: str
    greeting_style: str
    avatar_key: str
    theme_key: str
    base_url: str
    public_base_url: str
    status: Literal["active", "inactive", "draining"] = "active"
    health_status: Literal["unknown", "healthy", "unhealthy"] = "unknown"
    created_at: datetime
    updated_at: datetime
    created_by: str | None = None
    updated_by: str | None = None

    class Settings:
        name = "agents"
