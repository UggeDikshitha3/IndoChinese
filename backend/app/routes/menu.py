import json
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import MenuItem as DBMenuItem
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

def safe_json_loads(val: Any, default: Any = None):
    if val is None:
        return default if default is not None else []
    if isinstance(val, (list, dict)):
        return val
    if isinstance(val, str):
        val_clean = val.strip()
        if not val_clean:
            return default if default is not None else []
        try:
            return json.loads(val_clean)
        except Exception:
            return default if default is not None else []
    return default if default is not None else []

def ensure_default_menu(db: Session):
    try:
        raw_items = [
            {
                "id": "soup-manchow-veg",
                "name": "Manchow Soup (Veg)",
                "category": "soups",
                "price": 4.00,
                "image_url": "/src/assets/images/bombay_manchow_soup_1786516536756.jpg",
                "description": "Authentic dark soya broth infused with garlic, coriander, ginger, seasonal vegetables and topped with crispy fried noodles.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-manchow-chicken",
                "name": "Manchow Soup (Chicken)",
                "category": "soups",
                "price": 4.99,
                "image_url": "/src/assets/images/bombay_manchow_soup_1786516536756.jpg",
                "description": "Classic dark soya broth with shredded chicken breast, garlic, and fresh green chillies topped with crunchy fried noodles.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-manchow-prawns",
                "name": "Manchow Soup (Prawns)",
                "category": "soups",
                "price": 5.99,
                "image_url": "/src/assets/images/manchow_prawns_soup_1786615681191.jpg",
                "description": "Rich umami soya broth simmered with succulent king prawns, fresh herbs, and served with crispy noodles garnish.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "Seafood Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "soup-hotnsour-veg",
                "name": "Hot-n-Sour Soup (Veg)",
                "category": "soups",
                "price": 4.00,
                "image_url": "/src/assets/images/hot_sour_soup_1786609347778.jpg",
                "description": "Tangy and fiery Indo-Chinese soup loaded with wood ear mushrooms, tofu cubes, bamboo shoots, and cracked black pepper.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-hotnsour-chicken",
                "name": "Hot-n-Sour Soup (Chicken)",
                "category": "soups",
                "price": 4.99,
                "image_url": "/src/assets/images/hot_sour_soup_1786609347778.jpg",
                "description": "Fiery and sour broth with tender shredded chicken, red chillies, and crushed white pepper.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-hotnsour-prawns",
                "name": "Hot-n-Sour Soup (Prawns)",
                "category": "soups",
                "price": 5.99,
                "image_url": "/src/assets/images/hot_sour_prawns_soup_1786615698187.jpg",
                "description": "Boldly spiced sour broth packed with plump prawns, chopped scallions, and red vinegar zest.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetnsour-veg",
                "name": "Sweet-n-Sour Soup (Veg)",
                "category": "soups",
                "price": 4.00,
                "image_url": "/src/assets/images/sweet_sour_soup_1786865648230.jpg",
                "description": "Balanced sweet pineapple juice and tangy rice vinegar reduction with crunchy garden vegetables.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetnsour-chicken",
                "name": "Sweet-n-Sour Soup (Chicken)",
                "category": "soups",
                "price": 4.99,
                "image_url": "/src/assets/images/sweet_sour_soup_1786865648230.jpg",
                "description": "Delicate sweet and tangy broth featuring diced chicken breast and diced bell peppers.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetnsour-prawns",
                "name": "Sweet-n-Sour Soup (Prawns)",
                "category": "soups",
                "price": 5.99,
                "image_url": "/src/assets/images/sweet_sour_soup_1786865648230.jpg",
                "description": "Fresh king prawns in a fragrant sweet-sour tomato glaze broth with scallions.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetcorn-veg",
                "name": "Sweet Corn Soup (Veg)",
                "category": "soups",
                "price": 4.00,
                "image_url": "/src/assets/images/sweet_corn_soup_1786609365927.jpg",
                "description": "Comforting velvety golden sweet corn cream broth with finely chopped carrots and asparagus tips.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetcorn-chicken",
                "name": "Sweet Corn Soup (Chicken)",
                "category": "soups",
                "price": 4.99,
                "image_url": "/src/assets/images/sweet_corn_soup_1786609365927.jpg",
                "description": "Silky creamed sweet corn soup loaded with tender shredded chicken and egg drop ribbons.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "soup-sweetcorn-prawns",
                "name": "Sweet Corn Soup (Prawns)",
                "category": "soups",
                "price": 5.99,
                "image_url": "/src/assets/images/sweet_corn_prawns_soup_1786873008746.jpg",
                "description": "Lush sweet corn and egg blossom chowder with juicy whole king prawns and sesame drizzle.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "soup-tomyum-veg",
                "name": "Tom Yum Soup (Soya - Veg)",
                "category": "soups",
                "price": 4.00,
                "image_url": "/src/assets/images/tom_yum_veg_soup_1786865225455.jpg",
                "description": "Spicy aromatic broth with lemongrass, kaffir lime leaf, galangal, mushrooms, and soya sauce.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-tomyum-chicken",
                "name": "Tom Yum Soup (Soya - Chicken)",
                "category": "soups",
                "price": 4.99,
                "image_url": "/src/assets/images/tom_yum_chicken_soup_1786610012394.jpg",
                "description": "Zesty Thai-Bombay fusion soup with tender chicken pieces, fresh herbs, lime, and red chilli oil.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "soup-tomyum-prawns",
                "name": "Tom Yum Soup (Soya - Prawns)",
                "category": "soups",
                "price": 5.99,
                "image_url": "/src/assets/images/tom_yum_chicken_soup_1786610012394.jpg",
                "description": "Authentic fragrant spicy citrus herbal broth brimming with king prawns and button mushrooms.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "momo-veg-steam",
                "name": "Veg Dumpling (Steam)",
                "category": "momos",
                "price": 5.99,
                "image_url": "/src/assets/images/steamed_dumplings_momo_1786520824895.jpg",
                "description": "Delicate steamed dumplings stuffed with finely minced vegetables, cabbage, paneer, and ginger served with spicy red chutney.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "momo-veg-chilli",
                "name": "Veg Dumpling (Chilli)",
                "category": "momos",
                "price": 6.50,
                "image_url": "/src/assets/images/chilli_wok_dumplings_1786520842041.jpg",
                "description": "Pan-fried vegetable dumplings tossed in a sizzling fiery wok with green chillies, garlic, and dark soy.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "momo-veg-fried",
                "name": "Veg Dumpling (Fried)",
                "category": "momos",
                "price": 6.50,
                "image_url": "/src/assets/images/crispy_fried_momos_1786521404691.jpg",
                "description": "Golden crisp deep-fried dumplings served with house special spicy garlic dip.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "momo-chicken-steam",
                "name": "Chicken Dumpling (Steam)",
                "category": "momos",
                "price": 6.50,
                "image_url": "/src/assets/images/chicken_momos_steamed_1786610033977.jpg",
                "description": "Juicy chicken mince seasoned with spring onions, coriander, and Asian aromatics wrapped in thin handmade pastry.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "momo-chicken-chilli",
                "name": "Chicken Dumpling (Chilli)",
                "category": "momos",
                "price": 6.99,
                "image_url": "/src/assets/images/chicken_momos_chilli_1786610048331.jpg",
                "description": "Steamed chicken momos wok-tossed with capsicum, onion pearls, and Bombay chilli paste.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "momo-chicken-fried",
                "name": "Chicken Dumpling (Fried)",
                "category": "momos",
                "price": 6.99,
                "image_url": "/src/assets/images/chicken_momos_fried_1786610073286.jpg",
                "description": "Crispy golden fried chicken dumplings served with fiery Sichuan dipping sauce.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-spring-rolls",
                "name": "Veg Spring Rolls",
                "category": "veg_starters",
                "price": 3.99,
                "image_url": "/src/assets/images/veg_spring_rolls_1786542679969.jpg",
                "description": "Golden crisp pastry sheets filled with glass noodles, shredded cabbage, carrots, and beansprouts served with sweet chilli dip.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "Street Favorite",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-manchurian-veg",
                "name": "Manchurian (Veg - Dry/Gravy)",
                "category": "veg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/veg_manchurian_1786542694203.jpg",
                "description": "Crispy vegetable balls wok-glazed in garlic, ginger, green chillies, and dark soya Manchurian gravy.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-manchurian-paneer",
                "name": "Manchurian (Paneer - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/paneer_manchurian_1786542710989.jpg",
                "description": "Golden paneer cubes tossed in aromatic spiced ginger-garlic Manchurian sauce with spring onions.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[]"
            },
            {
                "id": "vstar-manchurian-gobi",
                "name": "Manchurian (Gobi - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/gobi_manchurian_1786865605343.jpg",
                "description": "Crisp cauliflower florets wok-tossed in signature Bombay Manchurian sauce with chopped garlic and coriander.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-manchurian-tofu",
                "name": "Manchurian (Tofu - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/tofu_manchurian_1786865617999.jpg",
                "description": "Crisp organic tofu cubes wok-glazed in tangy dark soy, ginger, and fresh green chilli sauce.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-manchurian-mushroom",
                "name": "Manchurian (Mushroom - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/mushroom_manchurian_1786610712161.jpg",
                "description": "Battered button mushrooms stir-fried with ginger, garlic, and rich soya coriander reduction.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-szechwan-veg",
                "name": "Szechwan (Veg - Dry/Gravy)",
                "category": "veg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/paneer_gobi_chilli_1786516594932.jpg",
                "description": "Garden vegetables tossed in hot Bombay Szechwan sauce made with dry red chillies and garlic.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-szechwan-paneer",
                "name": "Szechwan (Paneer - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/szechwan_paneer_1786542753122.jpg",
                "description": "Fresh cottage cheese cubes cooked in spicy Szechwan sauce with diced peppers and onions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[]"
            },
            {
                "id": "vstar-szechwan-gobi",
                "name": "Szechwan (Gobi - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_gobi_1786542738688.jpg",
                "description": "Crunchy cauliflower florets tossed in fiery home-blend Szechwan peppercorn paste.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-szechwan-tofu",
                "name": "Szechwan (Tofu - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_tofu_dry_1786865242576.jpg",
                "description": "Wok-seared tofu cubes in hot red pepper Szechwan paste with bell peppers.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-szechwan-mushroom",
                "name": "Szechwan (Mushroom - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_mushroom_1786610730124.jpg",
                "description": "Whole button mushrooms sautéed in blazing Szechwan chilli oil with diced spring onions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-chilli-veg",
                "name": "Chilli (Veg - Dry/Gravy)",
                "category": "veg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/paneer_gobi_chilli_1786516594932.jpg",
                "description": "Assorted vegetables wok-fried with sliced green chillies, garlic cloves, and dark soy.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-chilli-paneer",
                "name": "Chilli (Paneer - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_paneer_1786542725460.jpg",
                "description": "Crispy paneer cubes stir-fried with green chillies, bell peppers, onions, and spicy soya glaze.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Signature",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[]"
            },
            {
                "id": "vstar-chilli-gobi",
                "name": "Chilli (Gobi - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_gobi_1786542738688.jpg",
                "description": "Crispy battered gobi florets tossed with fresh green chillies and light soya sauce.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-chilli-tofu",
                "name": "Chilli (Tofu - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_tofu_dry_1786865242576.jpg",
                "description": "Crispy golden tofu cubes tossed with crunchy capsicum, sliced chillies, and seasoning.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-chilli-mushroom",
                "name": "Chilli (Mushroom - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_mushroom_1786610730124.jpg",
                "description": "Fresh button mushrooms tossed with green chillies, spring onions, and oriental seasonings.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-65-veg",
                "name": "65 (Veg)",
                "category": "veg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/paneer_65_1786542764483.jpg",
                "description": "Deep-fried seasoned vegetable dumplings tempered with curry leaves, mustard seeds, and yogurt spice.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-65-paneer",
                "name": "65 (Paneer)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/paneer_65_1786542764483.jpg",
                "description": "Marinated paneer batons fried until crisp and tempered with green chillies, curry leaves, and spices.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[]"
            },
            {
                "id": "vstar-65-gobi",
                "name": "65 (Gobi)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/gobi_sixty_five_1786864920541.jpg",
                "description": "Cauliflower florets marinated in spiced batter, fried crispy, and finished with curry leaf tadka.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-65-tofu",
                "name": "65 (Tofu)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/chilli_tofu_dry_1786865242576.jpg",
                "description": "Golden tofu bites tempered in Hyderabadi 65 masala with curry leaves and green chillies.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-65-mushroom",
                "name": "65 (Mushroom)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/mushroom_65_1786610746598.jpg",
                "description": "Crispy fried mushrooms tossed in red 65 spice mix, garlic, and fresh curry leaf tempering.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-hotgarlic-veg",
                "name": "Hot Garlic (Veg - Dry/Gravy)",
                "category": "veg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/hot_garlic_veg_1786964808786.jpg",
                "description": "Seasonal vegetables simmered in roasted red garlic chilli sauce with crushed peppercorns.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-hotgarlic-paneer",
                "name": "Hot Garlic (Paneer - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/hot_garlic_paneer_1786964854908.jpg",
                "description": "Paneer cubes tossed in an intense garlic sauce loaded with red chillies and scallions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[]"
            },
            {
                "id": "vstar-hotgarlic-gobi",
                "name": "Hot Garlic (Gobi - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/hot_garlic_gobi_1786964822117.jpg",
                "description": "Crispy cauliflower florets tossed in fiery slow-cooked garlic sauce.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-hotgarlic-tofu",
                "name": "Hot Garlic (Tofu - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/hot_garlic_tofu_1786964867817.jpg",
                "description": "Sautéed tofu cubes glazed in sharp roasted garlic red sauce with spring onion greens.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "vstar-hotgarlic-mushroom",
                "name": "Hot Garlic (Mushroom - Dry/Gravy)",
                "category": "veg_starters",
                "price": 5.50,
                "image_url": "/src/assets/images/hot_garlic_mushroom_1786964837820.jpg",
                "description": "Tender whole button mushrooms stir-fried in rich spicy garlic glaze.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-chicken-lollipop-dry",
                "name": "Chicken Lollipop (Dry)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/chicken_lollipop_dry_1786864878519.jpg",
                "description": "Iconic frenched chicken winglets marinated in Bombay spices, fried crispy and served with Schezwan dip.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-chicken-lollipop-sauted",
                "name": "Chicken Lollipop (Sauted)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/chicken_lollipop_sauced_1786516573910.jpg",
                "description": "Crispy chicken lollipops wok-tossed in rich sweet, spicy, and garlicky Manchurian sauce.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Best Seller",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-chicken-rolls",
                "name": "Chicken Rolls",
                "category": "nonveg_starters",
                "price": 4.99,
                "image_url": "/src/assets/images/chicken_roll_1786542779983.jpg",
                "description": "Crisp rolls packed with seasoned minced chicken breast, garlic, and oriental spices.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-manchurian-chicken",
                "name": "Manchurian (Chicken - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/chicken_manchurian_1786864894429.jpg",
                "description": "Diced chicken wok-tossed with ginger, garlic, green chillies, and dark coriander soya gravy.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-manchurian-prawns",
                "name": "Manchurian (Prawns - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/prawn_manchurian_1786865589831.jpg",
                "description": "Juicy king prawns cooked in savoury ginger-garlic Manchurian sauce with scallions.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-szechwan-chicken",
                "name": "Szechwan (Chicken - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/chilli_chicken_1786542793770.jpg",
                "description": "Succulent chicken chunks tossed in fiery red Szechwan paste with capsicum and onions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-szechwan-prawns",
                "name": "Szechwan (Prawns - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/chilli_prawns_1786542836086.jpg",
                "description": "King prawns wok-glazed in bold Sichuan peppercorn sauce with red bell peppers.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-chilli-chicken",
                "name": "Chilli (Chicken - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/chilli_chicken_1786542793770.jpg",
                "description": "Tender chicken pieces tossed with slit green chillies, bell peppers, onions, and dark soya glaze.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Signature",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-chilli-prawns",
                "name": "Chilli (Prawns - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/chilli_prawns_1786542836086.jpg",
                "description": "Plump king prawns stir-fried in high flame with green chillies, garlic, and oriental soya.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-65-chicken",
                "name": "65 (Chicken)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/chicken_65_1786542806844.jpg",
                "description": "Crisp boneless chicken bites tempered in red chilli masala, curry leaves, and mustard aromatics.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-65-prawns",
                "name": "65 (Prawns)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/prawn_65_classic_1786865689768.jpg",
                "description": "Deep-fried marinated king prawns tossed with tempered curry leaves, green chillies, and southern spices.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-hotgarlic-chicken",
                "name": "Hot Garlic (Chicken - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/hot_garlic_chicken_1786872610686.jpg",
                "description": "Juicy chicken pieces tossed in fiery slow-roasted garlic sauce with crushed red chillies.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-hotgarlic-prawns",
                "name": "Hot Garlic (Prawns - Dry/Gravy)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/hot_garlic_prawns_1786865700810.jpg",
                "description": "Succulent king prawns tossed in spicy roasted garlic paste with scallions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-andhra65-chicken",
                "name": "Andhra 65 (Chicken)",
                "category": "nonveg_starters",
                "price": 6.00,
                "image_url": "/src/assets/images/andhra_spicy_65_1786865322955.jpg",
                "description": "Authentic regional spicy marinated chicken fried and tossed with Guntur red chillies and curry leaves.",
                "is_spicy": True,
                "spice_level": 3,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[]"
            },
            {
                "id": "nvstar-andhra65-prawns",
                "name": "Andhra 65 (Prawns)",
                "category": "nonveg_starters",
                "price": 6.50,
                "image_url": "/src/assets/images/andhra_prawn_65_1786865574041.jpg",
                "description": "Fiery Andhra-style spiced king prawns tempered with toasted spices and crispy curry leaves.",
                "is_spicy": True,
                "spice_level": 3,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[]"
            },
            {
                "id": "rice-veg-fried",
                "name": "Veg Fried Rice / Noodles",
                "category": "rice_noodles",
                "price": 5.00,
                "image_url": "/src/assets/images/veg_hakka_fried_rice_1786613860757.jpg",
                "description": "High-heat wok-tossed basmati rice or thin Hakka noodles with crunchy julienned vegetables and light soya seasoning.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-manchurian-veg",
                "name": "Manchurian Fried Rice / Noodles (Veg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/burnt_garlic_manchurian_rice_1786865954823.jpg",
                "description": "Wok-tossed rice or noodles infused with crushed veg Manchurian dumplings and dark soy gravy notes.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-paneer-veg",
                "name": "Paneer Fried Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/paneer_fried_rice_1786865295220.jpg",
                "description": "Fragrant wok rice or noodles tossed with spiced golden paneer cubes and spring onions.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-tofu-veg",
                "name": "Tofu Fried Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/burnt_garlic_tofu_rice_1786865942184.jpg",
                "description": "Stir-fried rice or noodles with crisp tofu cubes, carrots, and cabbage in savory seasonings.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-mushroom-veg",
                "name": "Mushroom Fried Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/burnt_garlic_mushroom_rice_1786865904696.jpg",
                "description": "Savory wok rice or noodles with sliced fresh mushrooms, green peas, and scallions.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-veg",
                "name": "Szechwan Fried Rice / Noodles (Veg)",
                "category": "rice_noodles",
                "price": 5.50,
                "image_url": "/src/assets/images/szechwan_fried_rice_1786609327627.jpg",
                "description": "Fiery spicy rice or noodles wok-tossed in homemade red Szechwan sauce with diced vegetables.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Spicy",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-manchurian",
                "name": "Szechwan Manchurian Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_manchurian_rice_1786865954823.jpg",
                "description": "Szechwan spiced rice or noodles tossed with seasoned vegetable Manchurian balls.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-paneer",
                "name": "Szechwan Paneer Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_paneer_rice_1786865926634.jpg",
                "description": "Spicy Szechwan wok rice or noodles packed with paneer cubes and red chillies.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-tofu",
                "name": "Szechwan Tofu Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_tofu_rice_1786865942184.jpg",
                "description": "Tofu cubes tossed with spicy Sichuan peppercorn sauce and wok rice or noodles.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-mushroom",
                "name": "Szechwan Mushroom Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_mushroom_rice_1786865904696.jpg",
                "description": "Fresh mushrooms wok-fried with fiery Szechwan paste and garden vegetables.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-veg",
                "name": "Burnt Garlic Rice / Noodles (Veg)",
                "category": "rice_noodles",
                "price": 5.50,
                "image_url": "/src/assets/images/burnt_garlic_rice_1786864831413.jpg",
                "description": "Aromatic rice or noodles infused with golden toasted garlic crisps, spring onions, and cracked black pepper.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-manchurian",
                "name": "Burnt Garlic Manchurian Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_manchurian_rice_1786865954823.jpg",
                "description": "Deep roasted garlic rice or noodles tossed with crispy Manchurian bites.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-paneer",
                "name": "Burnt Garlic Paneer Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_paneer_rice_1786865926634.jpg",
                "description": "Golden garlic rice or noodles stir-fried with paneer batons and scallions.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-tofu",
                "name": "Burnt Garlic Tofu Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_tofu_rice_1786865942184.jpg",
                "description": "Toasted garlic wok rice or noodles tossed with organic tofu cubes.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-mushroom",
                "name": "Burnt Garlic Mushroom Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_mushroom_rice_1786865904696.jpg",
                "description": "Toasted golden garlic aroma blended with fresh button mushrooms in wok rice or noodles.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-veg",
                "name": "Singapore Rice / Noodles (Veg)",
                "category": "rice_noodles",
                "price": 5.50,
                "image_url": "/src/assets/images/singapore_fried_rice_1786865981318.jpg",
                "description": "Aromatic curry-scented stir-fry with yellow madras spices, bell peppers, carrots, and beans.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-manchurian",
                "name": "Singapore Manchurian Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_manchurian_rice_1786865954823.jpg",
                "description": "Curry-flavoured Singapore rice or noodles tossed with vegetable Manchurian balls.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-paneer",
                "name": "Singapore Paneer Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_paneer_rice_1786865926634.jpg",
                "description": "Yellow curry spiced rice or noodles tossed with soft paneer cubes and peppers.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Dairy\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-tofu",
                "name": "Singapore Tofu Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_tofu_rice_1786865942184.jpg",
                "description": "Singapore-style spiced wok rice or noodles with crisp tofu and spring onion.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-mushroom",
                "name": "Singapore Mushroom Rice / Noodles",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_mushroom_rice_1786865904696.jpg",
                "description": "Fragrant curry spiced rice or noodles stir-fried with fresh button mushrooms.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-fried-egg",
                "name": "Fried Rice / Noodles (Egg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/egg_fried_rice_1786864861119.jpg",
                "description": "Wok-scrambled farm-fresh eggs tossed with fluffy basmati rice or noodles, spring onions, and light soy.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-fried-chicken",
                "name": "Fried Rice / Noodles (Chicken)",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/chicken_fried_rice_1786865261779.jpg",
                "description": "High-heat wok-tossed rice or noodles with tender shredded chicken breast, scrambled egg, and garden veg.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-fried-prawns",
                "name": "Fried Rice / Noodles (Prawns)",
                "category": "rice_noodles",
                "price": 7.00,
                "image_url": "/src/assets/images/prawn_fried_rice_1786864907958.jpg",
                "description": "Plump king prawns stir-fried in smoking wok with fluffy basmati rice or Hakka noodles and scallions.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": False,
                "badge": "Seafood Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-egg",
                "name": "Szechwan Fried Rice / Noodles (Egg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/egg_fried_rice_1786864861119.jpg",
                "description": "Spicy Szechwan spiced rice or noodles with scrambled egg ribbons and bell peppers.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-chicken",
                "name": "Szechwan Fried Rice / Noodles (Chicken)",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/chicken_hakka_noodles_1786609308917.jpg",
                "description": "Fiery Szechwan wok rice or noodles tossed with tender chicken chunks, garlic, and red chillies.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Spicy",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-szechwan-prawns",
                "name": "Szechwan Fried Rice / Noodles (Prawns)",
                "category": "rice_noodles",
                "price": 7.00,
                "image_url": "/src/assets/images/prawn_hakka_noodles_1786865634448.jpg",
                "description": "Juicy king prawns cooked in blazing homemade Szechwan sauce with wok-tossed noodles or rice.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-egg",
                "name": "Burnt Garlic Rice / Noodles (Egg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/egg_fried_rice_1786864861119.jpg",
                "description": "Golden crispy garlic chips tossed with scrambled eggs and aromatic rice or noodles.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-chicken",
                "name": "Burnt Garlic Rice / Noodles (Chicken)",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/burnt_garlic_noodles_1786865309380.jpg",
                "description": "Fragrant roasted garlic rice or noodles packed with diced chicken and fresh herbs.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-burntgarlic-prawns",
                "name": "Burnt Garlic Rice / Noodles (Prawns)",
                "category": "rice_noodles",
                "price": 7.00,
                "image_url": "/src/assets/images/burnt_garlic_prawns_rice_1786865968949.jpg",
                "description": "Deep-toasted garlic wok rice or noodles stir-fried with succulent king prawns.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-egg",
                "name": "Singapore Rice / Noodles (Egg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/singapore_fried_rice_1786865981318.jpg",
                "description": "Yellow curry spiced rice or noodles tossed with egg shreds and spring onions.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-chicken",
                "name": "Singapore Rice / Noodles (Chicken)",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/singapore_curry_noodles_1786864846091.jpg",
                "description": "Fragrant curry infused wok noodles or rice with tender chicken, peppers, and beansprouts.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-singapore-prawns",
                "name": "Singapore Rice / Noodles (Prawns)",
                "category": "rice_noodles",
                "price": 7.00,
                "image_url": "/src/assets/images/burnt_garlic_prawns_rice_1786865968949.jpg",
                "description": "King prawns tossed in Singapore curry seasonings with wok-tossed rice or noodles.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-hyderabad-egg",
                "name": "Fried Rice / Noodles - Hyderabad Style (Egg)",
                "category": "rice_noodles",
                "price": 6.00,
                "image_url": "/src/assets/images/hyderabad_egg_rice_1786964773898.jpg",
                "description": "Southern-style spicy stir-fry with fragrant curry leaves, green chillies, mustard seeds, and scrambled eggs.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-hyderabad-chicken",
                "name": "Fried Rice / Noodles - Hyderabad Style (Chicken)",
                "category": "rice_noodles",
                "price": 6.50,
                "image_url": "/src/assets/images/hyderabad_chicken_rice_1786964791860.jpg",
                "description": "Spicy Hyderabadi seasoned chicken wok-fried with rice or noodles, tempered curry leaves, and green chillies.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "Signature",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "rice-hyderabad-prawns",
                "name": "Fried Rice / Noodles - Hyderabad Style (Prawns)",
                "category": "rice_noodles",
                "price": 7.00,
                "image_url": "/src/assets/images/hyderabad_spicy_rice_1786865662834.jpg",
                "description": "King prawns tossed in fiery Hyderabadi spice blend with curry leaves and green chilli aromatics.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": False,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\", \"Shellfish\"]",
                "options": "[{\"id\": \"opt-base-rice\", \"name\": \"Fried Rice Style\", \"priceModifier\": 0}, {\"id\": \"opt-base-noodles\", \"name\": \"Hakka Noodles Style\", \"priceModifier\": 0}]"
            },
            {
                "id": "combo-1",
                "name": "COMBO 1 (Rice / Noodles with Gravy)",
                "category": "combos",
                "price": 9.00,
                "image_url": "/src/assets/images/triple_schezwan_combo_1786516611209.jpg",
                "description": "Generous single-portion meal box: Your choice of Veg or Chicken Fried Rice / Hakka Noodles served with a rich side portion of Manchurian or Chilli Gravy.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "Value Deal",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"c1-base-rice\", \"name\": \"Veg Fried Rice base\", \"priceModifier\": 0}, {\"id\": \"c1-base-noodles\", \"name\": \"Veg Noodles base\", \"priceModifier\": 0}, {\"id\": \"c1-base-chk-rice\", \"name\": \"Chicken Fried Rice base (+\u00a31.00)\", \"priceModifier\": 1.0}, {\"id\": \"c1-base-chk-noodles\", \"name\": \"Chicken Noodles base (+\u00a31.00)\", \"priceModifier\": 1.0}]"
            },
            {
                "id": "combo-2",
                "name": "COMBO 2 (Rice / Noodles with 65 + Drink)",
                "category": "combos",
                "price": 10.00,
                "image_url": "/src/assets/images/triple_schezwan_combo_1786516611209.jpg",
                "description": "Complete street meal box: Fried Rice or Hakka Noodles accompanied by crispy Chicken 65 or Paneer 65, and a chilled can of soft drink.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Best Seller",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"c2-paneer-65\", \"name\": \"With Paneer 65 (Veg)\", \"priceModifier\": 0}, {\"id\": \"c2-chicken-65\", \"name\": \"With Chicken 65\", \"priceModifier\": 0}]"
            },
            {
                "id": "combo-triple",
                "name": "TRIPLE COMBO (Rice and Noodles Mix and Gravy)",
                "category": "combos",
                "price": 10.99,
                "image_url": "/src/assets/images/triple_schezwan_combo_1786516611209.jpg",
                "description": "The Ultimate Bombay Street Masterpiece: Fragrant Schezwan Fried Rice and Hakka Noodles stir-fried together in high wok heat, served with rich Schezwan Gravy, Fried Egg / Paneer, and crispy fried noodles.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Bombay Legend",
                "allergens": "[\"Gluten\", \"Soya\", \"Egg\"]",
                "options": "[{\"id\": \"c3-veg-triple\", \"name\": \"Vegetarian Triple Combo\", \"priceModifier\": 0}, {\"id\": \"c3-chk-triple\", \"name\": \"Chicken & Egg Triple Combo (+\u00a31.00)\", \"priceModifier\": 1.0}]"
            },
            {
                "id": "chip-plain",
                "name": "Plain Chips",
                "category": "chips",
                "price": 2.99,
                "image_url": "/src/assets/images/plain_chips_1786542849444.jpg",
                "description": "Crispy golden thick-cut potato chips freshly fried and seasoned with sea salt.",
                "is_spicy": False,
                "spice_level": 0,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\"]",
                "options": "[]"
            },
            {
                "id": "chip-masala",
                "name": "Masala Chips",
                "category": "chips",
                "price": 3.50,
                "image_url": "/src/assets/images/masala_chips_1786542864367.jpg",
                "description": "Crispy potato chips dusted in our secret house chaat masala, roasted cumin, and amchur spice mix.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\"]",
                "options": "[]"
            },
            {
                "id": "chip-chilli",
                "name": "Chilli Chips",
                "category": "chips",
                "price": 3.99,
                "image_url": "/src/assets/images/chilli_chips_1786542878114.jpg",
                "description": "Golden potato chips tossed in high-heat wok with fresh garlic, green chillies, and dark soya chilli sauce.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "Popular",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "chip-szechwan",
                "name": "Szechwan Chips",
                "category": "chips",
                "price": 3.99,
                "image_url": "/src/assets/images/szechwan_chips_1786542892121.jpg",
                "description": "Crisp potato fries coated in fiery homemade Szechwan sauce with crushed red chillies and spring onions.",
                "is_spicy": True,
                "spice_level": 2,
                "is_veg": True,
                "badge": "",
                "allergens": "[\"Gluten\", \"Soya\"]",
                "options": "[]"
            },
            {
                "id": "chip-bombay",
                "name": "Bombay Chips",
                "category": "chips",
                "price": 4.50,
                "image_url": "/src/assets/images/bombay_chips_1786542907959.jpg",
                "description": "House signature spiced potato chips served with cooling Bombay mint yogurt dip and spiced onion rings.",
                "is_spicy": True,
                "spice_level": 1,
                "is_veg": True,
                "badge": "Chef Special",
                "allergens": "[\"Gluten\", \"Dairy\"]",
                "options": "[]"
            },
        ]
        
        canonical_map = {item['name'].strip().lower(): item for item in raw_items}
        
        all_db_items = db.query(DBMenuItem).all()
        seen_names = set()
        
        for db_item in all_db_items:
            norm_name = db_item.name.strip().lower()
            if norm_name in seen_names:
                db.delete(db_item)
            elif norm_name in canonical_map:
                c_item = canonical_map[norm_name]
                db_item.category = c_item['category']
                db_item.price = c_item['price']
                db_item.image_url = c_item['image_url']
                db_item.description = c_item['description']
                db_item.is_spicy = c_item['is_spicy']
                db_item.spice_level = c_item['spice_level']
                db_item.is_veg = c_item['is_veg']
                db_item.badge = c_item['badge']
                db_item.allergens = c_item['allergens']
                db_item.options = c_item['options']
                seen_names.add(norm_name)
            else:
                db.delete(db_item)
        
        for norm_name, c_item in canonical_map.items():
            if norm_name not in seen_names:
                new_db_item = DBMenuItem(
                    id=c_item['id'],
                    name=c_item['name'],
                    category=c_item['category'],
                    price=c_item['price'],
                    image_url=c_item['image_url'],
                    description=c_item['description'],
                    is_spicy=c_item['is_spicy'],
                    spice_level=c_item['spice_level'],
                    is_veg=c_item['is_veg'],
                    badge=c_item['badge'],
                    allergens=c_item['allergens'],
                    options=c_item['options'],
                    is_available=True
                )
                db.add(new_db_item)
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Menu sync notice: {e}")

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("")
def get_menu(category: str = None, db: Session = Depends(get_db)):
    try:
        ensure_default_menu(db)
        
        query = db.query(DBMenuItem).filter(DBMenuItem.is_available == True)
        if category:
            query = query.filter(DBMenuItem.category == category)
        
        items = query.all()
        
        seen_ids = set()
        seen_names = set()
        unique_items = []
        
        for item in items:
            norm_name = (item.name or "").strip().lower()
            if item.id not in seen_ids and norm_name not in seen_names:
                seen_ids.add(item.id)
                seen_names.add(norm_name)
                unique_items.append({
                    "id": item.id,
                    "name": item.name,
                    "category": item.category,
                    "price": float(item.price) if item.price is not None else 0.0,
                    "image": item.image_url,
                    "description": item.description or "",
                    "isSpicy": bool(item.is_spicy),
                    "spiceLevel": int(item.spice_level) if item.spice_level is not None else 1,
                    "isVeg": bool(item.is_veg),
                    "badge": item.badge if item.badge else None,
                    "isChefSpecial": item.badge == "Chef Special",
                    "isPopular": item.badge == "Popular",
                    "allergens": safe_json_loads(item.allergens, []),
                    "options": safe_json_loads(item.options, []),
                    "available": bool(item.is_available),
                    "isAvailable": bool(item.is_available)
                })
                
        if len(unique_items) > 0:
            return unique_items
    except Exception as e:
        print(f"Error fetching menu from DB: {e}")
    
    # Fallback to in-memory menu items
    return [
        {
            "id": "soup-manchow-veg",
            "name": "Manchow Soup (Veg)",
            "category": "soups",
            "price": 4.00,
            "image": "/src/assets/images/bombay_manchow_soup_1786516536756.jpg",
            "description": "Authentic dark soya broth infused with garlic, coriander, ginger, seasonal vegetables and topped with crispy fried noodles.",
            "isSpicy": True,
            "spiceLevel": 1,
            "isVeg": True,
            "badge": "Popular",
            "isChefSpecial": False,
            "isPopular": True,
            "allergens": ["Gluten", "Soya"],
            "options": [],
            "available": True,
            "isAvailable": True
        }
    ]

