from pydantic import BaseModel
from datetime import datetime

class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: str
    topic: str

class ProblemResponse(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    topic: str
    created_at: datetime
