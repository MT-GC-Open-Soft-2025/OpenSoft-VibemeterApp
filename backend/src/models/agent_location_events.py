from datetime import datetime
from typing import Literal

from beanie import Document, Indexed


class AgentLocationEvent(Document):
    event_id: Indexed(str, unique=True)
    agent_id: str
    event_type: Literal["created", "updated", "status_changed", "location_changed"]
    previous_base_url: str | None = None
    new_base_url: str | None = None
    previous_public_base_url: str | None = None
    new_public_base_url: str | None = None
    previous_status: str | None = None
    new_status: str | None = None
    changed_fields: list[str]
    changed_by: str | None = None
    timestamp: datetime
    notes: str | None = None

    class Settings:
        name = "agent_location_events"
