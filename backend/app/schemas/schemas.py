from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    token: str
    user: dict

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: Optional[str] = "CUSTOMER"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Reservation Schemas
class ReservationCreate(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: str
    guests: int = Field(..., ge=1, le=50)
    date: str
    time: str
    seatingArea: Optional[str] = "Main Dining Floor"
    occasion: Optional[str] = "Casual Dining"
    specialRequests: Optional[str] = ""

class ReservationUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    guests: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None
    seatingArea: Optional[str] = None
    occasion: Optional[str] = None
    specialRequests: Optional[str] = None
    status: Optional[str] = None
    assignedTableId: Optional[str] = None

class ReservationResponse(BaseModel):
    id: str
    reservationNumber: str
    name: str
    email: Optional[str]
    phone: str
    guests: int
    date: str
    time: str
    seatingArea: Optional[str]
    occasion: Optional[str]
    specialRequests: Optional[str]
    status: str
    assignedTableId: Optional[str] = None
    createdAt: datetime

    class Config:
        from_attributes = True

# Table Schemas
class TableCreate(BaseModel):
    tableNumber: str
    capacity: int
    area: str
    assignedServer: Optional[str] = ""
    notes: Optional[str] = ""

class TableUpdate(BaseModel):
    tableNumber: Optional[str] = None
    capacity: Optional[int] = None
    area: Optional[str] = None
    status: Optional[str] = None
    assignedServer: Optional[str] = None
    notes: Optional[str] = None

class TableResponse(BaseModel):
    id: str
    tableNumber: str
    capacity: int
    area: str
    status: str
    assignedServer: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Menu Schemas
class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    price: float
    category: str
    isVeg: bool = True
    isSpicy: bool = False
    spiceLevel: int = 1
    isChefSpecial: bool = False
    isPopular: bool = False
    image: Optional[str] = None
    available: bool = True

class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    isVeg: Optional[bool] = None
    isSpicy: Optional[bool] = None
    spiceLevel: Optional[int] = None
    isChefSpecial: Optional[bool] = None
    isPopular: Optional[bool] = None
    image: Optional[str] = None
    available: Optional[bool] = None

class MenuItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    price: float
    category: str
    isVeg: bool = True
    isSpicy: bool = False
    spiceLevel: int = 1
    isChefSpecial: Optional[bool] = False
    isPopular: Optional[bool] = False
    badge: Optional[str] = None
    allergens: Optional[List[str]] = []
    options: Optional[List[dict]] = []
    image: Optional[str] = None
    available: Optional[bool] = True
    isAvailable: Optional[bool] = True

    class Config:
        from_attributes = True
        extra = "ignore"

# Gallery Schemas
class GalleryItemCreate(BaseModel):
    title: str
    category: Optional[str] = "food"
    image: str
    caption: Optional[str] = ""

class GalleryItemResponse(BaseModel):
    id: str
    title: str
    category: str
    image: str
    caption: Optional[str]

    class Config:
        from_attributes = True

# Contact Schemas
class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = "General Inquiry"
    message: str

class EventInquiryCreate(BaseModel):
    name: str
    email: str
    phone: str
    eventType: str
    guests: int
    date: str
    time: Optional[str] = "19:00"
    budget: Optional[str] = ""
    specialRequests: Optional[str] = ""
