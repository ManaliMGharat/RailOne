from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.train import Train, SeatClass, Fare
from app.schemas.train import TrainSearchResult, TrainResponse, TrainStopResponse, ClassAvailabilityResponse
from app.services.search_service import search_trains, get_or_create_availability

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/search", response_model=List[TrainSearchResult])
def search_trains_endpoint(
    from_station: str = Query(..., description="From Station code or city"),
    to_station: str = Query(..., description="To Station code or city"),
    journey_date: date = Query(..., description="Date of journey (YYYY-MM-DD)"),
    travel_class: Optional[str] = Query("ALL", description="1A, 2A, 3A, SL, CC, 2S, or ALL"),
    db: Session = Depends(get_db)
):
    results = search_trains(
        db=db,
        from_query=from_station,
        to_query=to_station,
        journey_date=journey_date,
        travel_class=travel_class
    )
    return results

@router.get("/{train_id}", response_model=TrainResponse)
def get_train_details(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")

    stops_resp = []
    for s in sorted(train.stops, key=lambda x: x.stop_number):
        stops_resp.append(TrainStopResponse(
            stop_number=s.stop_number,
            station_code=s.station.code,
            station_name=s.station.name,
            city=s.station.city,
            arrival_time=s.arrival_time,
            departure_time=s.departure_time,
            halt_minutes=s.halt_minutes,
            distance_from_origin_km=s.distance_from_origin_km,
            day_count=s.day_count
        ))

    return TrainResponse(
        id=train.id,
        number=train.number,
        name=train.name,
        source_station_id=train.source_station_id,
        destination_station_id=train.destination_station_id,
        departure_time=train.departure_time,
        arrival_time=train.arrival_time,
        duration=train.duration,
        running_days=train.running_days,
        train_type=train.train_type,
        is_active=train.is_active,
        source_station=train.source_station,
        destination_station=train.destination_station,
        stops=stops_resp
    )

@router.get("/{train_id}/route", response_model=List[TrainStopResponse])
def get_train_route(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")

    stops_resp = []
    for s in sorted(train.stops, key=lambda x: x.stop_number):
        stops_resp.append(TrainStopResponse(
            stop_number=s.stop_number,
            station_code=s.station.code,
            station_name=s.station.name,
            city=s.station.city,
            arrival_time=s.arrival_time,
            departure_time=s.departure_time,
            halt_minutes=s.halt_minutes,
            distance_from_origin_km=s.distance_from_origin_km,
            day_count=s.day_count
        ))
    return stops_resp

@router.get("/{train_id}/availability", response_model=List[ClassAvailabilityResponse])
def get_train_availability(
    train_id: int,
    journey_date: date = Query(..., description="Journey date YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Train not found")

    classes = db.query(SeatClass).all()
    results = []

    for sc in classes:
        avail = get_or_create_availability(db, train.id, journey_date, sc.id)
        fare_rec = db.query(Fare).filter(
            Fare.train_id == train.id,
            Fare.class_id == sc.id
        ).first()

        fare_amount = fare_rec.total_fare if fare_rec else 400.0

        if avail.available_seats > 0:
            status_label = f"AVAILABLE {avail.available_seats}"
        elif avail.rac_seats < 10:
            status_label = f"RAC {avail.rac_seats + 1}"
        else:
            status_label = f"WL {avail.waiting_list + 1}"

        results.append(ClassAvailabilityResponse(
            class_code=sc.code,
            class_name=sc.name,
            total_seats=avail.total_seats,
            available_seats=avail.available_seats,
            booked_seats=avail.booked_seats,
            rac_seats=avail.rac_seats,
            waiting_list=avail.waiting_list,
            status_label=status_label,
            base_fare=round(fare_amount * 0.85, 2),
            total_fare=round(fare_amount, 2)
        ))

    return results
