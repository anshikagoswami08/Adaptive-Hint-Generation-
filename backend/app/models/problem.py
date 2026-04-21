from sqlmodel import SQLModel, Field
from datetime import datetime


class Problem(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)

    title: str
    description: str
    difficulty: str
    topic: str

    created_by: int | None = None   # 🔥 NEW FIELD

    created_at: datetime = Field(default_factory=datetime.utcnow)
