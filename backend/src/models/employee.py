
from beanie import Document, Indexed


class Employee(Document):
    emp_id: Indexed(str, unique=True)
    password_hash: str | None = None
    role: str = "employee"
    vibe_score: float | None = None
    total_work_hours: float | None = None
    leave_days: float | None = None
    types_of_leaves: dict[str, int] | None = None
    feedback: float | None = None
    weighted_performance: float | None = None
    reward_points: int | None = None
    award_list: list[str] | None = None
    factors_in_sorted_order: list[str] | None = None

    class Settings:
        name = "employees"
