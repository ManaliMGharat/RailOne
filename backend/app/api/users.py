from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import UserProfileResponse, UserProfileUpdate, PasswordChangeRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserProfileResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        mobile=current_user.mobile,
        role=current_user.role.name if current_user.role else "USER",
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.put("/me", response_model=UserProfileResponse)
def update_user_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.mobile is not None:
        # Check if mobile taken by another user
        conflict = db.query(User).filter(User.mobile == update_data.mobile, User.id != current_user.id).first()
        if conflict:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number is already registered")
        current_user.mobile = update_data.mobile

    db.commit()
    db.refresh(current_user)

    return UserProfileResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        mobile=current_user.mobile,
        role=current_user.role.name if current_user.role else "USER",
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )

@router.put("/change-password")
def change_password(
    data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
