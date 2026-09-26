from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.all_models import Train, TrainRoute, Station
from app.schemas.schemas import (
    TrainResponse, FareCalculationRequest, FareCalculationResponse
)
from app.services.fare_service import calculate_fare

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.get("/search", response_model=List[TrainResponse])
def search_trains(
    from_code: str = Query(..., alias="from", description="Source station code"),
    to_code: str = Query(..., alias="to", description="Destination station code"),
    date: Optional[str] = Query(None, description="Journey date YYYY-MM-DD"),
    class_type: Optional[str] = Query("ALL", description="Coach class type"),
    db: Session = Depends(get_db)
):
    src = from_code.strip().upper()
    dst = to_code.strip().upper()

    # Same-station validation
    if src == dst:
        raise HTTPException(
            status_code=400,
            detail="Origin and destination stations cannot be the same. Please choose different stations."
        )

    # 1. Direct source-destination trains
    direct_trains = db.query(Train).filter(
        Train.active == True,
        Train.source == src,
        Train.destination == dst
    ).all()

    # 2. Trains passing through both stations in correct sequence
    route_trains = []
    # Find all train routes matching source station
    src_routes = db.query(TrainRoute).filter(TrainRoute.station_code == src).all()
    for s_r in src_routes:
        # Check if same train stops at dst with higher sequence
        dst_r = db.query(TrainRoute).filter(
            TrainRoute.train_id == s_r.train_id,
            TrainRoute.station_code == dst,
            TrainRoute.sequence > s_r.sequence
        ).first()
        if dst_r:
            t = db.query(Train).filter(Train.id == s_r.train_id, Train.active == True).first()
            if t and t not in direct_trains and t not in route_trains:
                route_trains.append(t)

    all_matches = direct_trains + route_trains

    # Filter by class_type ONLY if not "ALL"
    req_class = (class_type or "ALL").upper().strip()
    if req_class and req_class != "ALL":
        filtered = []
        for train in all_matches:
            available_classes = [c.strip() for c in train.classes.split(",")]
            if req_class in available_classes:
                filtered.append(train)
        return filtered

    return all_matches

@router.get("/all", response_model=List[TrainResponse])
def get_all_trains(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Train).filter(Train.active == True).limit(limit).all()

@router.get("/{id_or_number}", response_model=TrainResponse)
def get_train_detail(id_or_number: str, db: Session = Depends(get_db)):
    train = None
    if id_or_number.isdigit() and len(id_or_number) < 5:
        train = db.query(Train).filter(Train.id == int(id_or_number)).first()
    if not train:
        train = db.query(Train).filter(Train.train_number == id_or_number.strip()).first()
    if not train:
        raise HTTPException(status_code=404, detail=f"Train '{id_or_number}' not found.")
    return train

@router.post("/fare", response_model=FareCalculationResponse)
def get_fare(req: FareCalculationRequest, db: Session = Depends(get_db)):
    try:
        return calculate_fare(
            db=db,
            source_code=req.source_code,
            dest_code=req.dest_code,
            class_type=req.class_type,
            journey_type=req.journey_type,
            passenger_count=req.passenger_count,
            duration_type=req.duration_type or "Monthly"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
