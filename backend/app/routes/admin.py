from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.database.session import get_db
from app.models.models import Reservation, RestaurantTable, TableStatus, ReservationStatus, ContactMessage, EventInquiry, User, UserRole
from app.schemas.schemas import ReservationResponse
from app.core.deps import get_current_admin
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

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

@router.get("/reservations", response_model=List[ReservationResponse])
def get_admin_reservations(db: Session = Depends(get_db)):
    reservations = db.query(Reservation).order_by(Reservation.created_at.desc()).all()
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

@router.get("/tables")
def get_admin_tables(db: Session = Depends(get_db)):
    from app.services.reservation_service import ensure_default_tables
    ensure_default_tables(db)
    tables = db.query(RestaurantTable).order_by(RestaurantTable.table_number.asc()).all()
    return [
        {
            "id": t.id,
            "tableNumber": t.table_number,
            "capacity": t.capacity,
            "area": t.area,
            "status": t.status,
            "assignedServer": t.assigned_server,
            "notes": t.notes
        }
        for t in tables
    ]

@router.post("/tables")
def create_admin_table(payload: dict = Body(...), db: Session = Depends(get_db)):
    table_num = payload.get("tableNumber") or payload.get("table_number") or f"T-{db.query(RestaurantTable).count() + 1:02d}"
    capacity = int(payload.get("capacity", 4))
    area = payload.get("area", "Main Dining Floor")
    server = payload.get("assignedServer") or payload.get("assigned_server") or ""
    notes = payload.get("notes", "")

    existing = db.query(RestaurantTable).filter(RestaurantTable.table_number.ilike(table_num)).first()
    if existing:
        existing.capacity = capacity
        existing.area = area
        existing.assigned_server = server
        existing.notes = notes
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "tableNumber": existing.table_number,
            "capacity": existing.capacity,
            "area": existing.area,
            "status": existing.status,
            "assignedServer": existing.assigned_server,
            "notes": existing.notes
        }

    new_table = RestaurantTable(
        table_number=table_num,
        capacity=capacity,
        area=area,
        status="available",
        assigned_server=server,
        notes=notes
    )
    db.add(new_table)
    db.commit()
    db.refresh(new_table)
    return {
        "id": new_table.id,
        "tableNumber": new_table.table_number,
        "capacity": new_table.capacity,
        "area": new_table.area,
        "status": new_table.status,
        "assignedServer": new_table.assigned_server,
        "notes": new_table.notes
    }

