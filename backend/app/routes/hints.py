from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.problem import Problem
from app.models.topic_mastery import TopicMastery
from app.models.submission import Submission
from app.models.hint import Hint
from app.core.ai import generate_ai_hint
from pydantic import BaseModel
from app.core.ai import generate_pdf_hint
from app.database import get_session


router = APIRouter()

class PDFHintRequest(BaseModel):
    question: str
    level: int

@router.post("/pdf")
def generate_pdf_adaptive_hint(
    request: PDFHintRequest,
    current_user: User = Depends(get_current_user)
):
    
    session = next(get_session())

    try:
        hint_text = generate_pdf_hint(
            question=request.question,
            level=request.level
        )
    except Exception as e:
        print("GROQ ERROR:", str(e))
        hint_text = "AI service temporarily unavailable."

    try:
        problem = session.exec(
            select(Problem).where(
                Problem.description == request.question,
                Problem.created_by == current_user.id
            )
        ).first()

        if problem:
            new_hint = Hint(
                user_id=current_user.id,
                problem_id=problem.id,
                hint_text=hint_text,
                hint_level=request.level
            )

            session.add(new_hint)
            session.commit()

    except Exception as db_error:
        print("DB ERROR:", str(db_error))  # don't break API

    return {
        "status": "success",
        "level": request.level,
        "hint": hint_text
    }

@router.post("/{problem_id}")
def get_adaptive_hint(
    problem_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 🔹 1. Validate Problem
    problem = session.get(Problem, problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # 🔹 2. Fetch Mastery Data
    mastery = session.exec(
        select(TopicMastery)
        .where(TopicMastery.user_id == current_user.id)
        .where(TopicMastery.topic == problem.topic)
    ).first()

    mastery_score = mastery.mastery_score if mastery else 0.0
    attempt_count = mastery.total_attempts if mastery else 1

    # 🔹 3. Get Latest Submission
    last_submission = session.exec(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .where(Submission.problem_id == problem_id)
        .order_by(Submission.created_at.desc())
    ).first()

    user_code = last_submission.code if last_submission else "No submission yet."

    # 🔹 4. Generate AI Hint (Safe Execution)
    try:
        hint_text = generate_ai_hint(
            problem=problem,
            mastery_score=mastery_score,
            attempt_count=attempt_count,
            user_code=user_code
        )
    except Exception as e:
        # Fallback in case Groq fails
        print("GROQ ERROR:", str(e))
        hint_text = "AI service temporarily unavailable. Try reviewing the problem constraints."
    
    # 🔹 5. Save Hint to Database
    new_hint = Hint(
        user_id=current_user.id,
        problem_id=problem_id,
        hint_text=hint_text,
        hint_level=attempt_count
    )

    session.add(new_hint)
    session.commit()
    session.refresh(new_hint)

    # 🔹 6. Return Structured Response
    return {
        "status": "success",
        "problem_id": problem_id,
        "topic": problem.topic,
        "mastery_score": mastery_score,
        "attempt_count": attempt_count,
        "adaptive_level": (
            "beginner" if mastery_score < 40
            else "intermediate" if mastery_score < 70
            else "advanced"
        ),
        "hint": hint_text
    }
