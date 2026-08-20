from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database.session import get_db
from app.models.models import Review

router = APIRouter(prefix="/reviews", tags=["reviews"])

DEFAULT_REVIEWS = [
    {
        "id": "rev_01",
        "name": "Sarah Jenkins",
        "rating": 5,
        "comment": "Best Indo-Chinese food in London! The Bombay Manchow Soup and Hakka Noodles are unmatched.",
        "dishRecommended": "Bombay Manchow Soup",
        "verifiedDiner": True,
        "createdAt": "2026-08-01T12:00:00Z"
    },
    {
        "id": "rev_02",
        "name": "Rajesh Patel",
        "rating": 5,
        "comment": "Authentic Mumbai street food flavours. The Chilli Paneer and Chicken Lollipop were incredible.",
        "dishRecommended": "Chicken Lollipop",
        "verifiedDiner": True,
        "createdAt": "2026-08-05T14:30:00Z"
    },
    {
        "id": "rev_03",
        "name": "Anita Sharma",
        "rating": 5,
        "comment": "Celebrated our anniversary here in the VIP booths. Outstanding service and vibrant food.",
        "dishRecommended": "Triple Schezwan Rice",
        "verifiedDiner": True,
        "createdAt": "2026-08-10T19:00:00Z"
    }
]

def ensure_default_reviews(db: Session):
    try:
        if db.query(Review).count() == 0:
            for r in DEFAULT_REVIEWS:
                db.add(Review(
                    name=r["name"],
                    rating=r["rating"],
                    comment=r["comment"],
                    dish_recommended=r.get("dishRecommended", ""),
                    verified_diner=r.get("verifiedDiner", True)
                ))
            db.commit()
    except Exception:
        db.rollback()

@router.get("")
def get_reviews(db: Session = Depends(get_db)):
    ensure_default_reviews(db)
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "rating": r.rating,
            "comment": r.comment,
            "dishRecommended": r.dish_recommended,
            "verifiedDiner": r.verified_diner,
            "createdAt": r.created_at.isoformat() if r.created_at else datetime.utcnow().isoformat()
        }
        for r in reviews
    ]

@router.post("")
def submit_review(payload: dict = Body(...), db: Session = Depends(get_db)):
    name = (payload.get("author") or payload.get("name") or "Verified Guest").strip()
    rating = int(payload.get("rating") or 5)
    comment = (payload.get("comment") or "").strip()
    dish = payload.get("recommendedDish") or payload.get("dishRecommended") or payload.get("dish_recommended") or ""

    if not comment:
        raise HTTPException(status_code=400, detail="Review comment is required")

    new_review = Review(
        name=name,
        rating=max(1, min(5, rating)),
        comment=comment,
        dish_recommended=dish,
        verified_diner=True
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return {
        "success": True,
        "message": "Thank you for your review!",
        "review": {
            "id": new_review.id,
            "name": new_review.name,
            "rating": new_review.rating,
            "comment": new_review.comment,
            "dishRecommended": new_review.dish_recommended,
            "verifiedDiner": new_review.verified_diner,
            "createdAt": new_review.created_at.isoformat()
        }
    }
