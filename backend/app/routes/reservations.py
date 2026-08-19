import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Reservation, ReservationStatus
from app.schemas.schemas import ReservationCreate, ReservationUpdate, ReservationResponse
from app.services.reservation_service import check_availability_and_assign_table
from app.services.email_service import send_reservation_confirmation_email

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("", response_model=ReservationResponse)
def create_reservation(reservation_in: ReservationCreate, db: Session = Depends(get_db)):
    # 1. Check availability & assign table
    avail_check = check_availability_and_assign_table(
        db=db,
        date=reservation_in.date,
        time=reservation_in.time,
        guests=reservation_in.guests,
        seating_area=reservation_in.seatingArea or "Main Dining Floor"
    )

    if not avail_check["available"]:
        raise HTTPException(status_code=400, detail=avail_check["reason"])

    # 2. Generate unique reservation reference
    random_num = random.randint(100000, 900000)
    ref_num = f"IC-2026-{random_num}"

    assigned_tbl = avail_check["table"]
    assigned_table_id = assigned_tbl.id if assigned_tbl else None

    # 3. Create Reservation in DB
    new_resv = Reservation(
        reservation_number=ref_num,
        name=reservation_in.name.strip(),
        email=reservation_in.email.strip() if reservation_in.email else "",
        phone=reservation_in.phone.strip(),
        guests=reservation_in.guests,
        date=reservation_in.date,
        time=reservation_in.time,
        seating_area=reservation_in.seatingArea or "Main Dining Floor",
        occasion=reservation_in.occasion or "Casual Dining",
        special_requests=reservation_in.specialRequests or "",
        status=ReservationStatus.CONFIRMED,
        assigned_table_id=assigned_table_id
    )

    db.add(new_resv)
    db.commit()
    db.refresh(new_resv)

    # 4. Trigger Email Notification (if email provided)
    if new_resv.email:
        send_reservation_confirmation_email(
            to_email=new_resv.email,
            customer_name=new_resv.name,
            reservation_number=new_resv.reservation_number,
            date=new_resv.date,
            time=new_resv.time,
            guests=new_resv.guests,
            seating_area=new_resv.seating_area
        )

    return {
        "id": new_resv.id,
        "reservationNumber": new_resv.reservation_number,
        "name": new_resv.name,
        "email": new_resv.email,
        "phone": new_resv.phone,
        "guests": new_resv.guests,
        "date": new_resv.date,
        "time": new_resv.time,
        "seatingArea": new_resv.seating_area,
        "occasion": new_resv.occasion,
        "specialRequests": new_resv.special_requests,
        "status": new_resv.status,
        "assignedTableId": new_resv.assigned_table_id,
        "createdAt": new_resv.created_at
    }

@router.get("", response_model=List[ReservationResponse])
def get_reservations(
    ref: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Reservation)
    if ref:
        query = query.filter(Reservation.reservation_number.ilike(f"%{ref.strip()}%"))
    if phone:
        clean_phone = "".join(c for c in phone if c.isdigit())
        query = query.filter(Reservation.phone.contains(clean_phone))

    reservations = query.order_by(Reservation.created_at.desc()).all()
    return [
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
            "occasion": r.occasion,
            "specialRequests": r.special_requests,
            "status": r.status,
            "assignedTableId": r.assigned_table_id,
            "createdAt": r.created_at
        }
        for r in reservations
    ]

@router.get("/lookup", response_model=List[ReservationResponse])
def lookup_reservations(
    ref: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Reservation)
    if ref:
        query = query.filter(Reservation.reservation_number.ilike(f"%{ref.strip()}%"))
    if phone:
        clean_phone = "".join(c for c in phone if c.isdigit())
        query = query.filter(Reservation.phone.contains(clean_phone))

    reservations = query.order_by(Reservation.created_at.desc()).all()
    return [
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
            "occasion": r.occasion,
            "specialRequests": r.special_requests,
            "status": r.status,
            "assignedTableId": r.assigned_table_id,
            "createdAt": r.created_at
        }
        for r in reservations
    ]

@router.get("/{id}", response_model=ReservationResponse)
def get_single_reservation(id: str, db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter(
        (Reservation.id == id) | (Reservation.reservation_number.ilike(id))
    ).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return {
        "id": resv.id,
        "reservationNumber": resv.reservation_number,
        "name": resv.name,
        "email": resv.email,
        "phone": resv.phone,
        "guests": resv.guests,
        "date": resv.date,
        "time": resv.time,
        "seatingArea": resv.seating_area,
        "occasion": resv.occasion,
        "specialRequests": resv.special_requests,
        "status": resv.status,
        "assignedTableId": resv.assigned_table_id,
        "createdAt": resv.created_at
    }

@router.put("/{id}", response_model=ReservationResponse)
def update_reservation(id: str, updates: ReservationUpdate, db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter(
        (Reservation.id == id) | (Reservation.reservation_number == id)
    ).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if updates.date is not None: resv.date = updates.date
    if updates.time is not None: resv.time = updates.time
    if updates.guests is not None: resv.guests = updates.guests
    if updates.status is not None: resv.status = updates.status
    if updates.specialRequests is not None: resv.special_requests = updates.specialRequests
    if updates.assignedTableId is not None: resv.assigned_table_id = updates.assignedTableId

    db.commit()
    db.refresh(resv)
    return {
        "id": resv.id,
        "reservationNumber": resv.reservation_number,
        "name": resv.name,
        "email": resv.email,
        "phone": resv.phone,
        "guests": resv.guests,
        "date": resv.date,
        "time": resv.time,
        "seatingArea": resv.seating_area,
        "occasion": resv.occasion,
        "specialRequests": resv.special_requests,
        "status": resv.status,
        "assignedTableId": resv.assigned_table_id,
        "createdAt": resv.created_at
    }

@router.patch("/{id}/reschedule")
def reschedule_reservation(id: str, payload: dict, db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter((Reservation.id == id) | (Reservation.reservation_number == id)).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    new_date = payload.get("date")
    new_time = payload.get("time")
    if new_date: resv.date = new_date
    if new_time: resv.time = new_time
    resv.status = ReservationStatus.CONFIRMED

    db.commit()
    db.refresh(resv)
    return {
        "success": True,
        "id": resv.id,
        "reservationNumber": resv.reservation_number,
        "date": resv.date,
        "time": resv.time,
        "status": resv.status
    }

@router.patch("/{id}/cancel")
def cancel_reservation(id: str, db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter((Reservation.id == id) | (Reservation.reservation_number == id)).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    resv.status = ReservationStatus.CANCELLED
    db.commit()
    return {"success": True, "message": "Reservation cancelled successfully", "status": resv.status}

@router.delete("/{id}")
def delete_reservation(id: str, db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter(
        (Reservation.id == id) | (Reservation.reservation_number == id)
    ).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    resv.status = ReservationStatus.CANCELLED
    db.commit()
    return {"success": True, "message": "Reservation cancelled successfully"}
