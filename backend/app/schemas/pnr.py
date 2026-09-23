from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel
from app.schemas.booking import BookingPassengerResponse

class PnrStatusResponse(BaseModel):
    pnr_number: str
    booking_reference: str
    train_number: str
    train_name: str
    journey_date: date
    from_station_code: str
    from_station_name: str
    to_station_code: str
    to_station_name: str
    departure_time: str
    arrival_time: str
    class_code: str
    class_name: str
    chart_status: str  # e.g., "Chart Not Prepared" or "Chart Prepared"
    booking_status: str
    passengers: List[BookingPassengerResponse]
