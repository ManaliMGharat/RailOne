from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.booking import Booking, BookingPassenger, Payment, Ticket, PnrRecord
from app.schemas.booking import (
    BookingCreateRequest, BookingResponse, BookingPassengerResponse,
    PaymentResponse, TicketResponse, CancellationRequest, CancellationResponse
)
from app.services.booking_service import create_booking
from app.services.cancellation_service import cancel_booking

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def format_booking_response(b: Booking) -> BookingResponse:
    pax_list = []
    for bp in b.passengers:
        pax_list.append(BookingPassengerResponse(
            id=bp.id,
            passenger_name=bp.passenger.full_name if bp.passenger else "Passenger",
            age=bp.passenger.age if bp.passenger else 0,
            gender=bp.passenger.gender if bp.passenger else "MALE",
            coach_number=bp.coach_number,
            seat_number=bp.seat_number,
            berth_type=bp.berth_type,
            booking_status=bp.booking_status,
            current_status=bp.current_status
        ))

    payment_resp = None
    if b.payments:
        last_pay = b.payments[-1]
        payment_resp = PaymentResponse(
            transaction_id=last_pay.transaction_id,
            amount=last_pay.amount,
            payment_method=last_pay.payment_method,
            status=last_pay.status,
            created_at=last_pay.created_at
        )

    ticket_resp = None
    if b.ticket:
        ticket_resp = TicketResponse(
            ticket_number=b.ticket.ticket_number,
            pnr_number=b.ticket.pnr_number,
            qr_code_data=b.ticket.qr_code_data,
            issue_date=b.ticket.issue_date
        )

    pnr_str = b.pnr_record.pnr_number if b.pnr_record else (b.ticket.pnr_number if b.ticket else "N/A")

    return BookingResponse(
        id=b.id,
        booking_reference=b.booking_reference,
        pnr_number=pnr_str,
        train_id=b.train.id,
        train_number=b.train.number,
        train_name=b.train.name,
        from_station_code=b.from_station.code,
        from_station_name=b.from_station.name,
        to_station_code=b.to_station.code,
        to_station_name=b.to_station.name,
        departure_time=b.train.departure_time,
        arrival_time=b.train.arrival_time,
        journey_date=b.journey_date,
        class_code=b.seat_class.code,
        class_name=b.seat_class.name,
        total_fare=b.total_fare,
        status=b.status,
        created_at=b.created_at,
        passengers=pax_list,
        payment=payment_resp,
        ticket=ticket_resp
    )

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_new_booking(
    request: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = create_booking(db=db, user=current_user, request_data=request)
    return format_booking_response(booking)

@router.get("", response_model=List[BookingResponse])
def get_user_bookings(
    status_filter: Optional[str] = Query(None, description="upcoming, completed, or cancelled"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    today = date.today()

    if status_filter == "upcoming":
        query = query.filter(Booking.journey_date >= today, Booking.status != "CANCELLED")
    elif status_filter == "completed":
        query = query.filter(Booking.journey_date < today, Booking.status != "CANCELLED")
    elif status_filter == "cancelled":
        query = query.filter(Booking.status.in_(["CANCELLED", "PARTIALLY_CANCELLED"]))

    bookings = query.order_by(Booking.created_at.desc()).all()
    return [format_booking_response(b) for b in bookings]

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_details(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.user_id != current_user.id and (not current_user.role or current_user.role.name != "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return format_booking_response(booking)

@router.post("/{booking_id}/cancel", response_model=CancellationResponse)
def cancel_ticket_endpoint(
    booking_id: int,
    request: CancellationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = cancel_booking(
        db=db,
        booking_id=booking_id,
        user=current_user,
        passenger_ids=request.passenger_ids
    )
    return CancellationResponse(**result)
