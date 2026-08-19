from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import RestaurantTable, Reservation, ReservationStatus, TableStatus

def time_to_minutes(time_str: str) -> int:
    try:
        parts = time_str.split(":")
        return int(parts[0]) * 60 + int(parts[1])
    except Exception:
        return 0

def ensure_default_tables(db: Session):
    try:
        if db.query(RestaurantTable).count() == 0:
            default_tables = [
                RestaurantTable(table_number="T-01", capacity=2, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-02", capacity=2, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-03", capacity=2, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-04", capacity=2, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-05", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-06", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-07", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-08", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-09", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-10", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-11", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-12", capacity=4, area="Main Dining Floor", status="available"),
                RestaurantTable(table_number="T-13", capacity=6, area="VIP / Family Booths", status="available"),
                RestaurantTable(table_number="T-14", capacity=6, area="VIP / Family Booths", status="available"),
                RestaurantTable(table_number="T-15", capacity=6, area="VIP / Family Booths", status="available"),
                RestaurantTable(table_number="T-16", capacity=6, area="VIP / Family Booths", status="available"),
                RestaurantTable(table_number="T-17", capacity=8, area="Garden Terrace", status="available"),
                RestaurantTable(table_number="T-18", capacity=8, area="Garden Terrace", status="available"),
                RestaurantTable(table_number="T-19", capacity=10, area="Banquet & Events", status="available"),
                RestaurantTable(table_number="T-20", capacity=12, area="Banquet & Events", status="available"),
            ]
            db.add_all(default_tables)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Table seeding notice: {e}")

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
    ensure_default_tables(db)

    # 1. Fetch tables matching capacity
    query = db.query(RestaurantTable).filter(RestaurantTable.capacity >= guests)
    if seating_area and seating_area not in ["Any", "Main Dining Floor"]:
        area_tables = query.filter(RestaurantTable.area.ilike(f"%{seating_area.split()[0]}%")).all()
        candidate_tables = area_tables if area_tables else query.order_by(RestaurantTable.capacity.asc()).all()
    else:
        candidate_tables = query.order_by(RestaurantTable.capacity.asc()).all()

    if not candidate_tables:
        # Fallback to any table if party size fits
        all_tables = db.query(RestaurantTable).order_by(RestaurantTable.capacity.desc()).all()
        if all_tables and all_tables[0].capacity >= guests:
            candidate_tables = [all_tables[0]]
        else:
            return {
                "available": False,
                "table": None,
                "reason": f"No tables accommodate a party of {guests}. Please contact us for special event seating."
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