@router.put("/tables/{id}")
@router.patch("/tables/{id}")
def update_admin_table(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    if "tableNumber" in payload or "table_number" in payload:
        tbl.table_number = payload.get("tableNumber") or payload.get("table_number")
    if "capacity" in payload:
        tbl.capacity = int(payload["capacity"])
    if "area" in payload:
        tbl.area = payload["area"]
    if "status" in payload:
        tbl.status = payload["status"]
    if "assignedServer" in payload or "assigned_server" in payload:
        tbl.assigned_server = payload.get("assignedServer") or payload.get("assigned_server")
    if "notes" in payload:
        tbl.notes = payload["notes"]

    db.commit()
    db.refresh(tbl)
    return {
        "id": tbl.id,
        "tableNumber": tbl.table_number,
        "capacity": tbl.capacity,
        "area": tbl.area,
        "status": tbl.status,
        "assignedServer": tbl.assigned_server,
        "notes": tbl.notes
    }

@router.delete("/tables/{id}")
def delete_admin_table(id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    db.delete(tbl)
    db.commit()
    return {"success": True, "message": "Table deleted successfully"}

@router.patch("/tables/{id}/status")
def change_table_status(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    new_status = payload.get("status", "available")
    tbl.status = new_status
    db.commit()
    db.refresh(tbl)
    return {"success": True, "status": tbl.status}

@router.patch("/tables/{id}/seat")
def seat_party_on_table(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    tbl.status = "occupied"
    if "assignedServer" in payload:
        tbl.assigned_server = payload["assignedServer"]
    if "notes" in payload:
        tbl.notes = payload["notes"]

    resv_id = payload.get("reservationId")
    if resv_id:
        resv = db.query(Reservation).filter((Reservation.id == resv_id) | (Reservation.reservation_number == resv_id)).first()
        if resv:
            resv.status = "seated"
            resv.assigned_table_id = tbl.id

    db.commit()
    db.refresh(tbl)
    return {"success": True, "status": tbl.status}

@router.patch("/tables/{id}/bill")
def issue_table_bill(id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    tbl.status = "bill_issued"
    db.commit()
    db.refresh(tbl)
    return {"success": True, "status": tbl.status}

@router.patch("/tables/{id}/complete")
def complete_table_dining(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    set_status = payload.get("setStatus", "available")
    tbl.status = set_status
    tbl.notes = ""
    db.commit()
    db.refresh(tbl)
    return {"success": True, "status": tbl.status}

@router.patch("/tables/{id}/extend")
def extend_table_stay(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    db.commit()
    return {"success": True, "status": tbl.status}

@router.get("/users")
def get_admin_users(db: Session = Depends(get_db)):
    default_admins = [
        {
            "id": "usr_master_owner",
            "name": "Dikshitha Varma",
            "email": "dikshithavarma2006@gmail.com",
            "role": "master",
            "active": True,
            "createdAt": "2026-01-01T00:00:00Z"
        },
        {
            "id": "usr_admin",
            "name": "Restaurant Admin Manager",
            "email": "admin@restaurant.com",
            "role": "super_admin",
            "active": True,
            "createdAt": "2026-01-01T00:00:00Z"
        },
        {
            "id": "usr_admin_domain",
            "name": "IndoChinese Admin",
            "email": "admin@indochinese.com",
            "role": "super_admin",
            "active": True,
            "createdAt": "2026-01-01T00:00:00Z"
        }
    ]

    db_users = db.query(User).filter(User.role != UserRole.CUSTOMER).order_by(User.created_at.desc()).all()
    user_list = list(default_admins)
    seen_emails = {a["email"].lower() for a in default_admins}

    for u in db_users:
        if u.email.lower() not in seen_emails:
            user_list.append({
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.lower(),
                "active": u.is_active,
                "createdAt": u.created_at.isoformat() if u.created_at else datetime.utcnow().isoformat()
            })
            seen_emails.add(u.email.lower())

    return user_list

@router.post("/users")
def create_admin_user(payload: dict = Body(...), db: Session = Depends(get_db)):
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = (payload.get("password") or "").strip()
    role = (payload.get("role") or "employee").strip().upper()

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required.")

    # Check if user already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        existing.name = name
        existing.password_hash = get_password_hash(password)
        existing.role = role
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "name": existing.name,
            "email": existing.email,
            "role": existing.role.lower(),
            "active": existing.is_active,
            "createdAt": existing.created_at.isoformat() if existing.created_at else datetime.utcnow().isoformat()
        }

    new_user = User(
        name=name,
        email=email,
        password_hash=get_password_hash(password),
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role.lower(),
        "active": new_user.is_active,
        "createdAt": new_user.created_at.isoformat() if new_user.created_at else datetime.utcnow().isoformat()
    }

@router.patch("/users/{id}")
def update_admin_user(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        # Default seeded virtual users fallback
        return {"id": id, "active": payload.get("active", True), "role": payload.get("role", "admin")}

    if "active" in payload:
        user.is_active = bool(payload["active"])
    if "role" in payload:
        user.role = str(payload["role"]).upper()
    if "name" in payload:
        user.name = payload["name"]

    db.commit()
    db.refresh(user)
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.lower(),
        "active": user.is_active
    }

@router.delete("/users/{id}")
def delete_admin_user(id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == id).first()
    if user:
        db.delete(user)
        db.commit()
    return {"success": True, "message": "User removed successfully"}

@router.patch("/reservations/{id}/status")
def update_reservation_status(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter((Reservation.id == id) | (Reservation.reservation_number == id)).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    new_status = payload.get("status") if isinstance(payload, dict) else str(payload)
    if new_status:
        resv.status = new_status
    db.commit()
    return {"success": True, "status": resv.status}

@router.patch("/reservations/{id}/table")
def assign_reservation_table(id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    resv = db.query(Reservation).filter((Reservation.id == id) | (Reservation.reservation_number == id)).first()
    if not resv:
        raise HTTPException(status_code=404, detail="Reservation not found")

    target = payload.get("tableId") or payload.get("table_id") or payload.get("tableNumber") if isinstance(payload, dict) else str(payload)
    if target:
        # Check if target is a table number or UUID
        tbl = db.query(RestaurantTable).filter(
            (RestaurantTable.id == target) | (RestaurantTable.table_number.ilike(target))
        ).first()
        if tbl:
            resv.assigned_table_id = tbl.id
        else:
            resv.assigned_table_id = target
    db.commit()
    db.refresh(resv)
    return {"success": True, "assignedTableId": resv.assigned_table_id}

@router.get("/contact")
def get_contact_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.get("/events")
def get_event_inquiries(db: Session = Depends(get_db)):
    return db.query(EventInquiry).order_by(EventInquiry.created_at.desc()).all()
