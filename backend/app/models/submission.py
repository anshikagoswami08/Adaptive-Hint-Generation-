from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Submission(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    problem_id: int = Field(foreign_key="problem.id")
    code: str
    result: str
    score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
