from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.database import get_db
from app.models.all_models import Station
from app.schemas.schemas import StationResponse

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("/search", response_model=List[StationResponse])
def search_stations(
    q: str = Query(..., min_length=1, description="Station code, name, or city"),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query_str = q.strip()
    # Case-insensitive search on code, name, and city
    results = db.query(Station).filter(
        Station.active == True,
        or_(
            Station.station_code.ilike(f"{query_str}%"),
            Station.station_name.ilike(f"%{query_str}%"),
            Station.city.ilike(f"%{query_str}%")
        )
    ).order_by(
        # Prioritize exact code matches, then prefix matches, then name
        func.length(Station.station_code),
        Station.station_name
    ).limit(limit).all()

    return results

@router.get("/popular", response_model=List[StationResponse])
def get_popular_stations(db: Session = Depends(get_db)):
    popular_codes = [
        "MMCT", "CSMT", "PUNE", "NDLS", "HWH", "MAS", "SBC", "ADI",
        "NEU", "UNR", "BMDR", "BVI", "TNA", "KYN", "PNVL", "JP"
    ]
    stations = db.query(Station).filter(
        Station.station_code.in_(popular_codes),
        Station.active == True
    ).all()
    # Sort according to popular_codes order
    code_index = {code: i for i, code in enumerate(popular_codes)}
    stations.sort(key=lambda s: code_index.get(s.station_code, 99))
    return stations

@router.get("/recent", response_model=List[StationResponse])
def get_recent_stations(db: Session = Depends(get_db)):
    # Default top suburban and transit hubs for quick picker
    recent_codes = ["MMCT", "PUNE", "CSMT", "NEU", "UNR", "BVI"]
    stations = db.query(Station).filter(
        Station.station_code.in_(recent_codes),
        Station.active == True
    ).all()
    return stations

@router.get("/all", response_model=List[StationResponse])
def get_all_stations(limit: int = 300, db: Session = Depends(get_db)):
    return db.query(Station).filter(Station.active == True).order_by(Station.station_name).limit(limit).all()

@router.get("/suburban/{line}", response_model=List[StationResponse])
def get_suburban_stations(line: str, db: Session = Depends(get_db)):
    # Western, Central, Harbour, Trans-Harbour, Nerul-Uran
    stations = db.query(Station).filter(
        Station.suburban_line.ilike(f"%{line}%"),
        Station.active == True
    ).order_by(Station.suburban_sequence).all()
    return stations

@router.get("/{code}", response_model=StationResponse)
def get_station_by_code(code: str, db: Session = Depends(get_db)):
    clean_code = code.strip().upper()
    station = db.query(Station).filter(Station.station_code == clean_code).first()
    if not station:
        raise HTTPException(status_code=404, detail=f"Station with code '{code}' not found.")
    return station
