from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel

from .models import ClaimStatus, TripStatus, TriggerType


class TripBase(BaseModel):
    platform_trip_id: str
    worker_id: str
    zone: str
    expected_earnings: float = 0.0


class TripCreate(TripBase):
    ...


class TripUpdate(BaseModel):
    status: Optional[TripStatus] = None
    disruption_reason: Optional[str] = None


class TripOut(TripBase):
    id: int
    status: TripStatus
    accepted_at: datetime
    completed_at: Optional[datetime] = None
    disruption_reason: Optional[str] = None

    class Config:
        from_attributes = True


class TriggerEventBase(BaseModel):
    trigger_type: TriggerType
    code: str
    zone: str
    description: str
    severity: float = 0.0


class TriggerEventCreate(TriggerEventBase):
    ...


class TriggerEventOut(TriggerEventBase):
    id: int
    started_at: datetime
    ended_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClaimOut(BaseModel):
    id: int
    trip_id: int
    worker_id: str
    trigger_event_id: int
    status: ClaimStatus
    amount: float
    created_at: datetime
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WeeklyPayout(BaseModel):
    worker_id: str
    total_amount: float
    claim_ids: List[int]
