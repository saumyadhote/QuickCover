from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db


router = APIRouter()


@router.post("/", response_model=schemas.TripOut)
def create_trip(payload: schemas.TripCreate, db: Session = Depends(get_db)):
    trip = models.Trip(
        platform_trip_id=payload.platform_trip_id,
        worker_id=payload.worker_id,
        zone=payload.zone,
        expected_earnings=payload.expected_earnings,
        status=models.TripStatus.IN_PROGRESS,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("/", response_model=List[schemas.TripOut])
def list_trips(db: Session = Depends(get_db)):
    return db.query(models.Trip).order_by(models.Trip.accepted_at.desc()).limit(200).all()


@router.get("/{trip_id}", response_model=schemas.TripOut)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.patch("/{trip_id}", response_model=schemas.TripOut)
def update_trip(trip_id: int, payload: schemas.TripUpdate, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if payload.status is not None:
        trip.status = payload.status
        if payload.status == models.TripStatus.COMPLETED:
            trip.completed_at = datetime.utcnow()

    if payload.disruption_reason is not None:
        trip.disruption_reason = payload.disruption_reason

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip
