from typing import Optional

from beanie import Document


class Feedback_ratings(Document):
    emp_id: Optional[str] = None
    conv_id: Optional[str] = None
    Q1: int
    Q2: int
    Q3: int
    Q4: int
    Q5: int

    class Settings:
        name = "feedback_ratings"
