import re
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)

    @field_validator("phone")
    @classmethod
    def validate_indian_mobile(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\+]", "", v)
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        if len(cleaned) != 10 or cleaned[0] not in "6789":
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number starting with 6-9.")
        if not re.match(r"^[6-9][0-9a-fA-F]{9}$", cleaned):
            raise ValueError("Phone number must contain only valid digits.")
        return cleaned

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return trimmed

class UserLogin(BaseModel):
    username: str # email or phone
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: str
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_active: bool
    biometric_enabled: bool
    has_mpin: bool = False
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class MPINSetRequest(BaseModel):
    mpin: str = Field(..., min_length=4, max_length=6)

class MPINVerifyRequest(BaseModel):
    mpin: str = Field(..., min_length=4, max_length=6)

class MPINLoginRequest(BaseModel):
    username: str # email or phone
    mpin: str = Field(..., min_length=4, max_length=6)

class MPINChangeRequest(BaseModel):
    old_mpin: str = Field(..., min_length=4, max_length=6)
    new_mpin: str = Field(..., min_length=4, max_length=6)

class OTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

class OTPVerifyRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=4, max_length=6)

class BiometricRegisterRequest(BaseModel):
    credential_id: str
    challenge: str

class BiometricLoginRequest(BaseModel):
    phone_or_email: str
    challenge: str
    credential_id: str

# --- Station Schemas ---
class StationResponse(BaseModel):
    id: int
    station_code: str
    station_name: str
    city: str
    state: str
    railway_zone: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    station_type: Optional[str] = "Regular"
    suburban_line: Optional[str] = None
    suburban_sequence: Optional[int] = None
    active: bool

    model_config = ConfigDict(from_attributes=True)

# --- Train Schemas ---
class TrainRouteResponse(BaseModel):
    sequence: int
    station_code: str
    station_name: str
    arrival: str
    departure: str
    halt_minutes: int
    distance: float

    model_config = ConfigDict(from_attributes=True)

class TrainClassResponse(BaseModel):
    class_code: str
    base_fare: float
    total_seats: int
    available_seats: int

    model_config = ConfigDict(from_attributes=True)

