from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class LearnerProfile(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    strength_topics: str
    weak_topics: str
    average_score: float = 0.0
    last_updated: datetime = Field(default_factory=datetime.utcnow)
