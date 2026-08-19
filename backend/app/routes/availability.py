from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.reservation_service import check_availability_and_assign_table

router = APIRouter(prefix="/availability", tags=["availability"])

@router.get("")
def get_table_availability(
    date: str = Query(..., description="Date formatted as YYYY-MM-DD"),
    time: str = Query(..., description="Time formatted as HH:MM"),
    guests: int = Query(..., ge=1, le=50, description="Party size"),
    seatingArea: str = Query("Main Dining Floor", description="Requested dining section"),
    db: Session = Depends(get_db)
):
    result = check_availability_and_assign_table(
        db=db,
        date=date,
        time=time,
        guests=guests,
        seating_area=seatingArea
    )

    return {
        "available": result["available"],
        "date": date,
        "time": time,
        "guests": guests,
        "seatingArea": seatingArea,
        "assignedTable": result["table"].table_number if result.get("table") else None,
        "message": "Table available for instant confirmation!" if result["available"] else result["reason"]
    }
