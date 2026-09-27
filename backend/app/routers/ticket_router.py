from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.models.all_models import Ticket, Booking

router = APIRouter(prefix="/tickets", tags=["Tickets"])

class TicketResponse(BaseModel):
    ticket_number: str
    passenger_name: str
    passenger_age: int
    passenger_gender: str
    coach: str
    berth: str
    berth_type: str
    status: str
    booking_id: Optional[str] = None
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    source_name: Optional[str] = None
    dest_name: Optional[str] = None
    journey_date: Optional[str] = None

    class Config:
        from_attributes = True

class VerifyTicketRequest(BaseModel):
    qr_data: str

class VerifyTicketResponse(BaseModel):
    is_valid: bool
    ticket_number: Optional[str] = None
    booking_id: Optional[str] = None
    pnr_number: Optional[str] = None
    passenger_name: Optional[str] = None
    status: str
    message: str

@router.get("/{ticket_number}", response_model=TicketResponse)
def get_ticket_by_number(ticket_number: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    booking = ticket.booking
    return TicketResponse(
        ticket_number=ticket.ticket_number,
        passenger_name=ticket.passenger_name,
        passenger_age=ticket.passenger_age,
        passenger_gender=ticket.passenger_gender,
        coach=ticket.coach,
        berth=ticket.berth,
        berth_type=ticket.berth_type,
        status=ticket.status,
        booking_id=booking.booking_id if booking else None,
        train_number=booking.train_number if booking else None,
        train_name=booking.train_name if booking else None,
        source_name=booking.source_name if booking else None,
        dest_name=booking.dest_name if booking else None,
        journey_date=booking.journey_date if booking else None
    )

@router.post("/verify", response_model=VerifyTicketResponse)
def verify_ticket(verify_req: VerifyTicketRequest, db: Session = Depends(get_db)):
    qr_str = verify_req.qr_data.strip()
    # Check if QR matches booking qr_data or ticket number or PNR
    booking = db.query(Booking).filter(
        (Booking.qr_data == qr_str) | 
        (Booking.booking_id == qr_str) | 
        (Booking.pnr_number == qr_str)
    ).first()
    
    if booking:
        first_ticket = booking.tickets[0] if booking.tickets else None
        return VerifyTicketResponse(
            is_valid=(booking.status == "Confirmed"),
            ticket_number=first_ticket.ticket_number if first_ticket else None,
            booking_id=booking.booking_id,
            pnr_number=booking.pnr_number,
            passenger_name=first_ticket.passenger_name if first_ticket else "Passenger",
            status=booking.status,
            message="Verified valid RailOne E-Ticket" if booking.status == "Confirmed" else f"Ticket is {booking.status}"
        )

    # Check individual ticket
    ticket = db.query(Ticket).filter(Ticket.ticket_number == qr_str).first()
    if ticket:
        return VerifyTicketResponse(
            is_valid=(ticket.status == "CNF"),
            ticket_number=ticket.ticket_number,
            booking_id=ticket.booking.booking_id if ticket.booking else None,
            pnr_number=ticket.booking.pnr_number if ticket.booking else None,
            passenger_name=ticket.passenger_name,
            status=ticket.status,
            message="Valid RailOne Ticket" if ticket.status == "CNF" else f"Ticket status: {ticket.status}"
        )

    return VerifyTicketResponse(
        is_valid=False,
        status="Invalid",
        message="Ticket or QR code not found in railway database"
    )
