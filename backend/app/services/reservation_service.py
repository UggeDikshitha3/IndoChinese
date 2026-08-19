from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import RestaurantTable, Reservation, ReservationStatus, TableStatus

def time_to_minutes(time_str: str) -> int:
    try:
        parts = time_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def check_availability_and_assign_table(
    db: Session,
    date: str,
    time: str,
    guests: int,
    seating_area: str = "Main Dining Floor"
) -> dict:
    """
    Checks table availability for a party of given size at requested date & time (90-minute dining window).
    Returns {'available': bool, 'table': RestaurantTable or None, 'reason': str}
    """
    # 1. Fetch tables matching capacity
    query = db.query(RestaurantTable).filter(RestaurantTable.capacity >= guests)
    if seating_area and seating_area != "Any" and seating_area != "Main Dining Floor":
        area_tables = query.filter(RestaurantTable.area == seating_area).all()
        if area_tables:
            candidate_tables = area_tables
        else:
            candidate_tables = query.all()
    else:
        candidate_tables = query.order_by(RestaurantTable.capacity.asc()).all()

    if not candidate_tables:
        return {
            "available": False,
            "table": None,
            "reason": f"No tables accommodate a party of {guests} in this section."
        }

    req_mins = time_to_minutes(time)
    window = 90  # minutes

    # 2. Check existing active reservations for that day
    day_reservations = db.query(Reservation).filter(
        Reservation.date == date,
        Reservation.status.in_([ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.SEATED])
    ).all()

    for table in candidate_tables:
        # Check overlapping bookings on this table
        table_conflicts = [
            r for r in day_reservations
            if r.assigned_table_id == table.id and abs(time_to_minutes(r.time) - req_mins) < window
        ]

        if not table_conflicts:
            return {
                "available": True,
                "table": table,
                "reason": "Table available"
            }

    # If no specific table free, check if total capacity allows
    overlapping_resvs = [
        r for r in day_reservations
        if abs(time_to_minutes(r.time) - req_mins) < window
    ]

    total_seats = sum(t.capacity for t in candidate_tables)
    booked_seats = sum(r.guests for r in overlapping_resvs)

    if total_seats - booked_seats >= guests:
        # Find first table with lowest capacity
        return {
            "available": True,
            "table": candidate_tables[0],
            "reason": "Capacity available"
        }

    return {
        "available": False,
        "table": None,
        "reason": f"We are fully booked at {time} for a party of {guests}. Please choose an earlier or later slot."
    }
