from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import fitz
import json

from app.core.ai_service import extract_questions_from_text
from app.database import get_session
from app.routes.auth import get_current_user
from app.models.user import User
from app.models.problem import Problem

router = APIRouter(prefix="/pdf", tags=["PDF Learning"])


@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    session = next(get_session())

    # ✅ Validate file
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    contents = await file.read()

    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Max file size is 10MB")

    # ✅ Extract text
    doc = fitz.open(stream=contents, filetype="pdf")
    full_text = "".join(page.get_text() for page in doc)
    doc.close()

    # ✅ AI extraction + classification
    ai_output = extract_questions_from_text(full_text)

    # ✅ Parse JSON safely
    if isinstance(ai_output, dict) and "error" in ai_output:
        raise HTTPException(status_code=500, detail=ai_output["error"])

    try:
        questions = ai_output if isinstance(ai_output, list) else json.loads(ai_output)
    except:
        raise HTTPException(status_code=500, detail="Invalid AI JSON")

    # ✅ Save to DB
    saved = []

    for q in questions:
        question_text = q.get("question", "").strip()
        if not question_text:
            continue

        problem = Problem(
            title=question_text[:80],   # short title
            description=question_text,
            difficulty=q.get("difficulty", "Medium"),
            topic=q.get("topic", "General"),
            created_by=user.id
        )

        session.add(problem)
        saved.append(problem)

    session.commit()

    # ✅ Response
    return {
        "status": "AI extraction complete",
        "total_extracted": len(questions),
        "saved_to_db": len(saved),
        "questions_json": ai_output
    }
