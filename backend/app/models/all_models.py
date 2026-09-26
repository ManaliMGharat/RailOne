import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    mpin_hash = Column(String(255), nullable=True)
    role = Column(String(20), default="user", nullable=False) # user or admin
    dob = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    biometric_enabled = Column(Boolean, default=False, nullable=False)
    biometric_credential_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")
    refunds = relationship("Refund", back_populates="user")
    food_orders = relationship("FoodOrder", back_populates="user")
    season_tickets = relationship("SeasonTicket", back_populates="user")
    platform_tickets = relationship("PlatformTicket", back_populates="user")


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    station_code = Column(String(10), unique=True, index=True, nullable=False)
    station_name = Column(String(120), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    railway_zone = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    station_type = Column(String(50), default="Regular")
    suburban_line = Column(String(50), nullable=True) # Western, Central, Harbour, Trans-Harbour, Nerul-Uran
    suburban_sequence = Column(Integer, nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        Index("idx_station_code_name_city", "station_code", "station_name", "city"),
    )


class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    train_number = Column(String(20), unique=True, index=True, nullable=False)
    train_name = Column(String(120), nullable=False)
    source = Column(String(10), index=True, nullable=False)
    destination = Column(String(10), index=True, nullable=False)
    departure_time = Column(String(10), nullable=False)
    arrival_time = Column(String(10), nullable=False)
    duration = Column(String(20), nullable=False)
    running_days = Column(String(100), default="MON,TUE,WED,THU,FRI,SAT,SUN")
    classes = Column(String(100), default="1A,2A,3A,SL,2S,CC")
    train_type = Column(String(50), default="Express")
    active = Column(Boolean, default=True, nullable=False)

    routes = relationship("TrainRoute", back_populates="train", cascade="all, delete-orphan", order_by="TrainRoute.sequence")
    classes_detail = relationship("TrainClass", back_populates="train", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="train")


class TrainRoute(Base):
    __tablename__ = "train_routes"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    station_code = Column(String(10), nullable=False)
    station_name = Column(String(120), nullable=False)
    sequence = Column(Integer, nullable=False)
    arrival = Column(String(10), nullable=False)
    departure = Column(String(10), nullable=False)
    halt_minutes = Column(Integer, default=2)
    distance = Column(Float, default=0.0)

    train = relationship("Train", back_populates="routes")
    station = relationship("Station")


class TrainClass(Base):
    __tablename__ = "train_classes"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    class_code = Column(String(10), nullable=False) # 1A, 2A, 3A, 3E, SL, 2S, CC, EC
    base_fare = Column(Float, nullable=False)
    total_seats = Column(Integer, default=100)
    available_seats = Column(Integer, default=72)

    train = relationship("Train", back_populates="classes_detail")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(String(30), unique=True, index=True, nullable=False)
    pnr_number = Column(String(10), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=True)
    train_number = Column(String(20), nullable=False)
    train_name = Column(String(120), nullable=False)
    source_code = Column(String(10), nullable=False)
    source_name = Column(String(120), nullable=False)
    dest_code = Column(String(10), nullable=False)
    dest_name = Column(String(120), nullable=False)
    journey_date = Column(String(20), nullable=False)
    class_type = Column(String(10), nullable=False)
    passenger_count = Column(Integer, default=1)
    fare_amount = Column(Float, nullable=False)
    status = Column(String(30), default="Confirmed") # Pending, Confirmed, Cancelled, Completed, Refunded
    qr_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="bookings")
    train = relationship("Train", back_populates="bookings")
    tickets = relationship("Ticket", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking")
    refunds = relationship("Refund", back_populates="booking")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(40), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    passenger_name = Column(String(120), nullable=False)
    passenger_age = Column(Integer, nullable=False)
    passenger_gender = Column(String(20), nullable=False)
    coach = Column(String(10), nullable=False)
    berth = Column(String(10), nullable=False)
    berth_type = Column(String(30), nullable=False)
    status = Column(String(20), default="CNF") # CNF, RAC, WL, CANCELLED

    booking = relationship("Booking", back_populates="tickets")


class PNRRecord(Base):
    __tablename__ = "pnr_records"

    id = Column(Integer, primary_key=True, index=True)
    pnr_number = Column(String(10), unique=True, index=True, nullable=False)
    train_number = Column(String(20), nullable=False)
    train_name = Column(String(120), nullable=False)
    source = Column(String(120), nullable=False)
    destination = Column(String(120), nullable=False)
    journey_date = Column(String(20), nullable=False)
    class_type = Column(String(10), nullable=False)
    chart_status = Column(String(50), default="Chart Prepared")
    passengers_json = Column(Text, nullable=False) # JSON list of passengers, coaches, berths, status
    is_demo = Column(Boolean, default=True)


class PlatformTicket(Base):
    __tablename__ = "platform_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    station_code = Column(String(10), nullable=False)
    station_name = Column(String(120), nullable=False)
    passenger_count = Column(Integer, default=1)
    fare = Column(Float, default=15.0)
    valid_date = Column(String(20), nullable=False)
    valid_hours = Column(Integer, default=2)
    qr_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="platform_tickets")


