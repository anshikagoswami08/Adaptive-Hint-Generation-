from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.problem import Problem
from app.models.hint import Hint
from app.core.chat_ai import generate_ai_response

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


# @router.post("/")
# def chatbot(
#     message: str,
#     session: Session = Depends(get_session),
#     current_user: User = Depends(get_current_user)
# ):
#     # 🔹 Check if user already has an unsolved problem
#     last_problem = session.exec(
#         select(Problem)
#         .where(Problem.created_by == current_user.id)
#         .order_by(Problem.created_at.desc())
#     ).first()

#     # ======================================
#     # CASE 1: USER SENDING NEW PROBLEM
#     # ======================================
#     if not last_problem:
#         new_problem = Problem(
#             title="User Problem",
#             description=message,
#             difficulty="custom",
#             topic="General",
#             created_by=current_user.id
#         )

#         session.add(new_problem)
#         session.commit()
#         session.refresh(new_problem)

#         ai_reply = generate_ai_response(
#             mode="ask_solution",
#             problem_text=message,
#             solution_text=None
#         )

#         return {
#             "type": "ask_solution",
#             "problem_id": new_problem.id,
#             "response": ai_reply
#         }

#     # ======================================
#     # CASE 2: USER SENDING SOLUTION
#     # ======================================
#     else:
#         ai_reply = generate_ai_response(
#             mode="generate_hint",
#             problem_text=last_problem.description,
#             solution_text=message
#         )

#         new_hint = Hint(
#             user_id=current_user.id,
#             problem_id=last_problem.id,
#             hint_text=ai_reply,
#             hint_level=1
#         )

#         session.add(new_hint)
#         session.commit()

#         return {
#             "type": "hint",
#             "problem_id": last_problem.id,
#             "response": ai_reply
#         }



@router.post("/")
def chatbot(
    message: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    last_problem = session.exec(
        select(Problem)
        .where(Problem.created_by == current_user.id)
        .order_by(Problem.created_at.desc())
    ).first()

    ai_result = generate_ai_response(
        message=message,
        last_problem=last_problem.description if last_problem else None
    )

    # 🔹 If AI says this is a new problem
    if ai_result["type"] == "new_problem":
        new_problem = Problem(
            title="User Problem",
            description=message,
            difficulty="custom",
            topic=ai_result.get("topic") or "General",
            created_by=current_user.id
        )

        session.add(new_problem)
        session.commit()
        session.refresh(new_problem)

        return {
            "type": "ask_solution",
            "problem_id": new_problem.id,
            "response": ai_result["response"]
        }

    # 🔹 If AI says this is solution attempt
    elif ai_result["type"] == "solution_attempt" and last_problem:
        new_hint = Hint(
            user_id=current_user.id,
            problem_id=last_problem.id,
            hint_text=ai_result["response"],
            hint_level=1
        )

        session.add(new_hint)
        session.commit()

        return {
            "type": "hint",
            "problem_id": last_problem.id,
            "response": ai_result["response"]
        }

    else:
        return {
            "type": "general",
            "response": ai_result["response"]
        }
