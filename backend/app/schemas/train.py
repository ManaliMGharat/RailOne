from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.station import StationResponse

class TrainStopResponse(BaseModel):
    stop_number: int
    station_code: str
    station_name: str
    city: str
    arrival_time: str
    departure_time: str
    halt_minutes: int
    distance_from_origin_km: float
    day_count: int

    class Config:
        from_attributes = True

class ClassAvailabilityResponse(BaseModel):
    class_code: str
    class_name: str
    total_seats: int
    available_seats: int
    booked_seats: int
    rac_seats: int
    waiting_list: int
    status_label: str  # e.g., "AVAILABLE 45", "RAC 5", "WL 12"
    base_fare: float
    total_fare: float

class TrainSearchResult(BaseModel):
    id: int
    number: str
    name: str
    train_type: str
    from_station_code: str
    from_station_name: str
    to_station_code: str
    to_station_name: str
    departure_time: str
    arrival_time: str
    duration: str
    running_days: List[str]
    runs_on_requested_date: bool
    classes: List[ClassAvailabilityResponse]
    min_fare: float

class TrainBase(BaseModel):
    number: str = Field(..., min_length=4, max_length=10)
    name: str = Field(..., min_length=3, max_length=100)
    source_station_id: int
    destination_station_id: int
    departure_time: str
    arrival_time: str
    duration: str
    running_days: str = "MON,TUE,WED,THU,FRI,SAT,SUN"
    train_type: str = "Superfast Express"
    is_active: bool = True

class TrainCreate(TrainBase):
    pass

class TrainUpdate(BaseModel):
    name: Optional[str] = None
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    duration: Optional[str] = None
    running_days: Optional[str] = None
    train_type: Optional[str] = None
    is_active: Optional[bool] = None

class TrainResponse(TrainBase):
    id: int
    source_station: Optional[StationResponse] = None
    destination_station: Optional[StationResponse] = None
    stops: Optional[List[TrainStopResponse]] = []

    class Config:
        from_attributes = True