class TrainResponse(BaseModel):
    id: int
    train_number: str
    train_name: str
    source: str
    destination: str
    departure_time: str
    arrival_time: str
    duration: str
    running_days: str
    classes: str
    train_type: str
    active: bool
    routes: List[TrainRouteResponse] = []
    classes_detail: List[TrainClassResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- Fare Calculation Schemas ---
class FareCalculationRequest(BaseModel):
    source_code: str
    dest_code: str
    class_type: str = "ALL" # 1A, 2A, 3A, 3E, SL, 2S, CC, EC, II, FC
    journey_type: str = "reserved" # reserved, unreserved, season, platform
    passenger_count: int = 1
    duration_type: Optional[str] = "Monthly" # For season ticket

class FareOption(BaseModel):
    class_code: str
    class_name: str
    fare_per_passenger: float
    total_fare: float
    distance_km: float

class FareCalculationResponse(BaseModel):
    source_code: str
    source_name: str
    dest_code: str
    dest_name: str
    distance_km: float
    passenger_count: int
    journey_type: str
    fare_options: List[FareOption]

# --- Booking Schemas ---
class PassengerInput(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    berth_preference: Optional[str] = "No Preference"

class BookingCreateRequest(BaseModel):
    train_id: Optional[int] = None
    train_number: str
    train_name: str
    source_code: str
    source_name: str
    dest_code: str
    dest_name: str
    journey_date: str
    class_type: str
    passengers: List[PassengerInput]
    payment_method: str = "Wallet" # Wallet, UPI, Card, NetBanking

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    passenger_name: str
    passenger_age: int
    passenger_gender: str
    coach: str
    berth: str
    berth_type: str
    status: str

    model_config = ConfigDict(from_attributes=True)

class BookingResponse(BaseModel):
    id: int
    booking_id: str
    pnr_number: str
    train_number: str
    train_name: str
    source_code: str
    source_name: str
    dest_code: str
    dest_name: str
    journey_date: str
    class_type: str
    passenger_count: int
    fare_amount: float
    status: str
    qr_data: str
    created_at: datetime
    tickets: List[TicketResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- UTS Unreserved / Platform / Season Tickets ---
class UTSJourneyRequest(BaseModel):
    source_code: str
    dest_code: str
    journey_date: str
    passenger_count: int = 1
    class_type: str = "Second Class" # Second Class, First Class
    payment_method: str = "Wallet"

class PlatformTicketRequest(BaseModel):
    station_code: str
    passenger_count: int = 1
    payment_method: str = "Wallet"

class PlatformTicketResponse(BaseModel):
    id: int
    ticket_number: str
    station_code: str
    station_name: str
    passenger_count: int
    fare: float
    valid_date: str
    valid_hours: int
    qr_data: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SeasonTicketRequest(BaseModel):
    source_code: str
    dest_code: str
    duration_type: str = "Monthly" # Monthly, Quarterly, Half-Yearly, Yearly
    class_type: str = "Second Class" # Second Class, First Class
    passenger_name: str
    passenger_age: int
    payment_method: str = "Wallet"

class SeasonTicketResponse(BaseModel):
    id: int
    pass_number: str
    source_code: str
    source_name: str
    dest_code: str
    dest_name: str
    duration_type: str
    class_type: str
    passenger_name: str
    passenger_age: int
    fare: float
    valid_from: str
    valid_until: str
    qr_data: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- PNR Schemas ---
class PNRPassengerStatus(BaseModel):
    serial_no: int
    name: str
    booking_status: str # e.g. CNF B2 45
    current_status: str # e.g. CNF B2 45
    coach: str
    berth: str
    berth_type: str

class PNRResponse(BaseModel):
    pnr_number: str
    train_number: str
    train_name: str
    source: str
    destination: str
    journey_date: str
    class_type: str
    chart_status: str
    is_demo: bool = True
    passengers: List[PNRPassengerStatus] = []

# --- Coach Position Schemas ---
class CoachItem(BaseModel):
    position: int
    code: str # e.g. ENG, GEN, S1, S2, B1, B2, PC, A1, H1
    label: str
    category: str # Engine, General, Sleeper, AC, Pantry, SLR

class CoachPositionResponse(BaseModel):
    train_number: str
    train_name: str
    platform_number: int
    coaches: List[CoachItem]

# --- Train Tracking Schemas ---
class TrainTrackingStation(BaseModel):
    station_code: str
    station_name: str
    scheduled_arrival: str
    actual_arrival: str
    scheduled_departure: str
    actual_departure: str
    delay_minutes: int
    status: str # Departed, Arrived, Upcoming, Current

class TrainTrackingResponse(BaseModel):
    train_number: str
    train_name: str
    current_station: str
    current_status: str # Running on time, Delayed by 15 mins
    delay_minutes: int
    last_updated: str
    stations: List[TrainTrackingStation]

# --- Wallet Schemas ---
class WalletTransactionResponse(BaseModel):
    id: int
    amount: float
    tx_type: str
    description: str
    reference_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WalletResponse(BaseModel):
    balance: float
    transactions: List[WalletTransactionResponse] = []

class AddMoneyRequest(BaseModel):
    amount: float = Field(..., gt=0, le=50000)
    payment_method: str = "UPI"

# --- Refund Schemas ---
class RefundCreateRequest(BaseModel):
    booking_id: int
    reason: str = Field(..., min_length=5, max_length=500)

class RefundResponse(BaseModel):
    id: int
    refund_id: str
    booking_id: int
    amount: float
    reason: str
    status: str
    admin_remarks: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RefundProcessRequest(BaseModel):
    status: str = Field(..., pattern="^(Approved|Rejected|Processed)$")
    admin_remarks: Optional[str] = None

# --- Food Ordering Schemas ---
class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    is_veg: bool
    category: str
    image_url: Optional[str] = None
    available: bool

    model_config = ConfigDict(from_attributes=True)

class RestaurantResponse(BaseModel):
    id: int
    name: str
    station_code: str
    station_name: str
    rating: float
    delivery_time_mins: int
    image_url: Optional[str] = None
    cuisines: str
    is_pure_veg: bool
    active: bool
    menu_items: List[MenuItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

class FoodOrderItemInput(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., ge=1, le=20)

class FoodOrderCreateRequest(BaseModel):
    restaurant_id: int
    train_number: str
    pnr_number: Optional[str] = None
    delivery_station: str
    coach_berth: str
    items: List[FoodOrderItemInput]

class FoodOrderItemResponse(BaseModel):
    item_name: str
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True)

class FoodOrderResponse(BaseModel):
    id: int
    order_id: str
    train_number: str
    pnr_number: Optional[str] = None
    delivery_station: str
    coach_berth: str
    total_amount: float
    status: str
    created_at: datetime
    items: List[FoodOrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Support Ticket Schemas ---
class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=200)
    message: str = Field(..., min_length=10)
    category: str = "Booking"
    priority: str = "Medium"

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    admin_response: Optional[str] = None

class SupportTicketResponse(BaseModel):
    id: int
    ticket_id: str
    subject: str
    message: str
    category: str
    priority: str
    status: str
    admin_response: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Admin Stats Schemas ---
class AdminStatsResponse(BaseModel):
    total_users: int
    total_stations: int
    total_trains: int
    total_bookings: int
    total_revenue: float
    pending_refunds: int
    open_support_tickets: int
    total_food_orders: int
