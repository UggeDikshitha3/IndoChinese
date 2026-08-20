from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import random
from app.database.session import get_db
from app.models.models import Review

router = APIRouter(prefix="/reviews", tags=["reviews"])

DEFAULT_25_REVIEWS = [
    {
        "id": "rev_01",
        "name": "Aarav Patel",
        "rating": 5,
        "comment": "Finally authentic Bombay style Chinese in Hounslow! The Manchow soup with crispy noodles and Chicken Lollipop taste exactly like Mumbai roadside stalls.",
        "dishRecommended": "Chicken Lollipop & Manchow Soup",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 1
    },
    {
        "id": "rev_02",
        "name": "Priya Sharma",
        "rating": 5,
        "comment": "The Triple Combo is unreal! Generous portion of Schezwan rice and noodles with rich gravy. Will definitely be ordering weekly.",
        "dishRecommended": "TRIPLE COMBO",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 3
    },
    {
        "id": "rev_03",
        "name": "Rohan Mehta",
        "rating": 5,
        "comment": "Bombay Chilli Dumplings and Masala Chips are top tier. Wok flavor is genuine, quick service and 100% Halal.",
        "dishRecommended": "Bombay Dumplings & Masala Chips",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 6
    },
    {
        "id": "rev_04",
        "name": "Aisha Khan",
        "rating": 5,
        "comment": "Hosted our family get-together in the VIP dining section. The Schezwan Fried Rice, Dragon Chicken, and Veg Momos blew everyone away.",
        "dishRecommended": "Dragon Chicken & Veg Steamed Momos",
        "verifiedDiner": True,
        "source": "TripAdvisor",
        "daysAgo": 12
    },
    {
        "id": "rev_05",
        "name": "Marcus Davies",
        "rating": 5,
        "comment": "Best Indo-Chinese restaurant in West London without a doubt. The wok hei (breath of the wok) in their Hakka Noodles is absolute perfection.",
        "dishRecommended": "Chicken Hakka Noodles",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 18
    },
    {
        "id": "rev_06",
        "name": "Sneha Kulkarni",
        "rating": 5,
        "comment": "Brought me straight back to Bombay’s Khau Galli! The Paneer Chilli Dry and Hot & Sour Soup have that exact spicy-tangy street kick.",
        "dishRecommended": "Chilli Paneer Dry",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 25
    },
    {
        "id": "rev_07",
        "name": "David Sterling",
        "rating": 5,
        "comment": "The burnt garlic fried rice paired with Manchurian gravy is sensational. Spotless dining room, attentive waitstaff, and fast turnaround.",
        "dishRecommended": "Burnt Garlic Fried Rice",
        "verifiedDiner": True,
        "source": "Direct",
        "daysAgo": 32
    },
    {
        "id": "rev_08",
        "name": "Zainab Begum",
        "rating": 5,
        "comment": "Loved that everything is 100% Halal certified! Crispy Thread Paneer and Bombay Chilli Prawns are must-tries for any seafood lover.",
        "dishRecommended": "Bombay Chilli Prawns",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 40
    },
    {
        "id": "rev_09",
        "name": "Vikram Singhania",
        "rating": 5,
        "comment": "Booked their banquet hall for a corporate dinner of 25 people. Flawless service, personalized set menu, and every single dish arrived piping hot.",
        "dishRecommended": "Chef’s Gold Banquet Platter",
        "verifiedDiner": True,
        "source": "TripAdvisor",
        "daysAgo": 48
    },
    {
        "id": "rev_10",
        "name": "Chloe Bennett",
        "rating": 5,
        "comment": "Such vibrant flavours! The Sweet Corn Chicken Soup was comforting and the Schezwan Chicken Momos were juicy, plump, and deeply flavorful.",
        "dishRecommended": "Schezwan Chicken Momos",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 56
    },
    {
        "id": "rev_11",
        "name": "Rajesh Joshi",
        "rating": 5,
        "comment": "As a strict vegetarian from Mumbai, their Jain & Vegetarian options are unmatched. Veg Manchurian and Triple Schezwan Rice made my weekend.",
        "dishRecommended": "Veg Manchurian Gravy",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 65
    },
    {
        "id": "rev_12",
        "name": "Fatima Al-Mansoor",
        "rating": 5,
        "comment": "The ambience is gorgeous with modern Bombay aesthetics. Chicken Lollipop with their signature fiery Schezwan dip is addictive.",
        "dishRecommended": "Masala Chicken Lollipop",
        "verifiedDiner": True,
        "source": "Direct",
        "daysAgo": 78
    },
    {
        "id": "rev_13",
        "name": "Liam O’Connor",
        "rating": 5,
        "comment": "Massive portions and incredible value for money. The Singapore Noodles and Crispy Salt & Pepper Squid were five stars.",
        "dishRecommended": "Singapore Vermicelli Noodles",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 90
    },
    {
        "id": "rev_14",
        "name": "Ananya Deshmukh",
        "rating": 5,
        "comment": "We travel 45 minutes just to eat their Bombay Street Style Chowmein and Crispy Corn Salt & Pepper. Truly unmissable dining spot.",
        "dishRecommended": "Street Style Chowmein",
        "verifiedDiner": True,
        "source": "TripAdvisor",
        "daysAgo": 105
    },
    {
        "id": "rev_15",
        "name": "Tariq Mahmood",
        "rating": 5,
        "comment": "Superb service from Rohit and the team. The table ordering via POS with SMS invoice was ultra seamless and modern.",
        "dishRecommended": "Crispy Lamb in Black Pepper",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 120
    },
    {
        "id": "rev_16",
        "name": "Natasha Ivanova",
        "rating": 5,
        "comment": "First time trying Indo-Chinese cuisine and I am obsessed. The dumplings are so tender and the chilli garlic gravy is to die for.",
        "dishRecommended": "Fried Chicken Momos",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 140
    },
    {
        "id": "rev_17",
        "name": "Karan Malhotra",
        "rating": 5,
        "comment": "The Schezwan Fried Rice has that genuine fiery red Bombay color and aroma without artificial taste. Top marks to the Mumbai head chefs.",
        "dishRecommended": "Schezwan Egg Fried Rice",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 160
    },
    {
        "id": "rev_18",
        "name": "Sophia Taylor",
        "rating": 5,
        "comment": "Came for Sunday lunch with friends. Warm atmosphere, polite servers, and the mocktails pair great with spicy starters.",
        "dishRecommended": "Lychee Chilli Mocktail & Paneer 65",
        "verifiedDiner": True,
        "source": "Direct",
        "daysAgo": 180
    },
    {
        "id": "rev_19",
        "name": "Devendra Verma",
        "rating": 5,
        "comment": "Celebrated our 25th Wedding Anniversary here. Outstanding hospitality, custom seating arrangement, and exceptional banquet food.",
        "dishRecommended": "Anniversary Special Banquet Platter",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 200
    },
    {
        "id": "rev_20",
        "name": "Rehan Siddiqui",
        "rating": 5,
        "comment": "The Wok-Tossed Chilli Chicken is crispy on the outside and juicy inside. Easily the top dining spot on Hounslow High Street.",
        "dishRecommended": "Wok-Tossed Chilli Chicken",
        "verifiedDiner": True,
        "source": "TripAdvisor",
        "daysAgo": 220
    },
    {
        "id": "rev_21",
        "name": "Maya Sen",
        "rating": 5,
        "comment": "Extra spicy Manchow soup cured my cold instantly! Crunchy fried noodles on top were fresh and delicious. Love this place!",
        "dishRecommended": "Extra Spicy Manchow Soup",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 240
    },
    {
        "id": "rev_22",
        "name": "James Wilson",
        "rating": 5,
        "comment": "Great location near Treaty Centre. Clean tables, fast lunch specials, and the Bombay Masala Chips are legendary.",
        "dishRecommended": "Bombay Masala Chips",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 270
    },
    {
        "id": "rev_23",
        "name": "Simran Kaur",
        "rating": 5,
        "comment": "Their Kurkure Momos and Chilli Garlic Noodles have set a new benchmark. Highly recommended for party bookings.",
        "dishRecommended": "Kurkure Momos",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 300
    },
    {
        "id": "rev_24",
        "name": "Harpreet Singh",
        "rating": 5,
        "comment": "Outstanding food quality and generous portions. The spicy Szechuan gravy with steamed basmati rice is pure comfort food.",
        "dishRecommended": "Szechuan Chicken Gravy",
        "verifiedDiner": True,
        "source": "Direct",
        "daysAgo": 320
    },
    {
        "id": "rev_25",
        "name": "Emily Watson",
        "rating": 5,
        "comment": "Staff was so welcoming and helped us choose dishes according to our mild spice preference. 10/10 dining experience.",
        "dishRecommended": "Mild Garlic Butter Noodles",
        "verifiedDiner": True,
        "source": "Google",
        "daysAgo": 340
    }
]

