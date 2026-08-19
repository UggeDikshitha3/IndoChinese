from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import GalleryItem
from app.schemas.schemas import GalleryItemCreate, GalleryItemResponse

router = APIRouter(prefix="/gallery", tags=["gallery"])

@router.get("", response_model=List[GalleryItemResponse])
def get_gallery(db: Session = Depends(get_db)):
    items = db.query(GalleryItem).order_by(GalleryItem.created_at.desc()).all()
    return [
        {
            "id": g.id,
            "title": g.title,
            "category": g.category,
            "image": g.image_url,
            "caption": g.caption
        }
        for g in items
    ]

@router.post("", response_model=GalleryItemResponse)
def create_gallery_item(item_in: GalleryItemCreate, db: Session = Depends(get_db)):
    new_item = GalleryItem(
        title=item_in.title,
        category=item_in.category or "food",
        image_url=item_in.image,
        caption=item_in.caption or ""
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": new_item.id,
        "title": new_item.title,
        "category": new_item.category,
        "image": new_item.image_url,
        "caption": new_item.caption
    }

@router.delete("/{id}")
def delete_gallery_item(id: str, db: Session = Depends(get_db)):
    item = db.query(GalleryItem).filter(GalleryItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Gallery item deleted successfully"}
