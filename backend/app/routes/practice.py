from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.problem import Problem
from app.models.topic_mastery import TopicMastery
from app.core.practice_ai import generate_practice_problem
import re

router = APIRouter()


def parse_ai_problem(ai_text: str):
    # Basic parser
    title_match = re.search(r"Title:\s*(.*)", ai_text)
    desc_match = re.search(r"Description:\s*(.*)", ai_text, re.DOTALL)

    title = title_match.group(1).strip() if title_match else "Generated Problem"
    description = desc_match.group(1).strip() if desc_match else ai_text

    return title, description


@router.post("/")
def generate_ai_practice(
    topic: str | None = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 🔹 Determine Topic

    if topic:
        selected_topic = topic
        mastery_score = 50
    else:
        mastery_list = session.exec(
            select(TopicMastery)
            .where(TopicMastery.user_id == current_user.id)
            .order_by(TopicMastery.mastery_score.asc())
        ).all()

        if not mastery_list:
            raise HTTPException(status_code=400, detail="No mastery data")

        weakest = mastery_list[0]
        selected_topic = weakest.topic
        mastery_score = weakest.mastery_score

    # 🔹 Generate AI Problem
    ai_text = generate_practice_problem(
        topic=selected_topic,
        mastery_score=mastery_score
    )

    title, description = parse_ai_problem(ai_text)

    # 🔹 Save into Problem table (User-Owned)
    new_problem = Problem(
        title=title,
        description=description,
        difficulty="adaptive",
        topic=selected_topic,
        created_by=current_user.id   # 🔥 Important
    )

    session.add(new_problem)
    session.commit()
    session.refresh(new_problem)

    return {
        "mode": "manual" if topic else "auto",
        "topic": selected_topic,
        "mastery_score": mastery_score,
        "problem_id": new_problem.id,
        "title": title,
        "description": description
    }
