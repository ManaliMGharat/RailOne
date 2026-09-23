from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.session import Base

class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)             # MALE, FEMALE, TRANSGENDER
    berth_preference = Column(String(20), default="NO_PREFERENCE")  # LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER, WINDOW
    id_type = Column(String(30), default="Aadhaar")         # Aadhaar, PAN, Passport, Driving License, Voter ID
    id_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking_passengers = relationship("BookingPassenger", back_populates="passenger")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    train_id = Column(Integer, ForeignKey("trains.id"), nullable=False)
    from_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    to_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("seat_classes.id"), nullable=False)
    journey_date = Column(Date, nullable=False, index=True)
    total_fare = Column(Float, nullable=False)
    status = Column(String(20), default="CONFIRMED")       # CONFIRMED, WL, CANCELLED, PARTIALLY_CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    train = relationship("Train", back_populates="bookings")
    from_station = relationship("Station", foreign_keys=[from_station_id])
    to_station = relationship("Station", foreign_keys=[to_station_id])
    seat_class = relationship("SeatClass")
    passengers = relationship("BookingPassenger", back_populates="booking", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    ticket = relationship("Ticket", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    pnr_record = relationship("PnrRecord", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    cancellations = relationship("Cancellation", back_populates="booking", cascade="all, delete-orphan")

class BookingPassenger(Base):
    __tablename__ = "booking_passengers"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    passenger_id = Column(Integer, ForeignKey("passengers.id"), nullable=False)
    coach_number = Column(String(10), nullable=True)       # e.g., "B2", "S3"
    seat_number = Column(Integer, nullable=True)           # e.g., 36
    berth_type = Column(String(20), nullable=True)         # LOWER, MIDDLE, UPPER, SIDE_LOWER, SIDE_UPPER
    booking_status = Column(String(20), default="CNF")     # CNF, RAC, WL, CANCELLED
    current_status = Column(String(20), default="CNF")     # CNF, RAC, WL, CANCELLED

    booking = relationship("Booking", back_populates="passengers")
    passenger = relationship("Passenger", back_populates="booking_passengers")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    transaction_id = Column(String(50), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String(30), nullable=False)     # UPI, CARD, NETBANKING
    status = Column(String(20), default="SUCCESS")         # SUCCESS, FAILED, REFUNDED
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")

class PnrRecord(Base):
    __tablename__ = "pnr_records"

    id = Column(Integer, primary_key=True, index=True)
    pnr_number = Column(String(10), unique=True, index=True, nullable=False) # 10 digits
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    journey_date = Column(Date, nullable=False)
    status = Column(String(20), default="CONFIRMED")
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="pnr_record")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    pnr_number = Column(String(10), index=True, nullable=False)
    qr_code_data = Column(String(255), nullable=False)
    issue_date = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="ticket")

class Cancellation(Base):
    __tablename__ = "cancellations"

    id = Column(Integer, primary_key=True, index=True)
    cancellation_reference = Column(String(50), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    cancelled_passengers_count = Column(Integer, nullable=False)
    cancellation_fee = Column(Float, nullable=False)
    refund_amount = Column(Float, nullable=False)
    status = Column(String(20), default="PROCESSED")        # PROCESSED, PENDING, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="cancellations")
    refund = relationship("Refund", back_populates="cancellation", uselist=False, cascade="all, delete-orphan")

class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    cancellation_id = Column(Integer, ForeignKey("cancellations.id"), nullable=False)
    refund_reference = Column(String(50), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="PROCESSED")        # PROCESSED, IN_TRANSIT, FAILED
    processed_at = Column(DateTime, default=datetime.utcnow)

    cancellation = relationship("Cancellation", back_populates="refund")
