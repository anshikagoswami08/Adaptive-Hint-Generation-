from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Hint(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    problem_id: int
    hint_text: str
    hint_level: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
