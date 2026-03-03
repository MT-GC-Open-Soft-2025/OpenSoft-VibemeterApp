from beanie import Document


class Feedback_ratings(Document):
    emp_id: str | None = None
    conv_id: str | None = None
    Q1: int
    Q2: int
    Q3: int
    Q4: int
    Q5: int

    class Settings:
        name = "feedback_ratings"
