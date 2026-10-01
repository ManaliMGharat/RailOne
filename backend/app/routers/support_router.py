import secrets
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import User, SupportTicket, Notification
from app.auth.security import get_current_user
from app.schemas.schemas import SupportTicketCreate, SupportTicketResponse

router = APIRouter(prefix="/support", tags=["Railway Support"])

FAQS = [
    {
        "id": 1,
        "category": "Booking",
        "question": "What is the difference between Reserved and UTS Unreserved tickets?",
        "answer": "Reserved tickets guarantee an assigned coach and berth on express/mail trains. UTS (Unreserved Ticketing System) allows commuter travel on suburban locals and general unreserved coaches on the date of issue."
    },
    {
        "id": 2,
        "category": "Platform",
        "question": "How long is a Platform Ticket valid?",
        "answer": "A RailOne Platform Ticket is valid for 2 hours from the exact timestamp of booking at the specified railway station."
    },
    {
        "id": 3,
        "category": "Refunds",
        "question": "What is the refund timeline for cancelled bookings?",
        "answer": "Refunds cancelled through RailOne Wallet are credited instantly (under 60 seconds). For other payment methods, the railway gateway processes refunds within 3-5 business days."
    },
    {
        "id": 4,
        "category": "Suburban",
        "question": "Can I use RailOne on the Mumbai Western, Central, Harbour, and Nerul-Uran lines?",
        "answer": "Yes! RailOne provides complete suburban line coverage across Western (Churchgate-Virar), Central (CSMT-Kalyan), Harbour, Trans-Harbour, and the new Nerul-Uran railway corridor."
    },
    {
        "id": 5,
        "category": "Season Pass",
        "question": "How do I renew my Season Pass?",
        "answer": "Navigate to UTS > Season Ticket, select your origin and destination, and choose Monthly, Quarterly, Half-Yearly, or Yearly. Your pass is issued with an encrypted QR code."
    }
]

@router.get("/faq")
def get_faqs():
    return FAQS

@router.post("/tickets", response_model=SupportTicketResponse)
def create_support_ticket(
    req: SupportTicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_ref = f"SPT-{datetime.now(timezone.utc).strftime('%Y%m')}-{secrets.randbelow(90000) + 10000}"
    ticket = SupportTicket(
        ticket_id=ticket_ref,
        user_id=current_user.id,
        subject=req.subject.strip(),
        message=req.message.strip(),
        category=req.category,
        priority=req.priority,
        status="Submitted"
    )
    db.add(ticket)

    notif = Notification(
        user_id=current_user.id,
        title="Support Ticket Created",
        message=f"Support case {ticket_ref} created. Our 24/7 railway grievance officer will respond shortly.",
        type="info"
    )
    db.add(notif)
    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_user_support_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SupportTicket).filter(
        SupportTicket.user_id == current_user.id
    ).order_by(SupportTicket.created_at.desc()).all()