@router.post("", response_model=MenuItemResponse)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db)):
    new_item = DBMenuItem(
        name=item_in.name,
        category=item_in.category,
        price=item_in.price,
        image_url=item_in.image,
        description=item_in.description or "",
        is_spicy=item_in.isSpicy,
        spice_level=item_in.spiceLevel,
        is_veg=item_in.isVeg,
        badge=item_in.badge,
        allergens=json.dumps(item_in.allergens) if item_in.allergens else "[]",
        options=json.dumps(item_in.options) if item_in.options else "[]",
        is_available=item_in.isAvailable
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return {
        "id": new_item.id,
        "name": new_item.name,
        "category": new_item.category,
        "price": float(new_item.price),
        "image": new_item.image_url,
        "description": new_item.description,
        "isSpicy": new_item.is_spicy,
        "spiceLevel": new_item.spice_level,
        "isVeg": new_item.is_veg,
        "badge": new_item.badge if new_item.badge else None,
        "allergens": safe_json_loads(new_item.allergens, []),
        "options": safe_json_loads(new_item.options, []),
        "isAvailable": new_item.is_available
    }

@router.put("/{id}", response_model=MenuItemResponse)
def update_menu_item(id: str, item_in: MenuItemUpdate, db: Session = Depends(get_db)):
    item = db.query(DBMenuItem).filter(DBMenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    update_data = item_in.model_dump(exclude_unset=True)
    if "isSpicy" in update_data:
        item.is_spicy = update_data.pop("isSpicy")
    if "spiceLevel" in update_data:
        item.spice_level = update_data.pop("spiceLevel")
    if "isVeg" in update_data:
        item.is_veg = update_data.pop("isVeg")
    if "isAvailable" in update_data:
        item.is_available = update_data.pop("isAvailable")
    if "image" in update_data:
        item.image_url = update_data.pop("image")
    if "allergens" in update_data:
        item.allergens = json.dumps(update_data.pop("allergens"))
    if "options" in update_data:
        item.options = json.dumps(update_data.pop("options"))

    for key, value in update_data.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return {
        "id": item.id,
        "name": item.name,
        "category": item.category,
        "price": float(item.price),
        "image": item.image_url,
        "description": item.description,
        "isSpicy": item.is_spicy,
        "spiceLevel": item.spice_level,
        "isVeg": item.is_veg,
        "badge": item.badge if item.badge else None,
        "allergens": safe_json_loads(item.allergens, []),
        "options": safe_json_loads(item.options, []),
        "isAvailable": item.is_available
    }

@router.delete("/{id}")
def delete_menu_item(id: str, db: Session = Depends(get_db)):
    item = db.query(DBMenuItem).filter(DBMenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Menu item deleted successfully"}
