import random
import uuid
from datetime import datetime, date
from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, Notification
from app.models.station import Station
from app.models.train import Train, SeatClass, Availability, Coach, Seat, Fare
from app.models.booking import (
    Passenger, Booking, BookingPassenger, Payment, Ticket, PnrRecord
)
from app.schemas.booking import BookingCreateRequest

BERTH_CYCLE = ["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER"]

def generate_unique_pnr(db: Session) -> str:
    """Generate a unique 10-digit PNR starting with a 3-digit zone prefix (e.g., 234-XXXXXXX)."""
    while True:
        prefix = random.choice(["210", "220", "230", "420", "630", "840", "850"])
        suffix = f"{random.randint(1000000, 9999999)}"
        pnr = f"{prefix}{suffix}"
        
        existing = db.query(PnrRecord).filter(PnrRecord.pnr_number == pnr).first()
        if not existing:
            return pnr

def create_booking(db: Session, user: User, request_data: BookingCreateRequest) -> Booking:
    train = db.query(Train).filter(Train.id == request_data.train_id, Train.is_active == True).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found or inactive")

    seat_class = db.query(SeatClass).filter(SeatClass.code == request_data.class_code).first()
    if not seat_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Seat class not found")

    from_station = db.query(Station).filter(Station.id == request_data.from_station_id).first()
    to_station = db.query(Station).filter(Station.id == request_data.to_station_id).first()
    if not from_station or not to_station:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid station selection")

    num_passengers = len(request_data.passengers)
    if num_passengers < 1 or num_passengers > 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passenger count must be between 1 and 6")

    # Fetch or initialize availability
    avail = db.query(Availability).filter(
        Availability.train_id == train.id,
        Availability.journey_date == request_data.journey_date,
        Availability.class_id == seat_class.id
    ).with_for_update().first() if db.bind.dialect.name != "sqlite" else db.query(Availability).filter(
        Availability.train_id == train.id,
        Availability.journey_date == request_data.journey_date,
        Availability.class_id == seat_class.id
    ).first()

    if not avail:
        avail = Availability(
            train_id=train.id,
            journey_date=request_data.journey_date,
            class_id=seat_class.id,
            total_seats=72,
            booked_seats=0,
            available_seats=72,
            rac_seats=0,
            waiting_list=0
        )
        db.add(avail)
        db.flush()

    # Determine fare per passenger
    fare_rec = db.query(Fare).filter(
        Fare.train_id == train.id,
        Fare.class_id == seat_class.id
    ).first()
    if fare_rec:
        per_ticket_fare = fare_rec.total_fare
    else:
        base_mult = {"1A": 2200, "2A": 1400, "3A": 950, "CC": 650, "SL": 380, "2S": 180}.get(seat_class.code, 450)
        per_ticket_fare = float(base_mult)

    total_amount = round(per_ticket_fare * num_passengers, 2)

    # Determine coach prefix
    coach_prefix_map = {
        "1A": "H",
        "2A": "A",
        "3A": "B",
        "CC": "C",
        "SL": "S",
        "2S": "D"
    }
    coach_prefix = coach_prefix_map.get(seat_class.code, "B")
    coach_num = f"{coach_prefix}1"

    # Create Booking entity
    booking_ref = f"RO-{uuid.uuid4().hex[:8].upper()}"
    pnr_num = generate_unique_pnr(db)

    booking = Booking(
        booking_reference=booking_ref,
        user_id=user.id,
        train_id=train.id,
        from_station_id=from_station.id,
        to_station_id=to_station.id,
        class_id=seat_class.id,
        journey_date=request_data.journey_date,
        total_fare=total_amount,
        status="CONFIRMED" if avail.available_seats >= num_passengers else ("RAC" if avail.rac_seats < 10 else "WL")
    )
    db.add(booking)
    db.flush()

    # Process each passenger
    for idx, p_input in enumerate(request_data.passengers):
        passenger = Passenger(
            full_name=p_input.full_name,
            age=p_input.age,
            gender=p_input.gender,
            berth_preference=p_input.berth_preference,
            id_type=p_input.id_type,
            id_number=p_input.id_number
        )
        db.add(passenger)
        db.flush()

        # Seat / Berth assignment
        if avail.available_seats > 0:
            avail.booked_seats += 1
            avail.available_seats -= 1
            seat_num = ((avail.booked_seats - 1) % 72) + 1
            coach_idx = ((avail.booked_seats - 1) // 72) + 1
            assigned_coach = f"{coach_prefix}{coach_idx}"
            assigned_berth = p_input.berth_preference if p_input.berth_preference in BERTH_CYCLE else BERTH_CYCLE[(seat_num - 1) % len(BERTH_CYCLE)]
            b_status = "CNF"
            c_status = "CNF"
        elif avail.rac_seats < 10:
            avail.rac_seats += 1
            assigned_coach = None
            seat_num = None
            assigned_berth = None
            b_status = f"RAC {avail.rac_seats}"
            c_status = f"RAC {avail.rac_seats}"
        else:
            avail.waiting_list += 1
            assigned_coach = None
            seat_num = None
            assigned_berth = None
            b_status = f"WL {avail.waiting_list}"
            c_status = f"WL {avail.waiting_list}"

        bp = BookingPassenger(
            booking_id=booking.id,
            passenger_id=passenger.id,
            coach_number=assigned_coach,
            seat_number=seat_num,
            berth_type=assigned_berth,
            booking_status=b_status,
            current_status=c_status
        )
        db.add(bp)

    # Record Mock Payment
    payment = Payment(
        booking_id=booking.id,
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        amount=total_amount,
        payment_method=request_data.payment_method.upper(),
        status="SUCCESS"
    )
    db.add(payment)

    # Record PNR Record
    pnr_record = PnrRecord(
        pnr_number=pnr_num,
        booking_id=booking.id,
        journey_date=request_data.journey_date,
        status="CONFIRMED"
    )
    db.add(pnr_record)

    # Generate Digital Ticket
    ticket_num = f"TKT-{uuid.uuid4().hex[:10].upper()}"
    qr_data = f"RAILONE|PNR:{pnr_num}|TR:{train.number}|DT:{request_data.journey_date}|PAX:{num_passengers}|AMT:{total_amount}"
    ticket = Ticket(
        booking_id=booking.id,
        ticket_number=ticket_num,
        pnr_number=pnr_num,
        qr_code_data=qr_data,
        issue_date=datetime.utcnow()
    )
    db.add(ticket)

    # User Notification
    notification = Notification(
        user_id=user.id,
        title="Booking Confirmed! 🚆",
        message=f"Your ticket on {train.number} - {train.name} for {request_data.journey_date} is confirmed! PNR: {pnr_num}",
        notification_type="BOOKING_SUCCESS"
    )
    db.add(notification)

    db.commit()
    db.refresh(booking)
    return booking
