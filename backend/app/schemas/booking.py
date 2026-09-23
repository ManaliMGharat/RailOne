from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

class PassengerInput(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(MALE|FEMALE|TRANSGENDER)$")
    berth_preference: str = "NO_PREFERENCE"  # LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER, WINDOW, NO_PREFERENCE
    id_type: str = "Aadhaar"
    id_number: Optional[str] = None

class BookingCreateRequest(BaseModel):
    train_id: int
    from_station_id: int
    to_station_id: int
    journey_date: date
    class_code: str
    passengers: List[PassengerInput] = Field(..., min_length=1, max_length=6)
    payment_method: str = "UPI"  # UPI, CARD, NETBANKING

class BookingPassengerResponse(BaseModel):
    id: int
    passenger_name: str
    age: int
    gender: str
    coach_number: Optional[str] = None
    seat_number: Optional[int] = None
    berth_type: Optional[str] = None
    booking_status: str
    current_status: str

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    transaction_id: str
    amount: float
    payment_method: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketResponse(BaseModel):
    ticket_number: str
    pnr_number: str
    qr_code_data: str
    issue_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class BookingResponse(BaseModel):
    id: int
    booking_reference: str
    pnr_number: str
    train_id: int
    train_number: str
    train_name: str
    from_station_code: str
    from_station_name: str
    to_station_code: str
    to_station_name: str
    departure_time: str
    arrival_time: str
    journey_date: date
    class_code: str
    class_name: str
    total_fare: float
    status: str
    created_at: datetime
    passengers: List[BookingPassengerResponse]
    payment: Optional[PaymentResponse] = None
    ticket: Optional[TicketResponse] = None

    class Config:
        from_attributes = True

class CancellationRequest(BaseModel):
    passenger_ids: Optional[List[int]] = None  # None or empty cancels all

class CancellationResponse(BaseModel):
    cancellation_reference: str
    booking_reference: str
    cancelled_passengers_count: int
    cancellation_fee: float
    refund_amount: float
    refund_reference: str
    status: str
    processed_at: datetime
