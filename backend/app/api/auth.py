from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
)
from app.models.user import User, Role, Notification
from app.schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, RefreshTokenRequest, UserResponse
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # Check for existing email or mobile
    existing_user = db.query(User).filter(
        or_(User.email == request.email.lower(), User.mobile == request.mobile)
    ).first()

    if existing_user:
        if existing_user.email.lower() == request.email.lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Mobile number is already registered")

    user_role = db.query(Role).filter(Role.name == "USER").first()
    if not user_role:
        user_role = Role(name="USER", description="Standard User")
        db.add(user_role)
        db.flush()

    new_user = User(
        full_name=request.full_name,
        email=request.email.lower(),
        mobile=request.mobile,
        hashed_password=get_password_hash(request.password),
        role_id=user_role.id,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to RailOne! 🚆",
        message="Your account has been registered successfully. Search trains, check PNR and book journeys effortlessly.",
        notification_type="SYSTEM"
    )
    db.add(welcome_notif)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(new_user.id, role=user_role.name)
    refresh_token = create_refresh_token(new_user.id, role=user_role.name)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            mobile=new_user.mobile,
            role=user_role.name,
            is_active=new_user.is_active
        )
    )

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    ident = request.username.strip()
    user = db.query(User).filter(
        or_(User.email.ilike(ident), User.mobile == ident)
    ).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive"
        )

    role_name = user.role.name if user.role else "USER"
    access_token = create_access_token(user.id, role=role_name)
    refresh_token = create_refresh_token(user.id, role=role_name)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            mobile=user.mobile,
            role=role_name,
            is_active=user.is_active
        )
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    role_name = user.role.name if user.role else "USER"
    access_token = create_access_token(user.id, role=role_name)
    new_refresh = create_refresh_token(user.id, role=role_name)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        user=UserResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            mobile=user.mobile,
            role=role_name,
            is_active=user.is_active
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        mobile=current_user.mobile,
        role=current_user.role.name if current_user.role else "USER",
        is_active=current_user.is_active
    )

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
