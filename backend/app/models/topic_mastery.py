from sqlmodel import SQLModel, Field
from typing import Optional

class TopicMastery(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    topic: str
    total_attempts: int = 0
    correct_attempts: int = 0
    mastery_score: float = 0.0
