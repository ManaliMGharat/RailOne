import secrets
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User, Booking, Refund, Notification
from app.auth.security import get_current_user
from app.schemas.schemas import RefundCreateRequest, RefundResponse

router = APIRouter(prefix="/refunds", tags=["Refunds"])

@router.post("", response_model=RefundResponse)
def file_refund(
    req: RefundCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to this booking.")

    # Check if a refund has already been filed for this booking
    existing = db.query(Refund).filter(Refund.booking_id == booking.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"A refund request ({existing.refund_id}) already exists with status: {existing.status}.")

    refund_ref = f"RFD-{datetime.now(timezone.utc).strftime('%Y%m')}-{secrets.randbelow(90000) + 10000}"
    refund = Refund(
        refund_id=refund_ref,
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.fare_amount,
        reason=req.reason.strip(),
        status="Pending"
    )
    db.add(refund)

    notif = Notification(
        user_id=current_user.id,
        title="Refund Request Submitted",
        message=f"Refund request {refund_ref} for booking {booking.booking_id} has been submitted for verification.",
        type="refund"
    )
    db.add(notif)
    db.commit()
    db.refresh(refund)
    return refund

@router.get("", response_model=List[RefundResponse])
def get_user_refunds(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Refund).filter(Refund.user_id == current_user.id).order_by(Refund.created_at.desc()).all()

@router.get("/{id_or_ref}", response_model=RefundResponse)
def get_refund_detail(id_or_ref: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    refund = None
    if id_or_ref.isdigit():
        refund = db.query(Refund).filter(Refund.id == int(id_or_ref)).first()
    if not refund:
        refund = db.query(Refund).filter(Refund.refund_id == id_or_ref.strip()).first()

    if not refund:
        raise HTTPException(status_code=404, detail="Refund record not found.")

    if refund.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to this refund.")

    return refund
