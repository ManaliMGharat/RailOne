import secrets
import random
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import (
    User, Booking, Ticket, Wallet, WalletTransaction, Payment, Notification, PNRRecord, Refund
)
from app.auth.security import get_current_user
from app.schemas.schemas import (
    BookingCreateRequest, BookingResponse, UTSJourneyRequest
)
from app.services.fare_service import calculate_fare

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_pnr(db: Session) -> str:
    # 10 digit unique Indian Railway style PNR
    for _ in range(20):
        pnr = f"{random.randint(2, 9)}{secrets.randbelow(900000000) + 100000000}"
        if not db.query(Booking).filter(Booking.pnr_number == pnr).first():
            return pnr
    return f"84{secrets.randbelow(90000000) + 10000000}"

def generate_booking_id() -> str:
    return f"RO-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.randbelow(90000) + 10000}"

@router.post("", response_model=BookingResponse)
def create_booking(
    req: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    src = req.source_code.strip().upper()
    dst = req.dest_code.strip().upper()

    if src == dst:
        raise HTTPException(
            status_code=400,
            detail="Source and destination stations cannot be the same."
        )

    if not req.passengers:
        raise HTTPException(status_code=400, detail="At least one passenger is required.")

    # Calculate authoritative fare on backend
    fare_calc = calculate_fare(
        db=db,
        source_code=src,
        dest_code=dst,
        class_type=req.class_type,
        journey_type="reserved",
        passenger_count=len(req.passengers)
    )
    total_fare = 150.0 # fallback
    if fare_calc.fare_options:
        total_fare = fare_calc.fare_options[0].total_fare

    # Process Payment via Wallet or Mock Gateway
    if req.payment_method == "Wallet":
        user_wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not user_wallet or user_wallet.balance < total_fare:
            avail = user_wallet.balance if user_wallet else 0.0
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient wallet balance (₹{avail:.2f}). Required: ₹{total_fare:.2f}. Please add money to wallet or choose another payment method."
            )
        user_wallet.balance -= total_fare
        # Add wallet transaction record
        tx = WalletTransaction(
            wallet_id=user_wallet.id,
            amount=total_fare,
            tx_type="DEBIT",
            description=f"Ticket Booking {src} -> {dst} ({req.train_number})",
            reference_id=f"TX-{secrets.token_hex(6).upper()}"
        )
        db.add(tx)

    booking_code = generate_booking_id()
    pnr_num = generate_pnr(db)

    # Secure non-sensitive QR payload token
    qr_token = f"RO-SECURE:{booking_code}:{pnr_num}:{secrets.token_hex(8)}"

    booking = Booking(
        booking_id=booking_code,
        pnr_number=pnr_num,
        user_id=current_user.id,
        train_id=req.train_id,
        train_number=req.train_number,
        train_name=req.train_name,
        source_code=src,
        source_name=req.source_name,
        dest_code=dst,
        dest_name=req.dest_name,
        journey_date=req.journey_date,
        class_type=req.class_type,
        passenger_count=len(req.passengers),
        fare_amount=total_fare,
        status="Confirmed",
        qr_data=qr_token
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Generate coach and berth allocations
    coach_prefix = "B" if "3A" in req.class_type else ("A" if "2A" in req.class_type else ("H" if "1A" in req.class_type else ("C" if "CC" in req.class_type else "S")))
    coach_num = f"{coach_prefix}{random.randint(1, 4)}"
    berth_types = ["Lower", "Middle", "Upper", "Side Lower", "Side Upper"]

    for idx, p in enumerate(req.passengers, start=1):
        berth_no = f"{random.randint(12, 68)}"
        berth_t = p.berth_preference if p.berth_preference and p.berth_preference != "No Preference" else random.choice(berth_types)
        ticket = Ticket(
            ticket_number=f"TK-{secrets.token_hex(6).upper()}",
            booking_id=booking.id,
            passenger_name=p.name,
            passenger_age=p.age,
            passenger_gender=p.gender,
            coach=coach_num,
            berth=berth_no,
            berth_type=berth_t,
            status="CNF"
        )
        db.add(ticket)

    # Add Payment record
    payment = Payment(
        payment_id=f"PAY-{secrets.token_hex(8).upper()}",
        booking_id=booking.id,
        user_id=current_user.id,
        amount=total_fare,
        payment_method=req.payment_method,
        status="Success",
        transaction_reference=f"REF-{secrets.token_hex(10).upper()}"
    )
    db.add(payment)

    # Add confirmation notification
    notif = Notification(
        user_id=current_user.id,
        title="Ticket Booked Successfully!",
        message=f"Your ticket for {req.train_name} ({pnr_num}) from {src} to {dst} is confirmed.",
        type="booking"
    )
    db.add(notif)
    db.commit()
    db.refresh(booking)

    return booking

@router.get("", response_model=List[BookingResponse])
def get_user_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    return bookings

@router.get("/{id_or_booking_code}", response_model=BookingResponse)
def get_booking_detail(id_or_booking_code: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = None
    if id_or_booking_code.isdigit():
        booking = db.query(Booking).filter(Booking.id == int(id_or_booking_code)).first()
    if not booking:
        booking = db.query(Booking).filter(Booking.booking_id == id_or_booking_code.strip()).first()
    if not booking:
        booking = db.query(Booking).filter(Booking.pnr_number == id_or_booking_code.strip()).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized access to this booking.")

    return booking

@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    if booking.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to cancel this booking.")

    if booking.status in ["Cancelled", "Refunded"]:
        raise HTTPException(status_code=400, detail=f"Booking is already {booking.status}.")

    booking.status = "Cancelled"
    # Update tickets
    for t in booking.tickets:
        t.status = "CANCELLED"

    # Refund 90% (railway cancellation charge 10%)
    refund_amt = round(booking.fare_amount * 0.90, 2)
    wallet = db.query(Wallet).filter(Wallet.user_id == booking.user_id).first()
    if wallet:
        wallet.balance += refund_amt
        tx = WalletTransaction(
            wallet_id=wallet.id,
            amount=refund_amt,
            tx_type="CREDIT",
            description=f"Refund for cancelled booking {booking.booking_id} (PNR {booking.pnr_number})",
            reference_id=f"RF-{secrets.token_hex(6).upper()}"
        )
        db.add(tx)

    # Synchronize Refund record (BUG_012: status becomes Completed when wallet is credited)
    existing_refund = db.query(Refund).filter(Refund.booking_id == booking.id).first()
    if existing_refund:
        existing_refund.status = "Completed"
        existing_refund.amount = refund_amt
        existing_refund.admin_remarks = "Refund credited to RailOne Wallet upon cancellation (10% cancellation charge deducted)."
        existing_refund.processed_at = datetime.now(timezone.utc)
    else:
        new_refund = Refund(
            refund_id=f"RFD-{datetime.now(timezone.utc).strftime('%Y%m')}-{secrets.randbelow(90000) + 10000}",
            booking_id=booking.id,
            user_id=booking.user_id,
            amount=refund_amt,
            reason="Ticket Cancellation",
            status="Completed",
            admin_remarks="Automatically credited to RailOne Wallet (10% cancellation charge deducted).",
            processed_at=datetime.now(timezone.utc)
        )
        db.add(new_refund)

    notif = Notification(
        user_id=booking.user_id,
        title="Booking Cancelled & Refunded",
        message=f"Booking {booking.booking_id} cancelled. ₹{refund_amt:.2f} credited to your RailOne Wallet.",
        type="refund"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "message": f"Booking cancelled. ₹{refund_amt:.2f} has been refunded to your wallet.",
        "refund_amount": refund_amt
    }
