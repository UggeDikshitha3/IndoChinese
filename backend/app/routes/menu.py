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
                # Soups
                MenuItem(name="Manchow Soup (Veg)", description="Classic thick Indo-Chinese soup with garlic, soya, and crispy fried noodles. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
                MenuItem(name="Manchow Soup (Chicken)", description="Fiery Bombay chicken soup topped with crispy noodles and scallions. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
                MenuItem(name="Manchow Soup (Prawns)", description="King prawn broth with julienned vegetables and crunchy fried noodles. [Allergens: Gluten, Soya, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=False, image_url="/src/assets/images/manchow_prawns_soup_1786615681191.jpg", available=True),
                MenuItem(name="Hot-n-Sour Soup (Veg)", description="Spicy and tangy dark broth with wood ear mushrooms and white pepper. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/hot_sour_soup_1786609347778.jpg", available=True),
                MenuItem(name="Hot-n-Sour Soup (Chicken)", description="Traditional tangy pepper soup with tender chicken strips. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/hot_sour_soup_1786609347778.jpg", available=True),
                MenuItem(name="Sweet Corn Soup (Veg)", description="Rich creamy sweet corn broth with tender garden peas. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/sweet_corn_soup_1786609365927.jpg", available=True),
                MenuItem(name="Tom Yum Soup (Soya - Veg)", description="Aromatic lemongrass and kaffir lime infused broth with herbs. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=False, image_url="/src/assets/images/tom_yum_veg_soup_1786865225455.jpg", available=True),
                
                # Bombay Special Dumplings
                MenuItem(name="Veg Dumpling (Steam)", description="Authentic thin-skinned steamed momos with spiced vegetable filling. [Allergens: Gluten, Soya]", price=5.99, category="momos", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=True, is_popular=True, image_url="/src/assets/images/steamed_dumplings_momo_1786520824895.jpg", available=True),
                MenuItem(name="Veg Dumpling (Chilli Wok)", description="Dumplings tossed in smoky wok with peppers and chilli glaze. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_wok_dumplings_1786520842041.jpg", available=True),
                MenuItem(name="Veg Dumpling (Fried)", description="Golden fried crispy momos served with fiery red chutney. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/crispy_fried_momos_1786521404691.jpg", available=True),
                MenuItem(name="Chicken Dumpling (Steam)", description="Juicy halal chicken minced dumplings delicately steamed. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chicken_momos_steamed_1786610033977.jpg", available=True),
                MenuItem(name="Chicken Dumpling (Chilli Wok)", description="Steamed chicken momos tossed in wok with garlic and red chillies. [Allergens: Gluten, Soya]", price=6.99, category="momos", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chicken_momos_chilli_1786610048331.jpg", available=True),
                MenuItem(name="Chicken Dumpling (Fried)", description="Crispy deep fried chicken momos with schezwan dip. [Allergens: Gluten, Soya]", price=6.99, category="momos", is_veg=False, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/chicken_momos_fried_1786610073286.jpg", available=True),

                # Veg Starters
                MenuItem(name="Veg Spring Rolls (4 pcs)", description="Crispy hand-rolled pastries filled with julienned vegetables. [Allergens: Gluten, Soya]", price=3.99, category="veg_starters", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/veg_spring_rolls_1786542679969.jpg", available=True),
                MenuItem(name="Manchurian Dry (Veg)", description="Classic golden vegetable balls tossed in ginger, garlic and soya. [Allergens: Gluten, Soya]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/veg_manchurian_1786542694203.jpg", available=True),
                MenuItem(name="Manchurian Dry (Paneer)", description="Crisp paneer cubes tossed in classic Manchurian dark soya sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/paneer_manchurian_1786542710989.jpg", available=True),
                MenuItem(name="Manchurian Dry (Gobi)", description="Crispy cauliflower florets wok-tossed with spring onions and garlic. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/gobi_manchurian_1786865605343.jpg", available=True),
                MenuItem(name="Chilli Paneer (Dry/Gravy)", description="Cottage cheese wok-fried with crisp bell peppers, green chillies, and soy. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_paneer_1786542725460.jpg", available=True),
                MenuItem(name="Paneer 65", description="Crisp paneer bites tempered with curry leaves and South Indian spices. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/paneer_65_1786542764483.jpg", available=True),
                MenuItem(name="Hot Garlic Paneer", description="Paneer tossed in chef's signature spicy crushed garlic sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=False, image_url="/src/assets/images/hot_garlic_paneer_1786964854908.jpg", available=True),

                # Non-Veg Starters
                MenuItem(name="Chicken Lollipop (Dry - 5 pcs)", description="Frenched chicken drummettes seasoned with spices and fried crispy. [Allergens: Gluten, Soya, Egg]", price=6.00, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chicken_lollipop_dry_1786864878519.jpg", available=True),
                MenuItem(name="Chicken Lollipop (Sauted - 5 pcs)", description="Crispy lollipops wok-glazed in hot garlic schezwan reduction. [Allergens: Gluten, Soya, Egg]", price=6.50, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chicken_lollipop_sauced_1786516573910.jpg", available=True),
                MenuItem(name="Chicken Rolls (4 pcs)", description="Crispy rolled pastry stuffed with spicy shredded chicken. [Allergens: Gluten, Soya, Egg]", price=4.99, category="chicken_starters", is_veg=False, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_roll_1786542779983.jpg", available=True),
                MenuItem(name="Chilli Chicken (Dry/Gravy)", description="Tender chicken breast tossed with green peppers, onions, and soya. [Allergens: Gluten, Soya, Egg]", price=6.00, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_chicken_1786542793770.jpg", available=True),
                MenuItem(name="Chicken 65", description="Classic spicy chicken tempered with curry leaves and green chillies. [Allergens: Gluten, Soya, Egg]", price=6.00, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_65_1786542806844.jpg", available=True),
                MenuItem(name="Andhra Chicken 65", description="Fiery Andhra-style spicy chicken bites with extra green chillies and curry leaves. [Allergens: Gluten, Soya, Egg]", price=6.00, category="chicken_starters", is_veg=False, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/andhra_spicy_65_1786865322955.jpg", available=True),
                MenuItem(name="Chilli Prawns", description="King prawns wok-seared with peppers, scallions, and soy reduction. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="prawn_specials", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_prawns_1786542836086.jpg", available=True),
                MenuItem(name="Prawns 65", description="Crispy king prawns infused with aromatic curry leaves and spices. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="prawn_specials", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/prawn_65_classic_1786865689768.jpg", available=True),

                # Fried Rice & Noodles
                MenuItem(name="Veg Fried Rice", description="High-heat wok-tossed basmati rice with finely shredded garden vegetables. [Allergens: Gluten, Soya, Celery]", price=5.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/veg_hakka_fried_rice_1786613860757.jpg", available=True),
                MenuItem(name="Veg Hakka Noodles", description="Authentic Kolkata Chinese wok noodles with crunchy shredded vegetables. [Allergens: Gluten, Soya, Celery]", price=5.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/veg_hakka_noodles_1786864935647.jpg", available=True),
                MenuItem(name="Paneer Fried Rice / Noodles", description="Wok tossed rice or noodles with spiced paneer cubes and spring onions. [Allergens: Gluten, Soya, Celery]", price=6.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/paneer_fried_rice_1786865295220.jpg", available=True),
                MenuItem(name="Szechwan Fried Rice / Noodles (Veg)", description="Fiery wok-tossed rice or noodles with homemade Sichuan pepper sauce. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/szechwan_fried_rice_1786609327627.jpg", available=True),
                MenuItem(name="Burnt Garlic Rice / Noodles (Veg)", description="Aromatic golden roasted garlic infused wok rice or noodles. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/burnt_garlic_rice_1786864831413.jpg", available=True),
                MenuItem(name="Singapore Rice / Noodles (Veg)", description="Curry-infused vermicelli style wok noodles with peppers and bean sprouts. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/singapore_curry_noodles_1786864846091.jpg", available=True),
                MenuItem(name="Egg Fried Rice / Noodles", description="Wok tossed rice with egg ribbons, spring onions, and light soy. [Allergens: Gluten, Soya, Egg]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/egg_fried_rice_1786864861119.jpg", available=True),
                MenuItem(name="Chicken Fried Rice", description="Tender diced chicken breast wok-tossed with rice and egg. [Allergens: Gluten, Soya, Egg]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_fried_rice_1786865261779.jpg", available=True),
                MenuItem(name="Chicken Hakka Noodles", description="Wok tossed noodles with shredded chicken and crunchy vegetables. [Allergens: Gluten, Soya, Egg]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/chicken_hakka_noodles_1786609308917.jpg", available=True),
                MenuItem(name="Chicken Szechwan Fried Rice / Noodles", description="Spicy Sichuan chilli chicken wok rice or noodles. [Allergens: Gluten, Soya, Egg]", price=6.50, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/szechwan_noodles_1786865275304.jpg", available=True),
                MenuItem(name="Chicken Burnt Garlic Rice / Noodles", description="Fragrant golden garlic wok rice with tender chicken. [Allergens: Gluten, Soya, Egg]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/burnt_garlic_noodles_1786865309380.jpg", available=True),
                MenuItem(name="Prawns Fried Rice / Noodles", description="Succulent king prawns wok tossed with basmati rice or noodles. [Allergens: Gluten, Soya, Egg, Shellfish]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/prawn_fried_rice_1786864907958.jpg", available=True),
                MenuItem(name="Hyderabad Style Rice / Noodles (Chicken)", description="South Indian spiced wok rice infused with curry leaf and green chilli paste. [Allergens: Gluten, Soya]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/hyderabad_chicken_rice_1786964791860.jpg", available=True),

                # Combo Specials
                MenuItem(name="Combo 1 (Rice / Noodles with Gravy)", description="Hearty street combo of your choice of Rice or Noodles paired with rich savory Manchurian gravy. [Allergens: Gluten, Soya, Egg]", price=9.00, category="combos", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/triple_schezwan_combo_1786516611209.jpg", available=True),
                MenuItem(name="Combo 2 (Rice / Noodles with 65 + Drink)", description="Full meal box featuring Rice or Noodles, spicy Chicken 65 or Paneer 65, and a chilled drink. [Allergens: Gluten, Soya, Egg]", price=10.00, category="combos", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/triple_schezwan_combo_1786516611209.jpg", available=True),
                MenuItem(name="Triple Combo (Rice & Noodles Mix with Gravy)", description="The ultimate Bombay feast: Aromatic schezwan fried rice, hakka noodles, and fiery gravy bowl. [Allergens: Gluten, Soya, Egg]", price=10.99, category="combos", is_veg=False, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/triple_schezwan_combo_1786516611209.jpg", available=True),

                # Ours Special Chips
                MenuItem(name="Plain Chips", description="Golden salted crispy potato fries. [Allergens: Gluten]", price=2.99, category="chips", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/plain_chips_1786542849444.jpg", available=True),
                MenuItem(name="Masala Chips", description="Crispy potato chips tossed with aromatic chaat masala and red chilli powder. [Allergens: Gluten]", price=3.50, category="chips", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/masala_chips_1786542864367.jpg", available=True),
                MenuItem(name="Chilli Chips", description="Crispy fries wok-tossed in dark soya sauce and fiery chilli garlic sauce. [Allergens: Gluten, Soya]", price=3.99, category="chips", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/chilli_chips_1786542878114.jpg", available=True),
                MenuItem(name="Szechwan Chips", description="Crispy chips coated with homemade spicy Sichuan pepper sauce. [Allergens: Gluten, Soya]", price=3.99, category="chips", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/szechwan_chips_1786542892121.jpg", available=True),
                MenuItem(name="Bombay Chips", description="Chef's signature crispy fries drizzled with cool spiced mint yogurt and tangy chutneys. [Allergens: Gluten, Dairy]", price=4.50, category="chips", is_veg=True, is_spicy=False, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_chips_1786542907959.jpg", available=True)
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
        cat_lower = category.strip().lower()
        if cat_lower in ["nonveg_starters", "non_veg_starters", "chicken_starters"]:
            query = query.filter(MenuItem.category.in_(["nonveg_starters", "chicken_starters", "prawn_specials"]))
        elif cat_lower in ["combos", "combo_special", "chef_signatures"]:
            query = query.filter(MenuItem.category.in_(["combos", "chef_signatures"]))
        elif cat_lower in ["rice_noodles", "noodles", "rice"]:
            query = query.filter(MenuItem.category.in_(["rice_noodles", "noodles", "rice"]))
        else:
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
