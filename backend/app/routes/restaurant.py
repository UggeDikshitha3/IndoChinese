from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
import json
from app.database.session import get_db
from app.models.models import RestaurantSetting

router = APIRouter(prefix="/restaurant", tags=["restaurant"])

DEFAULT_SETTINGS = {
    "name": "INDO CHINESE",
    "tagline": "WHERE INDIAN SPICE MEETS CHINESE FLAVOUR",
    "description": "Welcome to INDO CHINESE: The Real Taste of Bombay. An authentic Indo-Chinese dining sanctuary in Hounslow, London.",
    "phone": "+44 20 8570 9888",
    "email": "info@indochinese-restaurant.com",
    "address": {
        "street": "124 High Street",
        "area": "Hounslow",
        "city": "London",
        "postcode": "TW3 1NA",
        "country": "United Kingdom",
        "full": "124 High Street, Hounslow, London TW3 1NA, UK",
        "coordinates": {"lat": 51.4682, "lng": -0.3609},
        "landmark": "Near Treaty Shopping Centre & Hounslow Central Tube Station"
    },
    "openingHours": {
        "monday": "12:00 PM - 10:30 PM",
        "tuesday": "12:00 PM - 10:30 PM",
        "wednesday": "12:00 PM - 10:30 PM",
        "thursday": "12:00 PM - 11:00 PM",
        "friday": "12:00 PM - 11:30 PM",
        "saturday": "12:00 PM - 11:30 PM",
        "sunday": "12:00 PM - 10:00 PM"
    },
    "social": {
        "instagram": "https://instagram.com/indochineserestaurant",
        "facebook": "https://facebook.com/indochineserestaurant",
        "whatsapp": "+447123456789",
        "googleBusiness": "https://g.page/r/indochinese-hounslow",
        "googleMaps": "https://maps.google.com/?q=124+High+Street+Hounslow"
    }
}

@router.get("")
def get_restaurant_info(db: Session = Depends(get_db)):
    setting = db.query(RestaurantSetting).filter(RestaurantSetting.key == "profile").first()
    if setting:
        try:
            return json.loads(setting.value)
        except Exception:
            pass
    return DEFAULT_SETTINGS

@router.put("")
def update_restaurant_info(data: dict = Body(...), db: Session = Depends(get_db)):
    setting = db.query(RestaurantSetting).filter(RestaurantSetting.key == "profile").first()
    if not setting:
        setting = RestaurantSetting(key="profile", value=json.dumps(data))
        db.add(setting)
    else:
        setting.value = json.dumps(data)
    db.commit()
    return data
