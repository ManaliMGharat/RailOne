import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.all_models import User

security_scheme = HTTPBearer(auto_error=False)

# Password & mPIN Hashing using PBKDF2-HMAC-SHA256 (NIST recommended, crash-free)
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or ":" not in hashed_password:
        return False
    try:
        salt, key = hashed_password.split(":", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(new_key.hex(), key)
    except Exception:
        return False

def hash_mpin(mpin: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", mpin.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"

def verify_mpin(plain_mpin: str, hashed_mpin: str) -> bool:
    if not hashed_mpin or ":" not in hashed_mpin:
        return False
    try:
        salt, key = hashed_mpin.split(":", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", plain_mpin.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(new_key.hex(), key)
    except Exception:
        return False

# JWT Token Creation & Verification
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# Current User Dependency
def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token does not contain user identification",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    return user

# Optional User Dependency (returns None if not logged in, does not raise 401)
def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not credentials or not credentials.credentials:
        return None
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == int(user_id)).first()

# Admin Role Dependency
def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required for this action"
        )
    return current_user

# In-Memory OTP Store with timestamp for verification
_otp_store: Dict[str, Dict] = {}

def request_otp_for_phone(phone: str) -> str:
    # 6-digit OTP
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    _otp_store[phone] = {
        "code": otp_code,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10)
    }
    # In production, integrate with SMS gateway like Twilio or Fast2SMS.
    # Here, we log securely to server console for development/demo testing
    print(f"[OTP Service] Generated OTP for phone {phone}: {otp_code}")
    return otp_code

def verify_otp_for_phone(phone: str, otp: str) -> bool:
    record = _otp_store.get(phone)
    if not record:
        return False
    if datetime.now(timezone.utc) > record["expires_at"]:
        del _otp_store[phone]
        return False
    if secrets.compare_digest(record["code"], otp):
        del _otp_store[phone]
        return True
    return False

# WebAuthn / Passkey Biometric challenge store
_biometric_challenges: Dict[str, Dict] = {}

def create_biometric_challenge(user_id: int) -> str:
    challenge = secrets.token_urlsafe(32)
    _biometric_challenges[str(user_id)] = {
        "challenge": challenge,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5)
    }
    return challenge

def verify_biometric_response(user_id: int, client_challenge: str) -> bool:
    record = _biometric_challenges.get(str(user_id))
    if not record:
        return False
    if datetime.now(timezone.utc) > record["expires_at"]:
        del _biometric_challenges[str(user_id)]
        return False
    # Validate challenge match
    if secrets.compare_digest(record["challenge"], client_challenge):
        del _biometric_challenges[str(user_id)]
        return True
    return False
