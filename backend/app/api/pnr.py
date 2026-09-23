from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.booking import PnrRecord, BookingPassenger
from app.schemas.pnr import PnrStatusResponse
from app.schemas.booking import BookingPassengerResponse

router = APIRouter(prefix="/pnr", tags=["PNR Status"])

@router.get("/{pnr}", response_model=PnrStatusResponse)
def get_pnr_status(pnr: str, db: Session = Depends(get_db)):
    clean_pnr = pnr.replace("-", "").strip()
    pnr_rec = db.query(PnrRecord).filter(PnrRecord.pnr_number == clean_pnr).first()

    if not pnr_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PNR not found. Please verify the 10-digit PNR number."
        )

    booking = pnr_rec.booking
    pax_list = []
    for bp in booking.passengers:
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

    return PnrStatusResponse(
        pnr_number=pnr_rec.pnr_number,
        booking_reference=booking.booking_reference,
        train_number=booking.train.number,
        train_name=booking.train.name,
        journey_date=booking.journey_date,
        from_station_code=booking.from_station.code,
        from_station_name=booking.from_station.name,
        to_station_code=booking.to_station.code,
        to_station_name=booking.to_station.name,
        departure_time=booking.train.departure_time,
        arrival_time=booking.train.arrival_time,
        class_code=booking.seat_class.code,
        class_name=booking.seat_class.name,
        chart_status="Chart Not Prepared",
        booking_status=booking.status,
        passengers=pax_list
    )
