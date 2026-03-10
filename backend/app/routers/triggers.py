from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db


router = APIRouter()


@router.post("/", response_model=schemas.TriggerEventOut)
def create_trigger(payload: schemas.TriggerEventCreate, db: Session = Depends(get_db)):
    """
    Simple endpoint to simulate an environmental or civic trigger.
    In a real system, this would be created by a background job consuming weather/civic APIs.
    """
    event = models.TriggerEvent(
        trigger_type=payload.trigger_type,
        code=payload.code,
        zone=payload.zone,
        description=payload.description,
        severity=payload.severity,
    )
    db.add(event)

    # Find impacted trips in the same zone in the last 2 hours and create parametric claims
    window_start = datetime.utcnow() - timedelta(hours=2)
    impacted_trips = (
        db.query(models.Trip)
        .filter(
            models.Trip.zone == payload.zone,
            models.Trip.accepted_at >= window_start,
        )
        .all()
    )

    for trip in impacted_trips:
        # Simple parametric rule: payout = 50% of expected earnings scaled by severity
        amount = trip.expected_earnings * 0.5 * max(payload.severity, 0.1)
        claim = models.Claim(
            trip_id=trip.id,
            worker_id=trip.worker_id,
            trigger_event=event,
            amount=amount,
            status=models.ClaimStatus.APPROVED,
        )
        db.add(claim)

    db.commit()
    db.refresh(event)
    return event


@router.get("/", response_model=List[schemas.TriggerEventOut])
def list_triggers(db: Session = Depends(get_db)):
    return db.query(models.TriggerEvent).order_by(models.TriggerEvent.started_at.desc()).limit(200).all()
