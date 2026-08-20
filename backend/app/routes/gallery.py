from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import GalleryItem
from app.schemas.schemas import GalleryItemCreate, GalleryItemResponse

def ensure_default_gallery(db: Session):
    try:
        default_items = [
            GalleryItem(title="Triple Schezwan Street Feast", category="chef_specials", image_url="/src/assets/images/triple_schezwan_combo_1786516611209.jpg", caption="Bombay signature street combo with wok-tossed rice, noodles & rich gravy"),
            GalleryItem(title="High-Flame Fiery Wok Station", category="restaurant", image_url="/src/assets/images/fiery_wok_kitchen_1786965247008.jpg", caption="Authentic wok-hei cooking technique over roaring gas burners"),
            GalleryItem(title="Signature Chicken Lollipops", category="chef_specials", image_url="/src/assets/images/chicken_lollipop_dry_1786864878519.jpg", caption="Frenched chicken drumettes coated in secret Indo-Chinese spices"),
            GalleryItem(title="Dining Room & Ambient Atmosphere", category="ambience", image_url="/src/assets/images/restaurant_ambience_1786965269878.jpg", caption="Warm and inviting seating perfect for family feasts and casual dining"),
            GalleryItem(title="Sizzling Chilli King Prawns", category="food", image_url="/src/assets/images/chilli_prawns_1786542836086.jpg", caption="Juicy whole prawns sautéed with bell peppers and green chillies"),
            GalleryItem(title="Master Chef Plating & Finishing", category="restaurant", image_url="/src/assets/images/master_chef_plating_1786965291357.jpg", caption="Every wok order freshly prepared and garnished with scallions"),
            GalleryItem(title="Sizzling Chilli Paneer", category="food", image_url="/src/assets/images/chilli_paneer_1786542725460.jpg", caption="Crispy golden paneer cubes tossed with spring onions and dark soy"),
            GalleryItem(title="Hot Garlic Chicken", category="food", image_url="/src/assets/images/hot_garlic_chicken_1786872610686.jpg", caption="Succulent diced chicken tossed in fiery roasted red garlic sauce"),
            GalleryItem(title="Steamed Bombay Dumplings (Momos)", category="food", image_url="/src/assets/images/steamed_dumplings_momo_1786520824895.jpg", caption="Handcrafted momos served with fiery Bombay red chutney dip"),
            GalleryItem(title="Bombay Manchow Soup with Crispy Noodles", category="food", image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", caption="Aromatic dark soya broth topped with signature crispy fried noodles"),
            GalleryItem(title="Hyderabad Spicy Chicken Rice", category="chef_specials", image_url="/src/assets/images/hyderabad_chicken_rice_1786964791860.jpg", caption="Long-grain basmati tossed with fragrant curry leaves & green chillies"),
            GalleryItem(title="Andhra Spicy King Prawns 65", category="chef_specials", image_url="/src/assets/images/andhra_prawn_65_1786865574041.jpg", caption="Deep-fried marinated king prawns tempered with regional spices"),
            GalleryItem(title="Burnt Garlic Paneer Fried Rice", category="food", image_url="/src/assets/images/burnt_garlic_paneer_rice_1786865926634.jpg", caption="Aromatic fried rice loaded with crispy golden garlic chips & paneer"),
            GalleryItem(title="Crispy Veg Hakka Noodles", category="food", image_url="/src/assets/images/veg_hakka_noodles_1786864935647.jpg", caption="Street-style thin noodles stir-fried with julienned vegetables"),
            GalleryItem(title="Crispy Gobi Manchurian", category="food", image_url="/src/assets/images/gobi_manchurian_1786865605343.jpg", caption="Crunchy cauliflower florets glazed in sweet-tangy-spicy Manchurian sauce"),
            GalleryItem(title="Bombay Masala Chips with Mint Yogurt", category="food", image_url="/src/assets/images/bombay_chips_1786542907959.jpg", caption="Crispy potato chips dusted in house chaat spice with cool yogurt dip"),
            GalleryItem(title="Hot Garlic King Prawns", category="chef_specials", image_url="/src/assets/images/hot_garlic_prawns_1786865700810.jpg", caption="Plump king prawns in intense slow-roasted garlic and chilli glaze"),
            GalleryItem(title="Aromatic Lemongrass Tom Yum Soup", category="food", image_url="/src/assets/images/tom_yum_chicken_soup_1786610012394.jpg", caption="Tangy and spicy Thai-Chinese broth infused with fresh galangal & herbs"),
            GalleryItem(title="Fiery Wok-Tossed Szechwan Noodles", category="chef_specials", image_url="/src/assets/images/szechwan_noodles_1786865275304.jpg", caption="Thin Hakka noodles wok-tossed in homemade spicy Sichuan pepper reduction"),
            GalleryItem(title="Singapore Golden Curry Fried Rice", category="food", image_url="/src/assets/images/singapore_fried_rice_1786865981318.jpg", caption="Aromatic basmati infused with yellow curry spices, bell peppers and spring onion"),
            GalleryItem(title="Spicy Chicken 65 with Tempered Curry Leaves", category="chef_specials", image_url="/src/assets/images/chicken_65_1786542806844.jpg", caption="Iconic street specialty with crisp chicken bites, green chillies & mustard aroma"),
            GalleryItem(title="Golden Crispy Veg Spring Rolls", category="food", image_url="/src/assets/images/veg_spring_rolls_1786542679969.jpg", caption="Handcrafted golden rolls filled with shredded seasonal vegetables & garlic"),
            GalleryItem(title="Chilli Garlic Mushroom Wok Toss", category="food", image_url="/src/assets/images/chilli_mushroom_1786610730124.jpg", caption="Plump button mushrooms tossed with red peppers, onions and dark chili soy"),
            GalleryItem(title="Wok Chilli Chicken (Bombay Style)", category="food", image_url="/src/assets/images/chilli_chicken_1786542793770.jpg", caption="Tender chicken breast tossed with green chillies, capsicum and rich soya glaze"),
            GalleryItem(title="Signature Prawn Manchurian Gravy", category="food", image_url="/src/assets/images/prawn_manchurian_1786865589831.jpg", caption="Succulent king prawns simmered in ginger, garlic, and coriander Manchurian sauce"),
            GalleryItem(title="Crispy Szechwan Potato Chips", category="food", image_url="/src/assets/images/szechwan_chips_1786542892121.jpg", caption="Freshly cut potato fries wok-coated with sizzling Szechwan garlic sauce"),
            GalleryItem(title="Wok Dim Sum Steaming in Bamboo Baskets", category="restaurant", image_url="/src/assets/images/chicken_momos_steamed_1786610033977.jpg", caption="Fresh batches of delicate vegetable and chicken momos steamed continuously"),
            GalleryItem(title="Family Feast Table Setting", category="ambience", image_url="/src/assets/images/restaurant_ambience_1786965269878.jpg", caption="Cozy booths and spacious tables ready for vibrant Indo-Chinese dining"),
        ]
        
        canonical_map = {d.title.strip().lower(): d for d in default_items}
        all_db_items = db.query(GalleryItem).all()
        seen_titles = set()
        
        for item in all_db_items:
            norm_title = item.title.strip().lower()
            if norm_title in seen_titles:
                db.delete(item)
            else:
                seen_titles.add(norm_title)
        
        for norm_title, d in canonical_map.items():
            if norm_title not in seen_titles:
                db.add(d)
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Gallery seeding notice: {e}")

router = APIRouter(prefix="/gallery", tags=["gallery"])

@router.get("", response_model=List[GalleryItemResponse])
def get_gallery(db: Session = Depends(get_db)):
    ensure_default_gallery(db)
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
