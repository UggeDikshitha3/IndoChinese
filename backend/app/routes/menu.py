from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import MenuItem
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("", response_model=List[MenuItemResponse])
def get_menu(
    category: Optional[str] = Query(None),
    isVeg: Optional[bool] = Query(None),
    isNonVeg: Optional[bool] = Query(None),
    isSpicy: Optional[bool] = Query(None),
    isChefSpecial: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem)

    if category and category != "all":
        query = query.filter(MenuItem.category == category)
    if isVeg is not None and isVeg:
        query = query.filter(MenuItem.is_veg == True)
    if isNonVeg is not None and isNonVeg:
        query = query.filter(MenuItem.is_veg == False)
    if isSpicy is not None and isSpicy:
        query = query.filter(MenuItem.is_spicy == True)
    if isChefSpecial is not None and isChefSpecial:
        query = query.filter(MenuItem.is_chef_special == True)
    if search:
        s = f"%{search.strip().lower()}%"
        query = query.filter(MenuItem.name.ilike(s) | MenuItem.description.ilike(s))

    items = query.order_by(MenuItem.created_at.asc()).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "description": i.description,
            "price": i.price,
            "category": i.category,
            "isVeg": i.is_veg,
            "isSpicy": i.is_spicy,
            "spiceLevel": i.spice_level,
            "isChefSpecial": i.is_chef_special,
            "isPopular": i.is_popular,
            "image": i.image_url,
            "available": i.available
        }
        for i in items
    ]

@router.post("", response_model=MenuItemResponse)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db)):
    new_item = MenuItem(
        name=item_in.name,
        description=item_in.description or "",
        price=item_in.price,
        category=item_in.category,
        is_veg=item_in.isVeg,
        is_spicy=item_in.isSpicy,
        spice_level=item_in.spiceLevel,
        is_chef_special=item_in.isChefSpecial,
        is_popular=item_in.isPopular,
        image_url=item_in.image or "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
        available=item_in.available
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": new_item.id,
        "name": new_item.name,
        "description": new_item.description,
        "price": new_item.price,
        "category": new_item.category,
        "isVeg": new_item.is_veg,
        "isSpicy": new_item.is_spicy,
        "spiceLevel": new_item.spice_level,
        "isChefSpecial": new_item.is_chef_special,
        "isPopular": new_item.is_popular,
        "image": new_item.image_url,
        "available": new_item.available
    }

@router.put("/{id}", response_model=MenuItemResponse)
def update_menu_item(id: str, item_in: MenuItemUpdate, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    if item_in.name is not None: item.name = item_in.name
    if item_in.description is not None: item.description = item_in.description
    if item_in.price is not None: item.price = item_in.price
    if item_in.category is not None: item.category = item_in.category
    if item_in.isVeg is not None: item.is_veg = item_in.isVeg
    if item_in.isSpicy is not None: item.is_spicy = item_in.isSpicy
    if item_in.spiceLevel is not None: item.spice_level = item_in.spiceLevel
    if item_in.isChefSpecial is not None: item.is_chef_special = item_in.isChefSpecial
    if item_in.isPopular is not None: item.is_popular = item_in.isPopular
    if item_in.image is not None: item.image_url = item_in.image
    if item_in.available is not None: item.available = item_in.available

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "isVeg": item.is_veg,
        "isSpicy": item.is_spicy,
        "spiceLevel": item.spice_level,
        "isChefSpecial": item.is_chef_special,
        "isPopular": item.is_popular,
        "image": item.image_url,
        "available": item.available
    }

@router.delete("/{id}")
def delete_menu_item(id: str, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Menu item deleted successfully"}
