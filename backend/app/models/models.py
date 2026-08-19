import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SERVER = "SERVER"
    STAFF = "STAFF"
    CUSTOMER = "CUSTOMER"

class TableStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    CLEANING = "cleaning"
    BILL_ISSUED = "bill_issued"

class ReservationStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SEATED = "seated"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    table_number = Column(String, unique=True, nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    area = Column(String, default="Main Dining Floor", nullable=False) # Main Dining Floor, VIP / Family Booths, Garden Terrace, Banquet & Events
    status = Column(String, default=TableStatus.AVAILABLE, nullable=False)
    assigned_server = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    reservations = relationship("Reservation", back_populates="assigned_table")

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    reservation_number = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=False, index=True)
    guests = Column(Integer, nullable=False)
    date = Column(String, nullable=False, index=True) # YYYY-MM-DD
    time = Column(String, nullable=False, index=True) # HH:MM
    seating_area = Column(String, default="Main Dining Floor")
    occasion = Column(String, default="Casual Dining")
    special_requests = Column(Text, nullable=True)
    status = Column(String, default=ReservationStatus.CONFIRMED, nullable=False, index=True)
    assigned_table_id = Column(String, ForeignKey("restaurant_tables.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_table = relationship("RestaurantTable", back_populates="reservations")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True) # soup, starters-veg, starters-nonveg, mains-veg, mains-nonveg, noodles, rice, desserts, beverages
    is_veg = Column(Boolean, default=True)
    is_spicy = Column(Boolean, default=False)
    spice_level = Column(Integer, default=1)
    is_chef_special = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="food") # food, ambiance, chef, events
    image_url = Column(String, nullable=False)
    caption = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class RestaurantSetting(Base):
    __tablename__ = "restaurant_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    subject = Column(String, default="General Inquiry")
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class EventInquiry(Base):
    __tablename__ = "event_inquiries"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    guests = Column(Integer, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, default="19:00")
    budget = Column(String, nullable=True)
    special_requests = Column(Text, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

class TableOrder(Base):
    __tablename__ = "table_orders"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    table_id = Column(String, ForeignKey("restaurant_tables.id"), nullable=False, index=True)
    table_number = Column(String, nullable=True, index=True)
    server_id = Column(String, nullable=True, index=True)
    server_name = Column(String, nullable=True)
    party_name = Column(String, default="Guest")
    customer_phone = Column(String, nullable=True)
    status = Column(String, default="active", index=True) # active, bill_issued, completed, cancelled
    subtotal = Column(Float, default=0.0)
    tax = Column(Float, default=0.0) # 20% VAT
    total_amount = Column(Float, default=0.0)
    payment_status = Column(String, default="pending") # pending, paid
    invoice_number = Column(String, nullable=True)
    sms_sent = Column(Boolean, default=False)
    sms_sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("TableOrderItem", back_populates="order", cascade="all, delete-orphan")

class TableOrderItem(Base):
    __tablename__ = "table_order_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    order_id = Column(String, ForeignKey("table_orders.id"), nullable=False, index=True)
    menu_item_id = Column(String, nullable=True)
    item_name = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    spice_level = Column(String, default="Medium")
    order = relationship("TableOrder", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    rating = Column(Integer, default=5, nullable=False)
    comment = Column(Text, nullable=False)
    dish_recommended = Column(String, nullable=True)
    verified_diner = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
