from collections import defaultdict
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db


router = APIRouter()


@router.get("/weekly", response_model=List[schemas.WeeklyPayout])
def compute_weekly_payouts(db: Session = Depends(get_db)):
    """
    Aggregate all approved (but unpaid) claims in the last 7 days into worker-level payouts.
    """
    since = datetime.utcnow() - timedelta(days=7)
    claims = (
        db.query(models.Claim)
        .filter(
            models.Claim.status == models.ClaimStatus.APPROVED,
            models.Claim.created_at >= since,
        )
        .all()
    )

    buckets: dict[str, dict[str, object]] = defaultdict(lambda: {"amount": 0.0, "ids": []})
    for c in claims:
        buckets[c.worker_id]["amount"] = float(buckets[c.worker_id]["amount"]) + float(c.amount)
        buckets[c.worker_id]["ids"].append(c.id)

    payouts: List[schemas.WeeklyPayout] = []
    for worker_id, data in buckets.items():
        payouts.append(
            schemas.WeeklyPayout(
                worker_id=worker_id,
                total_amount=float(data["amount"]),
                claim_ids=list(data["ids"]),
            )
        )

    return payouts
