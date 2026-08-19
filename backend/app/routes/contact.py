from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import ContactMessage, EventInquiry
from app.schemas.schemas import ContactCreate, EventInquiryCreate

router = APIRouter(tags=["contact"])

@router.post("/contact")
def submit_contact_message(msg_in: ContactCreate, db: Session = Depends(get_db)):
    msg = ContactMessage(
        name=msg_in.name.strip(),
        email=msg_in.email.strip(),
        phone=msg_in.phone.strip() if msg_in.phone else "",
        subject=msg_in.subject or "General Inquiry",
        message=msg_in.message.strip()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"success": True, "message": "Thank you! Your message has been received."}

@router.post("/events/inquire")
def submit_event_inquiry(evt_in: EventInquiryCreate, db: Session = Depends(get_db)):
    inquiry = EventInquiry(
        name=evt_in.name.strip(),
        email=evt_in.email.strip(),
        phone=evt_in.phone.strip(),
        event_type=evt_in.eventType,
        guests=evt_in.guests,
        date=evt_in.date,
        time=evt_in.time or "19:00",
        budget=evt_in.budget or "",
        special_requests=evt_in.specialRequests or ""
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return {
        "success": True,
        "message": "Event inquiry submitted successfully! Our events coordinator will contact you shortly."
    }