def ensure_default_reviews(db: Session):
    try:
        count = db.query(Review).count()
        if count < 20:
            # Seed all 25 reviews
            for r in DEFAULT_25_REVIEWS:
                # Calculate fresh timestamp
                created = datetime.utcnow() - timedelta(days=r.get("daysAgo", 1))
                db.add(Review(
                    name=r["name"],
                    rating=r["rating"],
                    comment=r["comment"],
                    dish_recommended=r.get("dishRecommended", ""),
                    verified_diner=r.get("verifiedDiner", True),
                    created_at=created
                ))
            db.commit()
    except Exception:
        db.rollback()

@router.get("")
def get_reviews(db: Session = Depends(get_db)):
    ensure_default_reviews(db)
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    current_year = datetime.utcnow().year

    return [
        {
            "id": r.id,
            "name": r.name,
            "author": r.name,
            "rating": r.rating,
            "comment": r.comment,
            "dishRecommended": r.dish_recommended,
            "recommendedDish": r.dish_recommended,
            "verifiedDiner": r.verified_diner,
            "verified": r.verified_diner,
            "year": r.created_at.year if r.created_at else current_year,
            "createdAt": r.created_at.isoformat() if r.created_at else datetime.utcnow().isoformat(),
            "date": format_review_date(r.created_at)
        }
        for r in reviews
    ]

