from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.session import get_db
from app.models.models import RestaurantTable, TableStatus
from app.schemas.schemas import TableCreate, TableUpdate, TableResponse
from app.services.reservation_service import ensure_default_tables

router = APIRouter(prefix="/tables", tags=["tables"])

@router.get("", response_model=List[TableResponse])
def get_all_tables(db: Session = Depends(get_db)):
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

@router.get("/status")
def get_tables_live_status(db: Session = Depends(get_db)):
    ensure_default_tables(db)
    tables = db.query(RestaurantTable).all()
    total_tables = len(tables)
    occupied = [t for t in tables if t.status in [TableStatus.OCCUPIED, TableStatus.BILL_ISSUED]]
    available = [t for t in tables if t.status == TableStatus.AVAILABLE]

    occupancy_pct = round((len(occupied) / max(1, total_tables)) * 100)

    return {
        "totalTables": total_tables,
        "availableTables": len(available),
        "bookedTablesToday": len(occupied),
        "occupancyPercentage": occupancy_pct,
        "lastUpdated": datetime.now().strftime("%H:%M")
    }

@router.post("", response_model=TableResponse)
def create_table(table_in: TableCreate, db: Session = Depends(get_db)):
    existing = db.query(RestaurantTable).filter(RestaurantTable.table_number == table_in.tableNumber.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Table number already exists")

    new_tbl = RestaurantTable(
        table_number=table_in.tableNumber.upper(),
        capacity=table_in.capacity,
        area=table_in.area,
        assigned_server=table_in.assignedServer or "",
        notes=table_in.notes or "",
        status=TableStatus.AVAILABLE
    )
    db.add(new_tbl)
    db.commit()
    db.refresh(new_tbl)

    return {
        "id": new_tbl.id,
        "tableNumber": new_tbl.table_number,
        "capacity": new_tbl.capacity,
        "area": new_tbl.area,
        "status": new_tbl.status,
        "assignedServer": new_tbl.assigned_server,
        "notes": new_tbl.notes
    }

@router.put("/{id}", response_model=TableResponse)
def update_table(id: str, table_in: TableUpdate, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(RestaurantTable.id == id).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    if table_in.tableNumber: tbl.table_number = table_in.tableNumber.upper()
    if table_in.capacity: tbl.capacity = table_in.capacity
    if table_in.area: tbl.area = table_in.area
    if table_in.status: tbl.status = table_in.status
    if table_in.assignedServer is not None: tbl.assigned_server = table_in.assignedServer
    if table_in.notes is not None: tbl.notes = table_in.notes

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

@router.get("/{id}")
def get_table_by_id(id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter((RestaurantTable.id == id) | (RestaurantTable.table_number.ilike(id))).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")
    return {
        "id": tbl.id,
        "tableNumber": tbl.table_number,
        "capacity": tbl.capacity,
        "area": tbl.area,
        "status": tbl.status,
        "assignedServer": tbl.assigned_server,
        "notes": tbl.notes
    }

@router.patch("/{id}/seat")
def seat_table_public(id: str, payload: dict, db: Session = Depends(get_db)):
    from app.routes.admin import seat_party_on_table
    return seat_party_on_table(id, payload, db)

@router.patch("/{id}/status")
def update_table_status_public(id: str, payload: dict, db: Session = Depends(get_db)):
    from app.routes.admin import update_table_status
    return update_table_status(id, payload, db)

@router.patch("/{id}/bill")
def issue_table_bill_public(id: str, payload: dict = {}, db: Session = Depends(get_db)):
    from app.routes.admin import issue_table_bill
    return issue_table_bill(id, db)

@router.patch("/{id}/complete")
def complete_table_dining_public(id: str, payload: dict = {}, db: Session = Depends(get_db)):
    from app.routes.admin import complete_table_dining
    return complete_table_dining(id, payload, db)

@router.delete("/{id}")
def delete_table(id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(RestaurantTable.id == id).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    db.delete(tbl)
    db.commit()
    return {"success": True, "message": "Table deleted successfully"}
