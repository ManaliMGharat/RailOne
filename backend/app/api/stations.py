from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.station import Station
from app.schemas.station import StationResponse

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("", response_model=List[StationResponse])
def get_stations(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Station)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Station.code.ilike(search_term),
                Station.name.ilike(search_term),
                Station.city.ilike(search_term),
                Station.state.ilike(search_term)
            )
        )
    return query.order_by(Station.code).offset(skip).limit(limit).all()

@router.get("/search", response_model=List[StationResponse])
def search_stations(
    q: str = Query(..., min_length=1, description="Station code, name, or city"),
    limit: int = 10,
    db: Session = Depends(get_db)
):
    term = f"%{q.strip()}%"
    stations = db.query(Station).filter(
        or_(
            Station.code.ilike(term),
            Station.name.ilike(term),
            Station.city.ilike(term)
        )
    ).limit(limit).all()
    return stations

@router.get("/{station_id}", response_model=StationResponse)
def get_station_by_id(station_id: int, db: Session = Depends(get_db)):
    st = db.query(Station).filter(Station.id == station_id).first()
    if not st:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station not found")
    return st
