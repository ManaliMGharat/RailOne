import secrets
import random
from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.all_models import (
    User, Station, PlatformTicket, SeasonTicket, Wallet, WalletTransaction, Notification
)
from app.auth.security import get_current_user
from app.schemas.schemas import (
    PlatformTicketRequest, PlatformTicketResponse,
    SeasonTicketRequest, SeasonTicketResponse,
    UTSJourneyRequest, BookingResponse, TicketResponse
)
from app.services.fare_service import calculate_fare

platform_router = APIRouter(prefix="/platform", tags=["Platform Tickets"])
season_router = APIRouter(prefix="/season", tags=["Season Tickets"])
uts_router = APIRouter(prefix="/uts", tags=["UTS Unreserved Tickets"])

# --- Platform Tickets ---
@platform_router.post("", response_model=PlatformTicketResponse)
def buy_platform_ticket(
    req: PlatformTicketRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    station = db.query(Station).filter(Station.station_code == req.station_code.strip().upper()).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found.")

    fare_per_pax = 15.0
    total_fare = fare_per_pax * req.passenger_count

    # Check wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < total_fare:
        avail = wallet.balance if wallet else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient wallet balance (₹{avail:.2f}). Required: ₹{total_fare:.2f}."
        )

    wallet.balance -= total_fare
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=total_fare,
        tx_type="DEBIT",
        description=f"Platform Ticket at {station.station_name} ({req.passenger_count} pax)",
        reference_id=f"PLT-{secrets.token_hex(6).upper()}"
    )
    db.add(tx)

    ticket_no = f"PLT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.randbelow(90000) + 10000}"
    qr_data = f"RO-PLATFORM:{ticket_no}:{station.station_code}:{secrets.token_hex(6)}"

    plt = PlatformTicket(
        ticket_number=ticket_no,
        user_id=current_user.id,
        station_code=station.station_code,
        station_name=station.station_name,
        passenger_count=req.passenger_count,
        fare=total_fare,
        valid_date=datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M'),
        valid_hours=2,
        qr_data=qr_data
    )
    db.add(plt)

    notif = Notification(
        user_id=current_user.id,
        title="Platform Ticket Issued",
        message=f"Platform ticket for {station.station_name} is valid for 2 hours.",
        type="booking"
    )
    db.add(notif)
    db.commit()
    db.refresh(plt)
    return plt

@platform_router.get("", response_model=List[PlatformTicketResponse])
def get_user_platform_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PlatformTicket).filter(
        PlatformTicket.user_id == current_user.id
    ).order_by(PlatformTicket.created_at.desc()).all()


# --- Season Tickets ---
@season_router.post("", response_model=SeasonTicketResponse)
def buy_season_ticket(
    req: SeasonTicketRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    src = req.source_code.strip().upper()
    dst = req.dest_code.strip().upper()

    if src == dst:
        raise HTTPException(status_code=400, detail="Source and destination stations cannot be the same.")

    src_station = db.query(Station).filter(Station.station_code == src).first()
    dst_station = db.query(Station).filter(Station.station_code == dst).first()

    src_name = src_station.station_name if src_station else src
    dst_name = dst_station.station_name if dst_station else dst

    fare_calc = calculate_fare(
        db=db,
        source_code=src,
        dest_code=dst,
        journey_type="season",
        duration_type=req.duration_type,
        passenger_count=1
    )
    total_fare = 350.0
    for opt in fare_calc.fare_options:
        if "First" in req.class_type and "FC" in opt.class_code:
            total_fare = opt.total_fare
            break
        elif "Second" in req.class_type and "II" in opt.class_code:
            total_fare = opt.total_fare
            break

    # Deduct wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < total_fare:
        avail = wallet.balance if wallet else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient wallet balance (₹{avail:.2f}). Required: ₹{total_fare:.2f}."
        )

    wallet.balance -= total_fare
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=total_fare,
        tx_type="DEBIT",
        description=f"Season Pass ({req.duration_type}) {src} -> {dst}",
        reference_id=f"SP-{secrets.token_hex(6).upper()}"
    )
    db.add(tx)

    # Validity dates
    start_date = datetime.now(timezone.utc)
    days_valid = 30
    if req.duration_type == "Quarterly":
        days_valid = 90
    elif req.duration_type == "Half-Yearly":
        days_valid = 180
    elif req.duration_type == "Yearly":
        days_valid = 365
    end_date = start_date + timedelta(days=days_valid)

    pass_no = f"RO-PASS-{datetime.now(timezone.utc).strftime('%Y%m')}-{secrets.randbelow(90000) + 10000}"
    qr_data = f"RO-SEASON:{pass_no}:{src}:{dst}:{req.class_type}:{end_date.strftime('%Y%m%d')}"

    season_pass = SeasonTicket(
        pass_number=pass_no,
        user_id=current_user.id,
        source_code=src,
        source_name=src_name,
        dest_code=dst,
        dest_name=dst_name,
        duration_type=req.duration_type,
        class_type=req.class_type,
        passenger_name=req.passenger_name.strip(),
        passenger_age=req.passenger_age,
        fare=total_fare,
        valid_from=start_date.strftime('%Y-%m-%d'),
        valid_until=end_date.strftime('%Y-%m-%d'),
        qr_data=qr_data
    )
    db.add(season_pass)

    notif = Notification(
        user_id=current_user.id,
        title="Season Pass Activated!",
        message=f"Your {req.duration_type} pass for {src} - {dst} is active until {end_date.strftime('%d %b %Y')}.",
        type="booking"
    )
    db.add(notif)
    db.commit()
    db.refresh(season_pass)
    return season_pass

