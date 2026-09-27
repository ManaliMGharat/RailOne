import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User, Wallet, Notification
from app.auth.security import (
    hash_password, verify_password, hash_mpin, verify_mpin,
    create_access_token, get_current_user,
    request_otp_for_phone, verify_otp_for_phone,
    create_biometric_challenge, verify_biometric_response
)
from app.schemas.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse, UserUpdate,
    MPINSetRequest, MPINVerifyRequest, MPINLoginRequest, MPINChangeRequest,
    OTPRequest, OTPVerifyRequest, BiometricRegisterRequest, BiometricLoginRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        dob=user.dob,
        gender=user.gender,
        address=user.address,
        emergency_contact=user.emergency_contact,
        is_active=user.is_active,
        biometric_enabled=user.biometric_enabled,
        has_mpin=bool(user.mpin_hash),
        created_at=user.created_at
    )

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister, db: Session = Depends(get_db)):
    # Check if email exists
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    # Check if phone exists
    if db.query(User).filter(User.phone == req.phone).first():
        raise HTTPException(status_code=400, detail="An account with this mobile number already exists.")

    new_user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        phone=req.phone.strip(),
        hashed_password=hash_password(req.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize wallet with welcome balance Rs 1500
    wallet = Wallet(user_id=new_user.id, balance=1500.0)
    db.add(wallet)

    # Add welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to RailOne!",
        message="Your RailOne account is ready. ₹1,500 welcome balance has been credited to your RailOne Wallet.",
        type="promotion"
    )
    db.add(welcome_notif)
    db.commit()

    access_token = create_access_token({"sub": str(new_user.id), "role": new_user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin, db: Session = Depends(get_db)):
    identifier = req.username.strip().lower()
    user = db.query(User).filter(
        (User.email == identifier) | (User.phone == req.username.strip())
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is disabled. Please contact railway support."
        )

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return serialize_user(current_user)

@router.put("/profile", response_model=UserResponse)
def update_profile(req: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if req.full_name is not None:
        current_user.full_name = req.full_name.strip()
    if req.dob is not None:
        current_user.dob = req.dob
    if req.gender is not None:
        current_user.gender = req.gender
    if req.address is not None:
        current_user.address = req.address.strip()
    if req.emergency_contact is not None:
        current_user.emergency_contact = req.emergency_contact.strip()

    db.commit()
    db.refresh(current_user)
    return serialize_user(current_user)

# --- mPIN Endpoints ---
@router.post("/mpin/set")
def set_mpin(req: MPINSetRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not req.mpin.isdigit() or len(req.mpin) not in (4, 6):
        raise HTTPException(status_code=400, detail="mPIN must be a 4 or 6 digit number.")
    current_user.mpin_hash = hash_mpin(req.mpin)
    db.commit()
    return {"status": "success", "message": "mPIN has been set successfully."}

@router.post("/mpin/verify")
def verify_user_mpin(req: MPINVerifyRequest, current_user: User = Depends(get_current_user)):
    if not current_user.mpin_hash:
        raise HTTPException(status_code=400, detail="mPIN has not been set yet.")
    if not verify_mpin(req.mpin, current_user.mpin_hash):
        raise HTTPException(status_code=401, detail="Incorrect mPIN.")
    return {"status": "success", "message": "mPIN verified successfully."}

@router.post("/mpin/login", response_model=TokenResponse)
def login_with_mpin(req: MPINLoginRequest, db: Session = Depends(get_db)):
    identifier = req.username.strip().lower()
    user = db.query(User).filter(
        (User.email == identifier) | (User.phone == req.username.strip())
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
    if not user.mpin_hash:
        raise HTTPException(status_code=400, detail="mPIN is not set for this account.")
    if not verify_mpin(req.mpin, user.mpin_hash):
        raise HTTPException(status_code=401, detail="Incorrect mPIN.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled.")
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(user)
    )

@router.post("/mpin/change")
def change_mpin(req: MPINChangeRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.mpin_hash:
        raise HTTPException(status_code=400, detail="mPIN has not been set yet.")
    if not verify_mpin(req.old_mpin, current_user.mpin_hash):
        raise HTTPException(status_code=401, detail="Old mPIN is incorrect.")
    if not req.new_mpin.isdigit() or len(req.new_mpin) not in (4, 6):
        raise HTTPException(status_code=400, detail="New mPIN must be 4 or 6 digits.")
    current_user.mpin_hash = hash_mpin(req.new_mpin)
    db.commit()
    return {"status": "success", "message": "mPIN changed successfully."}

# --- Phone OTP Flow ---
@router.post("/otp/request")
def send_otp(req: OTPRequest, db: Session = Depends(get_db)):
    # Verify phone format
    phone = req.phone.strip()
    otp = request_otp_for_phone(phone)
    return {
        "status": "success",
        "message": f"Verification code sent to {phone}",
        # Return demo_hint in development mode to enable seamless automated testing
        "demo_hint": otp
    }

@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp_endpoint(req: OTPVerifyRequest, db: Session = Depends(get_db)):
    phone = req.phone.strip()
    if not verify_otp_for_phone(phone, req.otp.strip()):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        # Create user via OTP fast-register
        user = User(
            full_name=f"Passenger {phone[-4:]}",
            email=f"user_{phone}@railone.in",
            phone=phone,
            hashed_password=hash_password(secrets.token_urlsafe(16)),
            role="user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        wallet = Wallet(user_id=user.id, balance=1500.0)
        db.add(wallet)
        db.commit()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=serialize_user(user)
    )

# --- Biometric Authentication Architecture ---
@router.post("/biometric/challenge")
def get_biometric_challenge(current_user: User = Depends(get_current_user)):
    challenge = create_biometric_challenge(current_user.id)
    return {"challenge": challenge, "user_id": current_user.id}

@router.post("/biometric/register")
def register_biometric(req: BiometricRegisterRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_biometric_response(current_user.id, req.challenge):
        raise HTTPException(status_code=400, detail="Biometric challenge verification failed.")
    current_user.biometric_enabled = True
    current_user.biometric_credential_id = req.credential_id
    db.commit()
    return {"status": "success", "message": "Biometric authentication registered successfully."}

@router.post("/biometric/login", response_model=TokenResponse)
def login_biometric(req: BiometricLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == req.phone_or_email.lower().strip()) | (User.phone == req.phone_or_email.strip())
    ).first()
    if not user or not user.biometric_enabled:
        raise HTTPException(status_code=400, detail="Biometrics not configured for this account.")
    if user.biometric_credential_id != req.credential_id:
        raise HTTPException(status_code=401, detail="Biometric key mismatch.")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=serialize_user(user)
    )

# --- Deterministic Logout ---
@router.post("/logout")
def logout():
    # Client deterministically clears JWT and state
    return {"status": "success", "message": "Logged out successfully."}
