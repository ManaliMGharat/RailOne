from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class SeatClass(Base):
    __tablename__ = "seat_classes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False)  # 1A, 2A, 3A, SL, CC, 2S
    name = Column(String(50), nullable=False)
    description = Column(String(200), nullable=True)

    coaches = relationship("Coach", back_populates="seat_class")
    fares = relationship("Fare", back_populates="seat_class")
    availabilities = relationship("Availability", back_populates="seat_class")

class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(10), unique=True, index=True, nullable=False)  # e.g., 12951
    name = Column(String(100), index=True, nullable=False)                # e.g., Mumbai Rajdhani Express
    source_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    destination_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    departure_time = Column(String(10), nullable=False)                   # e.g., "17:00"
    arrival_time = Column(String(10), nullable=False)                     # e.g., "08:32"
    duration = Column(String(20), nullable=False)                         # e.g., "15h 32m"
    running_days = Column(String(50), nullable=False)                     # e.g., "MON,TUE,WED,THU,FRI,SAT,SUN"
    train_type = Column(String(50), default="Superfast Express")         # Rajdhani, Shatabdi, Vande Bharat, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source_station = relationship("Station", foreign_keys=[source_station_id], back_populates="source_trains")
    destination_station = relationship("Station", foreign_keys=[destination_station_id], back_populates="destination_trains")
    routes = relationship("TrainRoute", back_populates="train", cascade="all, delete-orphan")
    stops = relationship("TrainStop", back_populates="train", order_by="TrainStop.stop_number", cascade="all, delete-orphan")
    coaches = relationship("Coach", back_populates="train", cascade="all, delete-orphan")
    fares = relationship("Fare", back_populates="train", cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="train", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="train")

class TrainRoute(Base):
    __tablename__ = "train_routes"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    route_name = Column(String(100), nullable=True)
    total_distance_km = Column(Float, default=0.0)

    train = relationship("Train", back_populates="routes")

class TrainStop(Base):
    __tablename__ = "train_stops"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    stop_number = Column(Integer, nullable=False)
    arrival_time = Column(String(10), nullable=False)       # "16:50" or "--" for origin
    departure_time = Column(String(10), nullable=False)     # "17:00" or "--" for destination
    halt_minutes = Column(Integer, default=0)
    distance_from_origin_km = Column(Float, default=0.0)
    day_count = Column(Integer, default=1)                 # Day 1, Day 2

    __table_args__ = (
        UniqueConstraint("train_id", "stop_number", name="uq_train_stop_number"),
    )

    train = relationship("Train", back_populates="stops")
    station = relationship("Station", back_populates="train_stops")

class Coach(Base):
    __tablename__ = "coaches"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    coach_number = Column(String(10), nullable=False)       # e.g., "B1", "B2", "S1", "A1", "H1"
    class_id = Column(Integer, ForeignKey("seat_classes.id"), nullable=False)
    total_seats = Column(Integer, default=72)

    train = relationship("Train", back_populates="coaches")
    seat_class = relationship("SeatClass", back_populates="coaches")
    seats = relationship("Seat", back_populates="coach", cascade="all, delete-orphan")

class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    coach_id = Column(Integer, ForeignKey("coaches.id"), nullable=False)
    seat_number = Column(Integer, nullable=False)
    berth_type = Column(String(20), nullable=False)         # LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER, WINDOW

    __table_args__ = (
        UniqueConstraint("coach_id", "seat_number", name="uq_coach_seat"),
    )

    coach = relationship("Coach", back_populates="seats")

class Fare(Base):
    __tablename__ = "fares"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    from_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    to_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("seat_classes.id"), nullable=False)
    base_fare = Column(Float, nullable=False)
    reservation_charge = Column(Float, default=40.0)
    superfast_charge = Column(Float, default=45.0)
    gst = Column(Float, default=0.0)
    total_fare = Column(Float, nullable=False)

    train = relationship("Train", back_populates="fares")
    seat_class = relationship("SeatClass", back_populates="fares")
    from_station = relationship("Station", foreign_keys=[from_station_id])
    to_station = relationship("Station", foreign_keys=[to_station_id])

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    journey_date = Column(Date, nullable=False, index=True)
    class_id = Column(Integer, ForeignKey("seat_classes.id"), nullable=False)
    total_seats = Column(Integer, default=100)
    booked_seats = Column(Integer, default=0)
    available_seats = Column(Integer, default=100)
    rac_seats = Column(Integer, default=0)
    waiting_list = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("train_id", "journey_date", "class_id", name="uq_train_date_class"),
    )

    train = relationship("Train", back_populates="availabilities")
    seat_class = relationship("SeatClass", back_populates="availabilities")
