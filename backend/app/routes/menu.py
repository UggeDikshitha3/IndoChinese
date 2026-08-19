from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import MenuItem
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

def ensure_default_menu(db: Session):
    try:
        if db.query(MenuItem).count() == 0:
            default_dishes = [
                MenuItem(name="Bombay Manchow Soup", description="Street-style dark spicy soup loaded with finely chopped vegetables and crispy fried noodles.", price=5.95, category="soups", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
                MenuItem(name="Hot & Sour Soup", description="Classic fiery broth with bamboo shoots, wood ear mushrooms, tofu, and crushed white pepper.", price=5.95, category="soups", is_veg=True, is_spicy=True, spice_level=3, is_chef_special=False, is_popular=True, image_url="/src/assets/images/hot_sour_soup_1786609347778.jpg", available=True),
                MenuItem(name="Sweet Corn Veg Soup", description="Comforting rich sweet corn broth with tender creamed corn and garden peas.", price=5.50, category="soups", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/sweet_corn_soup_1786609365927.jpg", available=True),
                MenuItem(name="Steamed Veg Momos (6 pcs)", description="Delicate thin-skinned dumplings stuffed with spiced shredded vegetables, served with spicy red chutney.", price=6.95, category="momos", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/steamed_dumplings_momo_1786520824895.jpg", available=True),
                MenuItem(name="Chilli Wok Momos", description="Pan-fried dumplings tossed in a smoky wok with capsicum, onions, and spicy Indo-Chinese chilli glaze.", price=7.95, category="momos", is_veg=True, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_wok_dumplings_1786520842041.jpg", available=True),
                MenuItem(name="Crispy Fried Momos", description="Golden-crusted crispy dumplings filled with savory seasoned filling, served with schezwan mayo.", price=7.50, category="momos", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/crispy_fried_momos_1786521404691.jpg", available=True),
                MenuItem(name="Vegetable Spring Rolls (4 pcs)", description="Hand-rolled crispy pastry filled with spiced julienned cabbage, carrots, and glass noodles with sweet chilli dip.", price=5.50, category="veg_starters", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/veg_spring_rolls_1786542679969.jpg", available=True),
                MenuItem(name="Vegetable Manchurian Dry", description="Golden vegetable dumplings wok-tossed with ginger, garlic, green chillies, and savory dark soy sauce.", price=7.95, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/veg_manchurian_1786542694203.jpg", available=True),
                MenuItem(name="Chilli Paneer Dry", description="Cottage cheese cubes wok-fried with crisp bell peppers, spring onions, and spicy garlic soya sauce.", price=8.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_paneer_1786542725460.jpg", available=True),
                MenuItem(name="Chilli Gobi Dry", description="Crispy cauliflower florets glazed in spicy garlic, red chillies, and fresh scallions.", price=7.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/chilli_gobi_1786542738688.jpg", available=True),
                MenuItem(name="Szechwan Paneer", description="Tender paneer batons tossed in authentic homemade fiery Sichuan pepper sauce and crushed garlic.", price=8.95, category="veg_starters", is_veg=True, is_spicy=True, spice_level=3, is_chef_special=False, is_popular=False, image_url="/src/assets/images/szechwan_paneer_1786542753122.jpg", available=True),
                MenuItem(name="Paneer 65", description="South Indian spiced crispy paneer bites tempered with curry leaves, mustard seeds, and crushed green chillies.", price=8.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/paneer_65_1786542764483.jpg", available=True),
                MenuItem(name="Chicken Lollipop Sauced (5 pcs)", description="Frenched chicken winglets deep fried to perfection and tossed in signature hot garlic schezwan sauce.", price=8.95, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chicken_lollipop_sauced_1786516573910.jpg", available=True),
                MenuItem(name="Chicken Lollipop Dry (5 pcs)", description="Crispy spiced frenched chicken drummettes served with homemade schezwan dipping sauce.", price=8.50, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_lollipop_dry_1786864878519.jpg", available=True),
                MenuItem(name="Chilli Chicken Dry", description="Tender diced chicken breast tossed with green bell peppers, red onion petals, and dark soya glaze.", price=8.95, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_chicken_1786542793770.jpg", available=True),
                MenuItem(name="Chicken 65", description="Classic spicy fried chicken infused with aromatic curry leaves, ginger, yogurt, and crushed Kashmiri chillies.", price=8.95, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_65_1786542806844.jpg", available=True),
                MenuItem(name="Chilli Prawns", description="King prawns wok-seared with peppers, scallions, fresh red chillies, and garlic soy reduction.", price=11.95, category="prawn_specials", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_prawns_1786542836086.jpg", available=True),
                MenuItem(name="Veg Hakka Noodles", description="Traditional Kolkata Chinese wok-tossed noodles with shredded cabbage, carrots, bell peppers, and scallions.", price=7.95, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/veg_hakka_noodles_1786864935647.jpg", available=True),
                MenuItem(name="Chicken Fried Rice", description="Fluffy basmati rice wok-tossed with diced halal chicken breast, egg ribbons, and scallions.", price=8.95, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_fried_rice_1786865261779.jpg", available=True),
                MenuItem(name="Triple Schezwan Rice & Noodle Combo", description="The ultimate Indo-Chinese feast: aromatic schezwan fried rice, hakka noodles, and fiery Manchurian gravy.", price=12.95, category="chef_signatures", is_veg=False, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/triple_schezwan_combo_1786516611209.jpg", available=True)
            ]
            db.add_all(default_dishes)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Menu seeding notice: {e}")

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
    ensure_default_menu(db)
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
