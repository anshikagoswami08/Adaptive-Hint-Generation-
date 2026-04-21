from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.problem import Problem
from app.models.topic_mastery import TopicMastery
from app.core.evaluator_ai import evaluate_with_ai
import json


router = APIRouter()

def update_mastery(session, user_id, topic, is_correct):
    mastery = session.exec(
        select(TopicMastery)
        .where(TopicMastery.user_id == user_id)
        .where(TopicMastery.topic == topic)
    ).first()

    if not mastery:
        mastery = TopicMastery(
            user_id=user_id,
            topic=topic,
            total_attempts=0,
            correct_attempts=0,
            mastery_score=0.0
        )

    mastery.total_attempts += 1

    if is_correct:
        mastery.correct_attempts += 1

    mastery.mastery_score = (
        mastery.correct_attempts / mastery.total_attempts
    ) * 100

    session.add(mastery)
    session.commit()

@router.post("/", response_model=SubmissionResponse)
def submit_solution(
    submission_data: SubmissionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    problem = session.get(Problem, submission_data.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    ai_response = evaluate_with_ai(problem, submission_data.code)

    try:
        evaluation = json.loads(ai_response)
        result = evaluation["verdict"]
        score = float(evaluation["score"])
    except:
        result = "wrong"
        score = 0.0

    new_submission = Submission(
        user_id=current_user.id,
        problem_id=submission_data.problem_id,
        code=submission_data.code,
        result=result,
        score=score
    )

    session.add(new_submission)
    session.commit()
    session.refresh(new_submission)

    update_mastery(
    session,
    current_user.id,
    problem.topic,
    result == "correct"
    )


    return new_submission
