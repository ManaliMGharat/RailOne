import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, Notification
from app.models.train import Availability
from app.models.booking import Booking, BookingPassenger, Cancellation, Refund, PnrRecord
from app.models.audit import AuditLog

CANCELLATION_CHARGES = {
    "1A": 240.0,
    "2A": 200.0,
    "3A": 180.0,
    "CC": 180.0,
    "SL": 120.0,
    "2S": 60.0
}

def cancel_booking(
    db: Session,
    booking_id: int,
    user: User,
    passenger_ids: Optional[List[int]] = None
) -> dict:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    # Authorize: user can cancel their own, admin can cancel any
    if booking.user_id != user.id and user.role.name != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to cancel this booking")

    if booking.status == "CANCELLED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket is already cancelled")

    # Filter active passengers to cancel
    all_bps = booking.passengers
    if passenger_ids and len(passenger_ids) > 0:
        target_bps = [bp for bp in all_bps if bp.id in passenger_ids and bp.current_status != "CANCELLED"]
    else:
        target_bps = [bp for bp in all_bps if bp.current_status != "CANCELLED"]

    if not target_bps:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active passengers to cancel")

    cancel_count = len(target_bps)
    per_pax_fare = booking.total_fare / len(all_bps)
    flat_fee = CANCELLATION_CHARGES.get(booking.seat_class.code, 120.0)

    total_fee = round(flat_fee * cancel_count, 2)
    # Ensure fee does not exceed target fare
    target_fare_sum = round(per_pax_fare * cancel_count, 2)
    if total_fee > target_fare_sum:
        total_fee = target_fare_sum

    refund_amt = round(target_fare_sum - total_fee, 2)

    # Mark passengers cancelled
    seats_to_restore = 0
    for bp in target_bps:
        if bp.current_status == "CNF":
            seats_to_restore += 1
        bp.current_status = "CANCELLED"

    # Check if all passengers in booking are now cancelled
    remaining_active = [bp for bp in all_bps if bp.current_status != "CANCELLED"]
    if not remaining_active:
        booking.status = "CANCELLED"
        if booking.pnr_record:
            booking.pnr_record.status = "CANCELLED"
    else:
        booking.status = "PARTIALLY_CANCELLED"

    # Restore availability
    if seats_to_restore > 0:
        avail = db.query(Availability).filter(
            Availability.train_id == booking.train_id,
            Availability.journey_date == booking.journey_date,
            Availability.class_id == booking.class_id
        ).first()
        if avail:
            avail.available_seats = min(avail.total_seats, avail.available_seats + seats_to_restore)
            avail.booked_seats = max(0, avail.booked_seats - seats_to_restore)

    # Create Cancellation record
    cancel_ref = f"CAN-{uuid.uuid4().hex[:8].upper()}"
    cancellation = Cancellation(
        cancellation_reference=cancel_ref,
        booking_id=booking.id,
        cancelled_passengers_count=cancel_count,
        cancellation_fee=total_fee,
        refund_amount=refund_amt,
        status="PROCESSED",
        created_at=datetime.utcnow()
    )
    db.add(cancellation)
    db.flush()

    # Create Refund record
    refund_ref = f"REF-{uuid.uuid4().hex[:10].upper()}"
    refund = Refund(
        cancellation_id=cancellation.id,
        refund_reference=refund_ref,
        amount=refund_amt,
        status="PROCESSED",
        processed_at=datetime.utcnow()
    )
    db.add(refund)

    # Notify User
    notification = Notification(
        user_id=booking.user_id,
        title="Ticket Cancelled - Refund Processed ↩️",
        message=f"Cancellation successful for Booking {booking.booking_reference}. Refund of ₹{refund_amt} has been processed.",
        notification_type="CANCELLATION"
    )
    db.add(notification)

    # Add audit log
    audit = AuditLog(
        admin_id=user.id if user.role.name == "ADMIN" else None,
        action="CANCEL_BOOKING",
        entity="Booking",
        entity_id=str(booking.id),
        description=f"Cancelled {cancel_count} passenger(s) on booking {booking.booking_reference}. Refund ₹{refund_amt}."
    )
    db.add(audit)

    db.commit()

    return {
        "cancellation_reference": cancel_ref,
        "booking_reference": booking.booking_reference,
        "cancelled_passengers_count": cancel_count,
        "cancellation_fee": total_fee,
        "refund_amount": refund_amt,
        "refund_reference": refund_ref,
        "status": "PROCESSED",
        "processed_at": cancellation.created_at
    }
