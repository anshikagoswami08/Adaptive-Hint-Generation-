from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.submission import Submission
from app.models.hint import Hint
from app.models.problem import Problem

router = APIRouter()


@router.get("/")
def get_user_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    problems = session.exec(
        select(Problem)
        .where(Problem.created_by == current_user.id)
        .order_by(Problem.created_at.desc())
    ).all()

    history = []

    for problem in problems:
        submissions = session.exec(
            select(Submission)
            .where(Submission.problem_id == problem.id)
            .where(Submission.user_id == current_user.id)
        ).all()

        hints = session.exec(
            select(Hint)
            .where(Hint.problem_id == problem.id)
            .where(Hint.user_id == current_user.id)
        ).all()

        history.append({
            "problem_id": problem.id,
            "title": problem.title,
            "description": problem.description,
            "submissions": submissions,
            "hints": hints
        })

    return history
