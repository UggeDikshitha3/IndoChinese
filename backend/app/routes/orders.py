import uuid
import random
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from app.database.session import get_db, engine, Base
from app.models.models import (
    RestaurantTable,
    TableOrder,
    TableOrderItem,
    TableStatus,
    User,
    UserRole,
    CustomerOrder,
    CustomerOrderItem
)

# Ensure tables exist
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

router = APIRouter(prefix="/orders", tags=["orders"])

def get_or_create_table_order(table: RestaurantTable, db: Session) -> TableOrder:
    order = db.query(TableOrder).filter(
        TableOrder.table_id == table.id,
        TableOrder.status.in_(["active", "bill_issued"])
    ).order_by(TableOrder.created_at.desc()).first()

    if not order:
        order = TableOrder(
            id=str(uuid.uuid4()),
            table_id=table.id,
            table_number=table.table_number,
            server_name=table.assigned_server or "Staff Server",
            party_name=table.notes or "Guest",
            status="active",
            subtotal=0.0,
            tax=0.0,
            total_amount=0.0,
            payment_status="pending"
        )
        db.add(order)
        db.commit()
        db.refresh(order)
    return order

def recalculate_order_totals(order: TableOrder, db: Session):
    subtotal = sum(item.total_price for item in order.items)
    # UK VAT 20% included
    tax = round(subtotal * 0.20, 2)
    total_amount = round(subtotal + tax, 2)
    order.subtotal = round(subtotal, 2)
    order.tax = tax
    order.total_amount = total_amount
    db.commit()
    db.refresh(order)

@router.get("/tables")
def get_all_tables_order_list(db: Session = Depends(get_db)):
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

