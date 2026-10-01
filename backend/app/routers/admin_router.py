from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.all_models import (
    User, Station, Train, Booking, Refund, SupportTicket, FoodOrder, Wallet, WalletTransaction, Notification
)
from app.auth.security import get_current_active_admin
from app.schemas.schemas import AdminStatsResponse, RefundProcessRequest, SupportTicketUpdate

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_stations = db.query(Station).count()
    total_trains = db.query(Train).count()
    total_bookings = db.query(Booking).count()
    total_rev = db.query(func.sum(Booking.fare_amount)).scalar() or 0.0
    pending_refunds = db.query(Refund).filter(Refund.status == "Pending").count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status.in_(["Open", "In Progress"])).count()
    total_orders = db.query(FoodOrder).count()

    return AdminStatsResponse(
        total_users=total_users,
        total_stations=total_stations,
        total_trains=total_trains,
        total_bookings=total_bookings,
        total_revenue=float(total_rev),
        pending_refunds=pending_refunds,
        open_support_tickets=open_tickets,
        total_food_orders=total_orders
    )

@router.get("/users")
def get_all_users(admin: User = Depends(get_current_active_admin), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{
        "id": u.id,
        "full_name": u.full_name,
        "email": u.email,
        "phone": u.phone,
        "role": u.role,
        "is_active": u.is_active,
        "created_at": u.created_at
    } for u in users]

@router.get("/bookings")
def get_all_bookings(admin: User = Depends(get_current_active_admin), db: Session = Depends(get_db)):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).limit(100).all()
    return [{
        "id": b.id,
        "booking_id": b.booking_id,
        "pnr_number": b.pnr_number,
        "user_id": b.user_id,
        "train_number": b.train_number,
        "source": b.source_code,
        "destination": b.dest_code,
        "journey_date": b.journey_date,
        "class_type": b.class_type,
        "fare_amount": b.fare_amount,
        "status": b.status,
        "created_at": b.created_at
    } for b in bookings]

@router.get("/refunds")
def get_all_refunds(admin: User = Depends(get_current_active_admin), db: Session = Depends(get_db)):
    refunds = db.query(Refund).order_by(Refund.created_at.desc()).all()
    return [{
        "id": r.id,
        "refund_id": r.refund_id,
        "booking_id": r.booking_id,
        "user_id": r.user_id,
        "amount": r.amount,
        "reason": r.reason,
        "status": r.status,
        "admin_remarks": r.admin_remarks,
        "created_at": r.created_at,
        "processed_at": r.processed_at
    } for r in refunds]

@router.put("/refunds/{refund_id}/process")
def process_refund(
    refund_id: int,
    req: RefundProcessRequest,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    if not refund:
        raise HTTPException(status_code=404, detail="Refund not found.")

    if refund.status in ["Approved", "Processed", "Completed"] and req.status in ["Approved", "Processed", "Completed"]:
        raise HTTPException(status_code=400, detail="This refund has already been approved and credited.")

    refund.status = req.status
    refund.admin_remarks = req.admin_remarks
    refund.processed_at = datetime.now(timezone.utc)

    # If processed/approved, credit the user's wallet
    if req.status in ["Approved", "Processed", "Completed"]:
        booking = db.query(Booking).filter(Booking.id == refund.booking_id).first()
        if booking:
            booking.status = "Refunded"
            for t in booking.tickets:
                t.status = "CANCELLED"

        wallet = db.query(Wallet).filter(Wallet.user_id == refund.user_id).first()
        if wallet:
            wallet.balance += refund.amount
            tx = WalletTransaction(
                wallet_id=wallet.id,
                amount=refund.amount,
                tx_type="CREDIT",
                description=f"Refund Approved for {refund.refund_id}",
                reference_id=f"RFD-APPRV-{refund.id}"
            )
            db.add(tx)

        notif = Notification(
            user_id=refund.user_id,
            title="Refund Approved & Credited",
            message=f"Refund {refund.refund_id} of ₹{refund.amount:.2f} has been processed to your RailOne Wallet.",
            type="refund"
        )
        db.add(notif)
    elif req.status == "Rejected":
        notif = Notification(
            user_id=refund.user_id,
            title="Refund Update",
            message=f"Refund {refund.refund_id} was rejected: {req.admin_remarks or 'Policy mismatch'}.",
            type="refund"
        )
        db.add(notif)

    db.commit()
    return {"status": "success", "message": f"Refund updated to {req.status}."}

@router.get("/support-tickets")
def get_all_support_tickets(admin: User = Depends(get_current_active_admin), db: Session = Depends(get_db)):
    tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    return tickets

@router.put("/support-tickets/{ticket_id}/reply")
def reply_support_ticket(
    ticket_id: int,
    req: SupportTicketUpdate,
    admin: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Support ticket not found.")

    if req.status:
        ticket.status = req.status
    if req.admin_response:
        ticket.admin_response = req.admin_response
    ticket.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        user_id=ticket.user_id,
        title="Support Ticket Updated",
        message=f"Your support ticket {ticket.ticket_id} has a new response: '{req.admin_response or ticket.status}'",
        type="info"
    )
    db.add(notif)
    db.commit()
    return {"status": "success", "message": "Support ticket updated."}