@season_router.get("", response_model=List[SeasonTicketResponse])
def get_user_season_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(SeasonTicket).filter(
        SeasonTicket.user_id == current_user.id
    ).order_by(SeasonTicket.created_at.desc()).all()


# --- UTS Unreserved Journey ---
@uts_router.post("/journey")
def book_uts_journey(
    req: UTSJourneyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    src = req.source_code.strip().upper()
    dst = req.dest_code.strip().upper()

    if src == dst:
        raise HTTPException(status_code=400, detail="Source and destination stations cannot be the same.")

    src_station = db.query(Station).filter(Station.station_code == src).first()
    dst_station = db.query(Station).filter(Station.station_code == dst).first()
    src_name = src_station.station_name if src_station else src
    dst_name = dst_station.station_name if dst_station else dst

    fare_calc = calculate_fare(
        db=db,
        source_code=src,
        dest_code=dst,
        journey_type="unreserved",
        passenger_count=req.passenger_count
    )
    total_fare = 20.0
    for opt in fare_calc.fare_options:
        if "First" in req.class_type and "FC" in opt.class_code:
            total_fare = opt.total_fare
            break
        elif "Second" in req.class_type and "II" in opt.class_code:
            total_fare = opt.total_fare
            break

    # Deduct wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet or wallet.balance < total_fare:
        avail = wallet.balance if wallet else 0.0
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient wallet balance (₹{avail:.2f}). Required: ₹{total_fare:.2f}."
        )

    wallet.balance -= total_fare
    tx = WalletTransaction(
        wallet_id=wallet.id,
        amount=total_fare,
        tx_type="DEBIT",
        description=f"UTS Ticket {src} -> {dst} ({req.passenger_count} pax)",
        reference_id=f"UTS-{secrets.token_hex(6).upper()}"
    )
    db.add(tx)

    ticket_no = f"UTS-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{secrets.randbelow(90000) + 10000}"
    qr_data = f"RO-UTS:{ticket_no}:{src}:{dst}:{req.passenger_count}PAX:{secrets.token_hex(6)}"

    notif = Notification(
        user_id=current_user.id,
        title="UTS Ticket Booked",
        message=f"UTS unreserved ticket for {src} to {dst} booked successfully.",
        type="booking"
    )
    db.add(notif)
    db.commit()

    return {
        "status": "success",
        "ticket_number": ticket_no,
        "source": src_name,
        "destination": dst_name,
        "source_code": src,
        "dest_code": dst,
        "passenger_count": req.passenger_count,
        "class_type": req.class_type,
        "journey_date": req.journey_date,
        "fare": total_fare,
        "valid_until": (datetime.now(timezone.utc) + timedelta(hours=3)).strftime('%Y-%m-%d %H:%M'),
        "qr_data": qr_data
    }
