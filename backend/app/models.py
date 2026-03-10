from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SqlEnum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .database import Base


class TripStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISRUPTED = "disrupted"


class TriggerType(str, Enum):
    ENVIRONMENTAL = "environmental"
    CIVIC = "civic"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    platform_trip_id = Column(String, index=True)
    worker_id = Column(String, index=True)
    zone = Column(String, index=True)
    status = Column(SqlEnum(TripStatus), default=TripStatus.PENDING, index=True)
    accepted_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    expected_earnings = Column(Float, default=0.0)
    disruption_reason = Column(String, nullable=True)

    claims = relationship("Claim", back_populates="trip")


class TriggerEvent(Base):
    __tablename__ = "trigger_events"

    id = Column(Integer, primary_key=True, index=True)
    trigger_type = Column(SqlEnum(TriggerType), index=True)
    code = Column(String, index=True)  # e.g. RAINFALL_HEAVY, AQI_SEVERE
    zone = Column(String, index=True)
    description = Column(String)
    severity = Column(Float, default=0.0)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    claims = relationship("Claim", back_populates="trigger_event")


class ClaimStatus(str, Enum):
    GENERATED = "generated"
    APPROVED = "approved"
    PAID = "paid"


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False)
    worker_id = Column(String, index=True)
    trigger_event_id = Column(Integer, ForeignKey("trigger_events.id"), nullable=False)
    status = Column(SqlEnum(ClaimStatus), default=ClaimStatus.GENERATED, index=True)
    amount = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    trip = relationship("Trip", back_populates="claims")
    trigger_event = relationship("TriggerEvent", back_populates="claims")
