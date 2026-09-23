from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)        # CREATE_TRAIN, UPDATE_STATION, CANCEL_BOOKING, etc.
    entity = Column(String(50), nullable=False)         # Train, Station, Booking, Fare, User
    entity_id = Column(String(50), nullable=True)       # ID or code of modified entity
    description = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow)

    admin_user = relationship("User", back_populates="audit_logs")