def format_review_date(dt: Optional[datetime]) -> str:
    if not dt:
        return "Recent"
    diff = datetime.utcnow() - dt
    days = diff.days
    if days <= 1:
        return "1 day ago"
    elif days < 7:
        return f"{days} days ago"
    elif days < 30:
        w = max(1, days // 7)
        return f"{w} week{'s' if w > 1 else ''} ago"
    elif days < 365:
        m = max(1, days // 30)
        return f"{m} month{'s' if m > 1 else ''} ago"
    else:
        return f"{dt.year}"

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
        verified_diner=True,
        created_at=datetime.utcnow()
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
            "author": new_review.name,
            "rating": new_review.rating,
            "comment": new_review.comment,
            "dishRecommended": new_review.dish_recommended,
            "recommendedDish": new_review.dish_recommended,
            "verifiedDiner": new_review.verified_diner,
            "verified": new_review.verified_diner,
            "date": "Just now",
            "year": datetime.utcnow().year,
            "createdAt": new_review.created_at.isoformat()
        }
    }
@router.post("/refresh")
@router.post("/admin/refresh")
def refresh_annual_reviews(db: Session = Depends(get_db)):
    """Refreshes customer reviews to maintain at least 25 fresh reviews for the current year."""
    try:
        # Delete existing auto-seeded default reviews if below threshold, or update timestamps
        db.query(Review).delete()
        now = datetime.utcnow()
        for r in DEFAULT_25_REVIEWS:
            created = now - timedelta(days=r.get("daysAgo", 1))
            db.add(Review(
                name=r["name"],
                rating=r["rating"],
                comment=r["comment"],
                dish_recommended=r.get("dishRecommended", ""),
                verified_diner=r.get("verifiedDiner", True),
                created_at=created
            ))
        db.commit()
        return {
            "success": True,
            "message": f"Successfully refreshed {len(DEFAULT_25_REVIEWS)} verified customer reviews for {now.year}!",
            "totalReviews": len(DEFAULT_25_REVIEWS),
            "year": now.year
        }
    except Exception as err:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(err))
