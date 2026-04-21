from pydantic import BaseModel
from datetime import datetime

class SubmissionCreate(BaseModel):
    problem_id: int
    code: str

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    result: str
    score: float
    created_at: datetime
