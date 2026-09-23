from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.orm import relationship
from app.db.session import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(100), index=True, nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    zone = Column(String(20), nullable=True)  # e.g., CR, WR, NR, ER, SR
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    source_trains = relationship("Train", foreign_keys="Train.source_station_id", back_populates="source_station")
    destination_trains = relationship("Train", foreign_keys="Train.destination_station_id", back_populates="destination_station")
    train_stops = relationship("TrainStop", back_populates="station")