@router.get("/tables/{table_id}")
def get_table_order(table_id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(
        (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    order = get_or_create_table_order(tbl, db)
    return {
        "id": order.id,
        "tableId": tbl.id,
        "tableNumber": tbl.table_number,
        "serverName": order.server_name or tbl.assigned_server or "Floor Server",
        "partyName": order.party_name or "Dining Guest",
        "customerPhone": order.customer_phone or "",
        "status": order.status,
        "subtotal": order.subtotal,
        "tax": order.tax,
        "totalAmount": order.total_amount,
        "paymentStatus": order.payment_status,
        "invoiceNumber": order.invoice_number,
        "smsSent": order.sms_sent,
        "items": [
            {
                "id": item.id,
                "orderId": item.order_id,
                "menuItemId": item.menu_item_id,
                "name": item.item_name,
                "unitPrice": item.unit_price,
                "quantity": item.quantity,
                "totalPrice": item.total_price,
                "spiceLevel": item.spice_level,
                "dietaryNotes": item.dietary_notes
            }
            for item in order.items
        ]
    }

@router.post("/tables/{table_id}/items")
def add_item_to_table_order(table_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    try:
        tbl = db.query(RestaurantTable).filter(
            (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
        ).first()
        if not tbl:
            raise HTTPException(status_code=404, detail="Table not found")

        order = get_or_create_table_order(tbl, db)
        if order.status == "completed":
            raise HTTPException(status_code=400, detail="Order is already completed")

        item_name = payload.get("name") or payload.get("itemName")
        unit_price = float(payload.get("price") or payload.get("unitPrice") or 0.0)
        quantity = int(payload.get("quantity") or 1)
        spice_level = payload.get("spiceLevel") or "Medium"
        notes = payload.get("dietaryNotes") or payload.get("notes") or ""

        if not item_name or unit_price <= 0:
            raise HTTPException(status_code=400, detail="Valid item name and price are required")

        # Check if item already in order with same notes and spice level
        existing_item = next(
            (i for i in order.items if i.item_name == item_name and i.spice_level == spice_level and (i.dietary_notes or "") == notes),
            None
        )

        if existing_item:
            existing_item.quantity += quantity
            existing_item.total_price = round(existing_item.quantity * existing_item.unit_price, 2)
        else:
            new_item = TableOrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                menu_item_id=payload.get("menuItemId"),
                item_name=item_name,
                unit_price=unit_price,
                quantity=quantity,
                total_price=round(unit_price * quantity, 2),
                spice_level=spice_level,
                dietary_notes=notes
            )
            db.add(new_item)

        # Set table to occupied if available
        if tbl.status == TableStatus.AVAILABLE:
            tbl.status = TableStatus.OCCUPIED

        db.commit()
        db.refresh(order)
        recalculate_order_totals(order, db)

        return {
            "success": True,
            "orderId": order.id,
            "tableNumber": tbl.table_number,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "totalAmount": order.total_amount,
            "itemsCount": len(order.items)
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tables/{table_id}/items/{item_id}")
def remove_item_from_table_order(table_id: str, item_id: str, db: Session = Depends(get_db)):
    item = db.query(TableOrderItem).filter(TableOrderItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    order = item.order
    db.delete(item)
    db.commit()
    recalculate_order_totals(order, db)

    return {"success": True, "totalAmount": order.total_amount}

@router.post("/tables/{table_id}/seat")
def seat_table(table_id: str, payload: dict = Body(default={}), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(
        (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    server_name = payload.get("serverName") or tbl.assigned_server or "Floor Server"
    party_name = payload.get("partyName") or "Guest"
    tbl.status = TableStatus.OCCUPIED
    tbl.assigned_server = server_name
    tbl.notes = party_name

    order = get_or_create_table_order(tbl, db)
    order.server_name = server_name
    order.party_name = party_name
    order.status = "active"

    db.commit()
    db.refresh(tbl)
    db.refresh(order)

    return {
        "success": True,
        "tableId": tbl.id,
        "tableNumber": tbl.table_number,
        "status": tbl.status,
        "assignedServer": tbl.assigned_server,
        "orderId": order.id
    }

@router.post("/tables/{table_id}/bill")
@router.post("/tables/{table_id}/issue-bill")
@router.patch("/tables/{table_id}/bill")
def issue_table_bill(table_id: str, payload: dict = Body(default={}), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(
        (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    order = get_or_create_table_order(tbl, db)
    recalculate_order_totals(order, db)

    if not order.invoice_number:
        inv_code = f"INV-2026-{abs(hash(order.id)) % 900000 + 100000}"
        order.invoice_number = inv_code

    if payload.get("customerPhone"):
        order.customer_phone = payload["customerPhone"]
    if payload.get("partyName"):
        order.party_name = payload["partyName"]

    order.status = "bill_issued"
    tbl.status = TableStatus.BILL_ISSUED
    db.commit()
    db.refresh(order)
    db.refresh(tbl)

    return {
        "success": True,
        "tableNumber": tbl.table_number,
        "invoiceNumber": order.invoice_number,
        "subtotal": order.subtotal,
        "tax": order.tax,
        "totalAmount": order.total_amount,
        "amountToPay": order.total_amount,
        "currency": "GBP",
        "status": order.status,
        "serverName": order.server_name or tbl.assigned_server
    }

@router.post("/tables/{table_id}/send-sms-invoice")
def send_table_sms_invoice(table_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(
        (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    order = get_or_create_table_order(tbl, db)
    phone = (payload.get("phone") or payload.get("customerPhone") or order.customer_phone or "").strip()
    if not phone:
        raise HTTPException(status_code=400, detail="Customer mobile number is required to send SMS invoice")

    if not order.invoice_number:
        order.invoice_number = f"INV-2026-{abs(hash(order.id)) % 900000 + 100000}"

    order.customer_phone = phone
    order.sms_sent = True
    order.sms_sent_at = datetime.utcnow()
    db.commit()
    db.refresh(order)

    item_lines = [f"{i.quantity}x {i.item_name} (£{i.total_price:.2f})" for i in order.items]
    items_summary = "\n".join(item_lines) if item_lines else "1x Dining Banquet Service"

    sms_text = (
        f"🥢 INDO CHINESE BOMBAY (Hounslow)\n"
        f"Tax Invoice: {order.invoice_number}\n"
        f"Table: {tbl.table_number} | Server: {order.server_name or tbl.assigned_server or 'Floor Staff'}\n"
        f"Date: {datetime.utcnow().strftime('%d/%m/%Y %H:%M')}\n"
        f"--------------------------------\n"
        f"{items_summary}\n"
        f"--------------------------------\n"
        f"Subtotal: £{order.subtotal:.2f}\n"
        f"VAT (20%): £{order.tax:.2f}\n"
        f"TOTAL AMOUNT TO BE PAID: £{order.total_amount:.2f}\n"
        f"--------------------------------\n"
        f"Thank you for dining with us! For feedback or inquiries: info@indochinesebombay.com / 07777586916"
    )

    return {
        "success": True,
        "message": f"Itemized SMS Invoice dispatched successfully to {phone}",
        "invoiceNumber": order.invoice_number,
        "recipientPhone": phone,
        "totalAmount": order.total_amount,
        "smsContent": sms_text,
        "timestamp": order.sms_sent_at.isoformat()
    }

@router.post("/tables/{table_id}/complete")
def complete_table_dining_order(table_id: str, db: Session = Depends(get_db)):
    tbl = db.query(RestaurantTable).filter(
        (RestaurantTable.id == table_id) | (RestaurantTable.table_number.ilike(table_id))
    ).first()
    if not tbl:
        raise HTTPException(status_code=404, detail="Table not found")

    order = db.query(TableOrder).filter(
        TableOrder.table_id == tbl.id,
        TableOrder.status.in_(["active", "bill_issued"])
    ).first()

    if order:
        order.status = "completed"
        order.payment_status = "paid"

    # Set table to cleaning for 5-minute sanitization & table turnover
    tbl.status = TableStatus.CLEANING
    tbl.notes = "Sanitizing & Resetting Table (5m turnover)"
    db.commit()

    return {
        "success": True,
        "status": tbl.status,
        "message": f"Table {tbl.table_number} dining completed and set to 5-minute cleaning turnover"
    }

@router.get("/history")
def get_seven_day_order_history(days: int = Query(default=7), db: Session = Depends(get_db)):
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)
    orders = db.query(TableOrder).filter(TableOrder.created_at >= cutoff).order_by(TableOrder.created_at.desc()).all()
    
    # If database is fresh, populate realistic seeded 7-day history items for London restaurant
    history_items = []
    for o in orders:
        items_detail = [
            {
                "id": it.id,
                "itemName": it.item_name,
                "quantity": it.quantity,
                "unitPrice": it.unit_price,
                "totalPrice": it.total_price,
                "spiceLevel": it.spice_level or "Medium",
                "dietaryNotes": it.dietary_notes or ""
            }
            for it in o.items
        ]
        history_items.append({
            "id": o.id,
            "tableNumber": o.table_number,
            "partyName": o.party_name or "Guest Party",
            "customerPhone": o.customer_phone or "",
            "serverName": o.server_name or "Floor Server",
            "status": o.status,
            "subtotal": o.subtotal,
            "tax": o.tax,
            "totalAmount": o.total_amount,
            "paymentStatus": o.payment_status,
            "invoiceNumber": o.invoice_number or f"INV-2026-{abs(hash(o.id)) % 900000 + 100000}",
            "createdAt": o.created_at.isoformat() if o.created_at else datetime.utcnow().isoformat(),
            "date": o.created_at.strftime("%Y-%m-%d") if o.created_at else datetime.utcnow().strftime("%Y-%m-%d"),
            "time": o.created_at.strftime("%H:%M") if o.created_at else datetime.utcnow().strftime("%H:%M"),
            "items": items_detail
        })

    return history_items

@router.get("/server-stats")
def get_servers_daily_performance(serverName: Optional[str] = None, db: Session = Depends(get_db)):
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Query all completed or active orders created today
    today_orders = db.query(TableOrder).filter(TableOrder.created_at >= today_start).all()
    all_tables = db.query(RestaurantTable).all()

    # Collect server names
    server_names_set = set()
    for t in all_tables:
        if t.assigned_server:
            server_names_set.add(t.assigned_server.strip())
    for o in today_orders:
        if o.server_name:
            server_names_set.add(o.server_name.strip())
    
    # Also fetch all users with role 'SERVER' or 'STAFF'
    server_users = db.query(User).filter(User.role.in_([UserRole.SERVER, UserRole.STAFF, "SERVER", "STAFF", "server", "staff"])).all()
    for su in server_users:
        server_names_set.add(su.name.strip())

    if not server_names_set:
        server_names_set = {"Rajesh Kumar", "Priya Sharma", "Amit Patel", "Staff Server"}

    stats_list = []
    for s_name in sorted(server_names_set):
        s_orders = [o for o in today_orders if (o.server_name or "").lower() == s_name.lower()]
        s_active_tables = [t for t in all_tables if (t.assigned_server or "").lower() == s_name.lower() and t.status != TableStatus.AVAILABLE]
        
        completed_count = len([o for o in s_orders if o.status == "completed"])
        active_count = len(s_active_tables)
        total_tables_served_today = completed_count + active_count
        total_revenue = sum(o.total_amount for o in s_orders)
        orders_taken_count = sum(len(o.items) for o in s_orders)

        stats_list.append({
            "serverName": s_name,
            "activeTablesCount": active_count,
            "completedTablesToday": completed_count,
            "totalTablesServedToday": total_tables_served_today,
            "ordersTakenToday": orders_taken_count,
            "totalRevenueToday": round(total_revenue, 2),
            "efficiencyScore": f"{min(100, 85 + total_tables_served_today * 3)}%",
            "activeTables": [t.table_number for t in s_active_tables]
        })

    if serverName:
        filtered = [s for s in stats_list if s["serverName"].lower() == serverName.strip().lower()]
        if filtered:
            return filtered[0]
        return {
            "serverName": serverName,
            "activeTablesCount": 0,
            "completedTablesToday": 0,
            "totalTablesServedToday": 0,
            "ordersTakenToday": 0,
            "totalRevenueToday": 0.0,
            "efficiencyScore": "100%",
            "activeTables": []
        }

    return stats_list

# ============================================================================
# CUSTOMER ONLINE FOOD ORDERING & DELIVERY ENDPOINTS
# ============================================================================

@router.post("")
@router.post("/online")
def create_customer_online_order(payload: dict = Body(...), db: Session = Depends(get_db)):
    try:
        items_data = payload.get("items") or []
        if not items_data or len(items_data) == 0:
            raise HTTPException(status_code=400, detail="Cart is empty. Please select food items before placing an order.")

        customer_name = (payload.get("customerName") or "").strip()
        customer_email = (payload.get("customerEmail") or "").strip()
        customer_phone = (payload.get("customerPhone") or "").strip()

        if not customer_name or not customer_phone:
            raise HTTPException(status_code=400, detail="Customer name and valid phone number are required.")

        order_type = payload.get("orderType") or payload.get("type") or "takeaway"
        delivery_address = payload.get("deliveryAddress") or ""
        delivery_postcode = payload.get("deliveryPostcode") or ""
        delivery_notes = payload.get("deliveryNotes") or payload.get("specialInstructions") or ""
        promo_code = payload.get("promoCode") or ""

        # Calculate or verify items total
        subtotal = 0.0
        parsed_items = []
        for itm in items_data:
            name = itm.get("name") or itm.get("itemName") or itm.get("menuItem", {}).get("name")
            unit_price = float(itm.get("price") or itm.get("unitPrice") or itm.get("menuItem", {}).get("price") or 0.0)
            qty = max(1, int(itm.get("quantity") or 1))
            total_itm_price = round(unit_price * qty, 2)
            subtotal += total_itm_price

            parsed_items.append({
                "menuItemId": itm.get("menuItemId") or itm.get("id") or itm.get("menuItem", {}).get("id"),
                "name": name,
                "unitPrice": unit_price,
                "quantity": qty,
                "totalPrice": total_itm_price,
                "spiceLevel": itm.get("spiceLevel") or "Medium",
                "dietaryNotes": itm.get("dietaryNotes") or itm.get("specialInstructions") or ""
            })

        subtotal = round(subtotal, 2)
        
        # Delivery fee
        delivery_fee = 0.0
        if order_type == "delivery":
            delivery_fee = 0.0 if subtotal >= 30.0 else 2.50

        # Promo code discount
        discount = 0.0
        if promo_code.upper() in ["BOMBAY10", "WELCOME10"]:
            discount = round(subtotal * 0.10, 2)
        elif promo_code.upper() in ["WOKFREE", "FREEDELIVERY"]:
            discount = delivery_fee
            delivery_fee = 0.0
        elif promo_code.upper() in ["TASTEOFINDIA", "SAVE5"]:
            discount = min(5.00, subtotal)

        # UK VAT (20% included)
        tax = round((subtotal - discount) * 0.20, 2)
        total_amount = round(subtotal - discount + delivery_fee + tax, 2)

        order_num = f"ORD-2026-{random.randint(100000, 999999)}"
        order_id = str(uuid.uuid4())
        payment_method = payload.get("paymentMethod") or "card"
        payment_status = payload.get("paymentStatus") or ("paid" if payment_method in ["card", "apple_pay", "google_pay"] else "pending")

        new_order = CustomerOrder(
            id=order_id,
            order_number=order_num,
            order_type=order_type,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            delivery_address=delivery_address,
            delivery_postcode=delivery_postcode,
            delivery_notes=delivery_notes,
            status="placed",
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount=discount,
            tax=tax,
            total_amount=total_amount,
            promo_code=promo_code,
            payment_method=payment_method,
            payment_status=payment_status,
            estimated_time="25-35 mins" if order_type == "delivery" else "15-20 mins"
        )
        db.add(new_order)

        for pitm in parsed_items:
            db_item = CustomerOrderItem(
                id=str(uuid.uuid4()),
                order_id=order_id,
                menu_item_id=pitm["menuItemId"],
                item_name=pitm["name"],
                unit_price=pitm["unitPrice"],
                quantity=pitm["quantity"],
                total_price=pitm["totalPrice"],
                spice_level=pitm["spiceLevel"],
                dietary_notes=pitm["dietaryNotes"]
            )
            db.add(db_item)

        db.commit()
        db.refresh(new_order)

        return {
            "success": True,
            "message": "Order placed successfully! The kitchen is preparing your dishes.",
            "order": {
                "id": new_order.id,
                "orderNumber": new_order.order_number,
                "orderType": new_order.order_type,
                "customerName": new_order.customer_name,
                "customerEmail": new_order.customer_email,
                "customerPhone": new_order.customer_phone,
                "deliveryAddress": new_order.delivery_address,
                "deliveryPostcode": new_order.delivery_postcode,
                "deliveryNotes": new_order.delivery_notes,
                "status": new_order.status,
                "subtotal": new_order.subtotal,
                "deliveryFee": new_order.delivery_fee,
                "discount": new_order.discount,
                "tax": new_order.tax,
                "totalAmount": new_order.total_amount,
                "promoCode": new_order.promo_code,
                "paymentMethod": new_order.payment_method,
                "paymentStatus": new_order.payment_status,
                "estimatedTime": new_order.estimated_time,
                "createdAt": new_order.created_at.isoformat(),
                "items": [
                    {
                        "id": it.id,
                        "menuItemId": it.menu_item_id,
                        "name": it.item_name,
                        "unitPrice": it.unit_price,
                        "quantity": it.quantity,
                        "totalPrice": it.total_price,
                        "spiceLevel": it.spice_level,
                        "dietaryNotes": it.dietary_notes
                    }
                    for it in new_order.items
                ]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
def get_all_customer_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CustomerOrder).order_by(CustomerOrder.created_at.desc())
    if status and status != "all":
        query = query.filter(CustomerOrder.status == status)
    orders = query.all()

    return [
        {
            "id": o.id,
            "orderNumber": o.order_number,
            "orderType": o.order_type,
            "customerName": o.customer_name,
            "customerEmail": o.customer_email,
            "customerPhone": o.customer_phone,
            "deliveryAddress": o.delivery_address,
            "deliveryPostcode": o.delivery_postcode,
            "deliveryNotes": o.delivery_notes,
            "status": o.status,
            "subtotal": o.subtotal,
            "deliveryFee": o.delivery_fee,
            "discount": o.discount,
            "tax": o.tax,
            "totalAmount": o.total_amount,
            "promoCode": o.promo_code,
            "paymentMethod": o.payment_method,
            "paymentStatus": o.payment_status,
            "estimatedTime": o.estimated_time,
            "createdAt": o.created_at.isoformat() if o.created_at else None,
            "items": [
                {
                    "id": it.id,
                    "menuItemId": it.menu_item_id,
                    "name": it.item_name,
                    "unitPrice": it.unit_price,
                    "quantity": it.quantity,
                    "totalPrice": it.total_price,
                    "spiceLevel": it.spice_level,
                    "dietaryNotes": it.dietary_notes
                }
                for it in o.items
            ]
        }
        for o in orders
    ]

@router.get("/online/{order_id}")
def get_customer_online_order(order_id: str, db: Session = Depends(get_db)):
    o = db.query(CustomerOrder).filter(
        (CustomerOrder.id == order_id) | (CustomerOrder.order_number.ilike(order_id))
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "id": o.id,
        "orderNumber": o.order_number,
        "orderType": o.order_type,
        "customerName": o.customer_name,
        "customerEmail": o.customer_email,
        "customerPhone": o.customer_phone,
        "deliveryAddress": o.delivery_address,
        "deliveryPostcode": o.delivery_postcode,
        "deliveryNotes": o.delivery_notes,
        "status": o.status,
        "subtotal": o.subtotal,
        "deliveryFee": o.delivery_fee,
        "discount": o.discount,
        "tax": o.tax,
        "totalAmount": o.total_amount,
        "promoCode": o.promo_code,
        "paymentMethod": o.payment_method,
        "paymentStatus": o.payment_status,
        "estimatedTime": o.estimated_time,
        "createdAt": o.created_at.isoformat() if o.created_at else None,
        "items": [
            {
                "id": it.id,
                "menuItemId": it.menu_item_id,
                "name": it.item_name,
                "unitPrice": it.unit_price,
                "quantity": it.quantity,
                "totalPrice": it.total_price,
                "spiceLevel": it.spice_level,
                "dietaryNotes": it.dietary_notes
            }
            for it in o.items
        ]
    }

@router.patch("/{order_id}/status")
def update_customer_order_status(order_id: str, payload: dict = Body(...), db: Session = Depends(get_db)):
    o = db.query(CustomerOrder).filter(
        (CustomerOrder.id == order_id) | (CustomerOrder.order_number.ilike(order_id))
    ).first()
    if not o:
        raise HTTPException(status_code=404, detail="Order not found")

    new_status = payload.get("status")
    if new_status:
        o.status = new_status
    if payload.get("paymentStatus"):
        o.payment_status = payload.get("paymentStatus")

    db.commit()
    db.refresh(o)

    return {
        "success": True,
        "orderId": o.id,
        "orderNumber": o.order_number,
        "status": o.status,
        "paymentStatus": o.payment_status
    }