class SeasonTicket(Base):
    __tablename__ = "season_tickets"

    id = Column(Integer, primary_key=True, index=True)
    pass_number = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_code = Column(String(10), nullable=False)
    source_name = Column(String(120), nullable=False)
    dest_code = Column(String(10), nullable=False)
    dest_name = Column(String(120), nullable=False)
    duration_type = Column(String(30), nullable=False) # Monthly, Quarterly, Half-Yearly, Yearly
    class_type = Column(String(20), default="First Class")
    passenger_name = Column(String(120), nullable=False)
    passenger_age = Column(Integer, nullable=False)
    fare = Column(Float, nullable=False)
    valid_from = Column(String(20), nullable=False)
    valid_until = Column(String(20), nullable=False)
    qr_data = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="season_tickets")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(String(40), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(30), default="Wallet") # Wallet, UPI, Card, NetBanking
    status = Column(String(30), default="Success") # Created, Pending, Success, Failed, Refunded
    transaction_reference = Column(String(80), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    booking = relationship("Booking", back_populates="payments")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    balance = Column(Float, default=1500.0) # Start with welcome balance
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan", order_by="desc(WalletTransaction.created_at)")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    amount = Column(Float, nullable=False)
    tx_type = Column(String(20), nullable=False) # CREDIT, DEBIT
    description = Column(String(255), nullable=False)
    reference_id = Column(String(80), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    wallet = relationship("Wallet", back_populates="transactions")


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    refund_id = Column(String(40), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="Pending") # Pending, Approved, Rejected, Processed
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    processed_at = Column(DateTime, nullable=True)

    booking = relationship("Booking", back_populates="refunds")
    user = relationship("User", back_populates="refunds")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(30), default="info") # info, alert, booking, payment, refund, promotion
    read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="notifications")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    station_code = Column(String(10), index=True, nullable=False)
    station_name = Column(String(120), nullable=False)
    rating = Column(Float, default=4.5)
    delivery_time_mins = Column(Integer, default=25)
    image_url = Column(String(255), nullable=True)
    cuisines = Column(String(200), default="North Indian, Thali, Snacks")
    is_pure_veg = Column(Boolean, default=False)
    active = Column(Boolean, default=True)

    menu_items = relationship("MenuItem", back_populates="restaurant", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(String(255), nullable=True)
    price = Column(Float, nullable=False)
    is_veg = Column(Boolean, default=True)
    category = Column(String(50), default="Meals")
    image_url = Column(String(255), nullable=True)
    available = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="menu_items")


class FoodOrder(Base):
    __tablename__ = "food_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    train_number = Column(String(20), nullable=False)
    pnr_number = Column(String(10), nullable=True)
    delivery_station = Column(String(100), nullable=False)
    coach_berth = Column(String(50), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), default="Preparing") # Placed, Preparing, OutForDelivery, Delivered, Cancelled
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="food_orders")
    items = relationship("FoodOrderItem", back_populates="order", cascade="all, delete-orphan")


class FoodOrderItem(Base):
    __tablename__ = "food_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("food_orders.id"), nullable=False)
    item_name = Column(String(120), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Float, nullable=False)

    order = relationship("FoodOrder", back_populates="items")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(40), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="Booking")
    priority = Column(String(20), default="Medium") # Low, Medium, High, Urgent
    status = Column(String(30), default="Open") # Open, In Progress, Resolved, Closed
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="support_tickets")


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(120), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    berth_preference = Column(String(30), nullable=True)
    id_type = Column(String(50), default="Aadhaar")
    id_number_masked = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utcnow)
