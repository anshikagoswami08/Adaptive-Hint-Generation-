from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.problem import Problem
from app.schemas.problem import ProblemCreate, ProblemResponse
from app.routes.auth import get_current_user
from app.models.user import User

router = APIRouter()


# ✅ Create Problem (Protected)
@router.post("/", response_model=ProblemResponse)
def create_problem(
    problem_data: ProblemCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    new_problem = Problem(**problem_data.dict())
    session.add(new_problem)
    session.commit()
    session.refresh(new_problem)
    return new_problem


# ✅ Get All Problems
@router.get("/", response_model=list[ProblemResponse])
def get_all_problems(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    problems = session.exec(select(Problem)).all()
    return problems


# ✅ Get Problem By ID
@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(
    problem_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
