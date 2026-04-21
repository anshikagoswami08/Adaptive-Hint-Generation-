from fastapi import APIRouter, Depends, HTTPException
from app.core.screen_parser import capture_and_extract_text
from app.core.ai import generate_pdf_hint
from app.core.ai_service import extract_questions_from_text
from app.database import get_session
from app.models.problem import Problem
from app.models.user import User
from app.routes.auth import get_current_user
import json

router = APIRouter()

@router.post("/extract-problem")
def scan_screen(user: User = Depends(get_current_user)):
    session = next(get_session())

    # ✅ Step 1: OCR
    text = capture_and_extract_text()
    print(text)

    # ✅ Step 2: AI extraction
    ai_output = extract_questions_from_text(text)
    print(ai_output)

    # ✅ Handle AI errors
    if isinstance(ai_output, dict) and "error" in ai_output:
        raise HTTPException(status_code=500, detail=ai_output["error"])

    # ✅ Parse JSON safely
    try:
        questions = ai_output if isinstance(ai_output, list) else json.loads(ai_output)
    except:
        raise HTTPException(status_code=500, detail="Invalid AI JSON")

    if not questions:
        raise HTTPException(status_code=400, detail="No questions extracted")

    saved = []

    # ✅ Save ALL questions (like PDF flow)
    for q in questions:
        question_text = q.get("question", "").strip()
        if not question_text:
            continue

        problem = Problem(
            title=question_text[:80],
            description=question_text,
            difficulty=q.get("difficulty", "Medium"),
            topic=q.get("topic", "General"),
            created_by=user.id
        )

        session.add(problem)
        saved.append(problem)

    session.commit()

    # ✅ Use FIRST question for hints (like your current logic)
    ques = questions[0]["question"]

    print("Question is:", ques)

    # ✅ Step 3: Generate hints
    # hint1 = generate_pdf_hint(ques, level=1)
    # hint2 = generate_pdf_hint(ques, level=2)
    # hint3 = generate_pdf_hint(ques, level=3)

    # ✅ Final response
    return {
        "status": "Screen extraction complete",
        "saved_to_db": len(saved),
        "problem_id": saved[0].id,
        "extracted_text": ques,
        # "hints": {
        #     "level_1": hint1,
        #     "level_2": hint2,
        #     "level_3": hint3
        # }
    }