from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.session import get_db
from app.models.models import Reservation, RestaurantTable, TableStatus, ReservationStatus, ContactMessage, EventInquiry
from app.schemas.schemas import ReservationResponse

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard")
def get_admin_dashboard_metrics(db: Session = Depends(get_db)):
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    all_reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).all()
    all_tables = db.query(RestaurantTable).all()

    today_bookings = [r for r in all_reservations if r.date == today_str]
    upcoming_bookings = [r for r in all_reservations if r.date >= today_str and r.status not in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]]
    pending_bookings = [r for r in all_reservations if r.status == ReservationStatus.PENDING]
    confirmed_bookings = [r for r in all_reservations if r.status == ReservationStatus.CONFIRMED]
    cancelled_bookings = [r for r in all_reservations if r.status == ReservationStatus.CANCELLED]
    completed_bookings = [r for r in all_reservations if r.status == ReservationStatus.COMPLETED]
    no_shows = [r for r in all_reservations if r.status == ReservationStatus.NO_SHOW]

    today_guests = sum(r.guests for r in today_bookings)
    occupied_tables = len([t for t in all_tables if t.status in [TableStatus.OCCUPIED, TableStatus.BILL_ISSUED]])
    available_tables = len([t for t in all_tables if t.status == TableStatus.AVAILABLE])

    # Time distribution
    time_dist = {}
    for r in all_reservations:
        if r.time:
            time_dist[r.time] = time_dist.get(r.time, 0) + 1

    return {
        "summary": {
            "todayBookingsCount": len(today_bookings),
            "upcomingBookingsCount": len(upcoming_bookings),
            "pendingBookingsCount": len(pending_bookings),
            "confirmedBookingsCount": len(confirmed_bookings),
            "cancelledBookingsCount": len(cancelled_bookings),
            "completedBookingsCount": len(completed_bookings),
            "noShowsCount": len(no_shows),
            "todayGuestsCount": today_guests,
            "totalTables": len(all_tables),
            "availableTables": available_tables,
            "occupiedTables": occupied_tables,
            "occupancyRate": round((occupied_tables / max(1, len(all_tables))) * 100)
        },
        "popularTimes": time_dist,
        "recentReservations": [
            {
                "id": r.id,
                "reservationNumber": r.reservation_number,
                "name": r.name,
                "email": r.email,
                "phone": r.phone,
                "guests": r.guests,
                "date": r.date,
                "time": r.time,
                "seatingArea": r.seating_area,
                "status": r.status,
                "createdAt": r.created_at
            }
            for r in all_reservations[:10]
        ]
    }

@router.patch("/reservations/{id}/status")
def update_reservation_status(id: str, status: str = Body(..., embed=True), db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter(Reservation.id == id).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    resv.status = status
    db.commit()
    return {"success": True, "status": resv.status}

@router.get("/contact")
def get_contact_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.get("/events")
def get_event_inquiries(db: Session = Depends(get_db)):
    return db.query(EventInquiry).order_by(EventInquiry.created_at.desc()).all()
