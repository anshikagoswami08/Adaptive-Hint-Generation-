from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func
from datetime import datetime, timedelta

from app.database import get_session      # adjust if needed
from app.models.problem import Problem
from app.models.hint import Hint

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/{user_id}")
def get_dashboard(user_id: int, session: Session = Depends(get_session)):

    # -------------------------
    # 1️⃣ Total Attempted
    # -------------------------
    total_attempted = session.exec(
        select(func.count())
        .select_from(Problem)
        .where(Problem.created_by == user_id)
    ).one()

    # -------------------------
    # 2️⃣ Total Hints Used
    # -------------------------
    total_hints = session.exec(
        select(func.count())
        .select_from(Hint)
        .where(Hint.user_id == user_id)
    ).one()

    avg_hints = round(total_hints / total_attempted, 2) if total_attempted > 0 else 0



    # -------------------------
    # 3️⃣ Accuracy Rate
    # -------------------------

    penalty_per_hint = 15

    accuracy_rate = max(
        0,
        round(100 - (avg_hints * penalty_per_hint))
    )

    if total_attempted == 0:
        accuracy_rate = 0

    # -------------------------
    # 3️⃣ Weekly Problems Solved
    # -------------------------
    last_7_days = datetime.utcnow() - timedelta(days=7)

    weekly_data = session.exec(
        select(Problem.created_at)
        .where(
            Problem.created_by == user_id,
            Problem.created_at >= last_7_days
        )
    ).all()

    weekly_counts = {day: 0 for day in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]}

    for date in weekly_data:
        day_name = date.strftime("%a")
        weekly_counts[day_name] += 1

    weekly_progress = [
        {"date": day, "solved": weekly_counts[day]}
        for day in ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    ]


    # -------------------------
    # 4️⃣ Topic Mastery
    # -------------------------
    topic_counts = session.exec(
        select(Problem.topic, func.count())
        .where(Problem.created_by == user_id)
        .group_by(Problem.topic)
    ).all()

    # ✅ Total problems
    total_problems = sum(count for _, count in topic_counts) or 1

    mastery = [
        {
            "topic": topic,
            "score": round((count / total_problems) * 100)
        }
        for topic, count in topic_counts
    ]

    # -------------------------
    # 5️⃣ Current Level (Based on Attempts)
    # -------------------------
    if total_attempted <= 10:
        level = "Beginner"
    elif total_attempted <= 30:
        level = "Intermediate"
    elif total_attempted <= 60:
        level = "Advanced"
    else:
        level = "Expert"

    # return {
    #     "total_attempted": total_attempted,
    #     "avg_hints_per_problem": avg_hints,
    #     "current_level": level,
    #     "accuracy_rate": accuracy_rate,
    #     "weekly_problems": weekly_progress,
    #     "mastery": mastery
    # }

    return {
        "totalProblems": total_attempted,
        "avgHints": avg_hints,
        "difficultyLevel": level,
        "accuracy": accuracy_rate,
        "progressData": weekly_progress,
        "mastery": mastery
    }
