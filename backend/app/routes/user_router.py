from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models.user import User
from app.routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


# -------------------------
# GET CURRENT USER PROFILE
# -------------------------
@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "learning_level": current_user.learning_level,
        "joinedDate": current_user.created_at.strftime("%B %d, %Y")
    }


# -------------------------
# UPDATE PROFILE
# -------------------------
@router.put("/me")
def update_profile(
    updated_data: dict,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):

    if "name" in updated_data:
        current_user.name = updated_data["name"]

    if "email" in updated_data:
        current_user.email = updated_data["email"]

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {"message": "Profile updated successfully"}
