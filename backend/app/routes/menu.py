from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import MenuItem
from app.schemas.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse

def ensure_default_menu(db: Session):
    try:
        default_dishes = [
            MenuItem(name="Manchow Soup (Veg)", description="Classic Bombay street-style thick soup topped with crispy fried noodles, garlic, coriander, and soya. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchow Soup (Chicken)", description="Aromatic chicken broth simmered with dark soy, finely chopped garlic, ginger and topped with crunchy fried noodles. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchow Soup (Prawns)", description="Flavorful prawn soup infused with fresh coriander, spring onion and wok spices served with crunchy fried noodle topping. [Allergens: Gluten, Soya, Shellfish, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot-n-Sour Soup (Veg)", description="Tangy and spicy thick soup prepared with black pepper, chili sauce, soy, and vinegar. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot-n-Sour Soup (Chicken)", description="Spicy chicken broth infused with vinegar, chili oil, shredded chicken and mushrooms. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot-n-Sour Soup (Prawns)", description="Fiery prawn soup packed with crushed pepper, vinegar and red chillies. [Allergens: Gluten, Soya, Shellfish, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet-n-Sour Soup (Veg)", description="Delightful sweet and tangy soy broth simmered with garden vegetables. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet-n-Sour Soup (Chicken)", description="Balanced sweet and sour broth cooked with shredded chicken and bell peppers. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet-n-Sour Soup (Prawns)", description="Succulent prawns in a sweet and sour soya broth with pineapple accents. [Allergens: Gluten, Soya, Shellfish, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet Corn Soup (Veg)", description="Mild and soothing creamy corn broth loaded with fresh sweetcorn kernels and sesame oil. [Allergens: Gluten, Soya, Dairy, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet Corn Soup (Chicken)", description="Creamy corn soup cooked with tender chicken shreds and egg drop ribbons. [Allergens: Gluten, Soya, Egg, Dairy, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Sweet Corn Soup (Prawns)", description="Rich sweetcorn soup blended with juicy prawns and subtle garlic herbs. [Allergens: Gluten, Soya, Shellfish, Dairy, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Tom Yum Soup (Veg - Soya)", description="Aromatic Thai-style soya soup simmered with lemongrass, galangal and Thai bird chillies. [Allergens: Gluten, Soya, Celery]", price=4.00, category="soups", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Tom Yum Soup (Chicken - Soya)", description="Spicy and sour Thai-inspired chicken broth cooked with soya, mushrooms and lime leaves. [Allergens: Gluten, Soya, Celery]", price=4.99, category="soups", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Tom Yum Soup (Prawns - Soya)", description="Tangy prawn Tom Yum soup with garlic, dark soya and fiery bird-eye chillies. [Allergens: Gluten, Soya, Shellfish, Celery]", price=5.99, category="soups", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Veg Dumpling (Steam)", description="Authentic hand-folded dumplings packed with finely spiced cabbage, carrots, onion and garlic, steamed to perfection. Served with red chili dip. [Allergens: Gluten, Soya]", price=5.99, category="momos", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Veg Dumpling (Chilli)", description="Steamed veggie dumplings wok-tossed in fiery red Schezwan chili garlic sauce with bell peppers and spring onions. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Veg Dumpling (Fried)", description="Golden crisp deep-fried vegetable dumplings served with fiery red garlic dipping sauce. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Dumpling (Steam)", description="Juicy minced chicken marinated in Bombay street spices folded in delicate dumpling skins and steamed. [Allergens: Gluten, Soya]", price=6.50, category="momos", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Dumpling (Chilli)", description="Wok-tossed chicken momos coated in sticky red chili sauce, coriander, spring onion and crushed pepper. [Allergens: Gluten, Soya]", price=6.99, category="momos", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Dumpling (Fried)", description="Crispy fried chicken dumplings packed with aromatic minced chicken, served hot with garlic chutney. [Allergens: Gluten, Soya]", price=6.99, category="momos", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Veg Spring Rolls", description="Golden crispy pastry rolls stuffed with shredded cabbage, carrots, glass noodles and Hakka spices. Served with sweet chili sauce. [Allergens: Gluten, Soya]", price=3.99, category="veg_starters", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Veg - Dry/Gravy)", description="Crispy fried vegetable balls tossed in classic dark soy, ginger, garlic, cilantro and green chili gravy or dry sauce. [Allergens: Gluten, Soya]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Paneer - Dry/Gravy)", description="Cottage cheese cubes tossed in spicy cilantro garlic Manchurian sauce. [Allergens: Gluten, Soya, Dairy]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Gobi - Dry/Gravy)", description="Crispy cauliflower florets coated in spiced Manchurian dark soy glaze. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Tofu - Dry/Gravy)", description="Golden fried organic tofu cubes tossed with garlic Manchurian sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Mushroom - Dry/Gravy)", description="Crispy battered button mushrooms tossed in classic dark soy, ginger, garlic, and cilantro Manchurian glaze. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Veg - Dry/Gravy)", description="Mixed vegetable crispies wok-tossed in homemade spicy red Szechwan chili garlic paste. [Allergens: Gluten, Soya]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Paneer - Dry/Gravy)", description="Paneer cubes fried crisp and sautéed with red Szechwan chili paste and bell peppers. [Allergens: Gluten, Soya, Dairy]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Gobi - Dry/Gravy)", description="Crispy cauliflower wok-tossed in fiery Bombay Szechwan sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Tofu - Dry/Gravy)", description="Silken tofu cubes tossed with fiery red Szechwan chili glaze and spring onions. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Mushroom - Dry/Gravy)", description="Crispy mushrooms wok-tossed in homemade fiery Szechwan chili paste with bell peppers and scallions. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Veg - Dry/Gravy)", description="Mixed vegetable dumpling balls cooked with sliced green chillies, onions, bell peppers and dark soy. [Allergens: Gluten, Soya]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Paneer - Dry/Gravy)", description="Iconic Chilli Paneer! Fresh cottage cheese cubes tossed with capsicum, red onions, garlic and dark chili soy. [Allergens: Gluten, Soya, Dairy]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Gobi - Dry/Gravy)", description="Crunchy cauliflower florets tossed in dark chili soy sauce with capsicum. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Tofu - Dry/Gravy)", description="Crispy tofu tossed with fresh green chillies, garlic and chili soy marinade. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Mushroom - Dry/Gravy)", description="Fresh mushrooms wok-fried with sliced green chillies, capsicum, onions and dark chili soy sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Veg)", description="Bombay street 65 seasoning on vegetable balls cooked with curry leaves and mustard seeds. [Allergens: Gluten, Soya, Mustard]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Paneer)", description="Tangy and spicy South-Indian Bombay fusion Paneer 65 fried with tempered curry leaves and yogurt chili paste. [Allergens: Gluten, Soya, Dairy, Mustard]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Gobi)", description="Crispy Gobi 65 florets cooked with roasted spices, garlic and curry leaves. [Allergens: Gluten, Soya, Mustard]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Tofu)", description="Spiced Tofu 65 cooked with red chili paste, tempered mustard and curry leaves. [Allergens: Gluten, Soya, Mustard]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Mushroom)", description="Crispy Mushroom 65 florets cooked with roasted Bombay 65 spices, garlic and tempered curry leaves. [Allergens: Gluten, Soya, Mustard]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Veg - Dry/Gravy)", description="Crispy veggie balls coated in pungent spicy garlic red sauce. [Allergens: Gluten, Soya]", price=4.99, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Paneer - Dry/Gravy)", description="Paneer cubes tossed in extra garlic red chili paste and scallions. [Allergens: Gluten, Soya, Dairy]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Gobi - Dry/Gravy)", description="Crispy cauliflower in rich garlic chili sauce. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Tofu - Dry/Gravy)", description="Tofu cubes sautéed in fiery hot garlic wok glaze. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Mushroom - Dry/Gravy)", description="Fresh mushrooms sautéed in rich garlic chili sauce with scallions. [Allergens: Gluten, Soya]", price=5.50, category="veg_starters", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Lollipop (Dry)", description="Frenched chicken winglets marinated in Bombay red spices, crisp-fried and served dry with signature garlic chutney. [Allergens: Gluten, Soya, Egg]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Lollipop (Sauted)", description="Fried chicken lollipops sautéed in a sticky, rich Schezwan chili garlic oil with spring onions. [Allergens: Gluten, Soya, Egg]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chicken Rolls", description="Crispy golden rolls filled with spiced minced chicken, peppers and soya glaze. [Allergens: Gluten, Soya, Egg]", price=4.99, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Chicken - Dry/Gravy)", description="Tender chicken bites tossed in classic coriander, dark soy, ginger, garlic and green chili sauce. [Allergens: Gluten, Soya, Egg]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian (Prawns - Dry/Gravy)", description="Crispy prawns cooked in dark soy Manchurian sauce with finely chopped garlic and cilantro. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Chicken - Dry/Gravy)", description="Succulent chicken pieces wok-tossed in homemade fiery Szechwan red chili paste. [Allergens: Gluten, Soya, Egg]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan (Prawns - Dry/Gravy)", description="King prawns tossed in red Szechwan chili paste with bell peppers and spring onion. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Chicken - Dry/Gravy)", description="Famous Chilli Chicken! Batter-fried chicken chunks tossed with green chillies, onions, peppers and soy. [Allergens: Gluten, Soya, Egg]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli (Prawns - Dry/Gravy)", description="Plump prawns sautéed with fresh green chillies, sliced onion, capsicum and spicy soy glaze. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Chicken)", description="Bombay street style Chicken 65 tossed with tempered curry leaves, mustard seeds and red chillies. [Allergens: Gluten, Soya, Egg, Mustard]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="65 (Prawns)", description="Spiced crispy prawns fried with curry leaves, yogurt chili blend and mustard seeds. [Allergens: Gluten, Soya, Egg, Shellfish, Mustard]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Chicken - Dry/Gravy)", description="Diced chicken cooked in fiery red chili garlic wok gravy with scallions. [Allergens: Gluten, Soya, Egg]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Hot Garlic (Prawns - Dry/Gravy)", description="Prawns cooked in intensely aromatic red hot garlic sauce. [Allergens: Gluten, Soya, Egg, Shellfish]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Andhra 65 (Chicken)", description="Extremely spicy regional specialty! Chicken fried with roasted Guntur red chillies, black pepper, and curry leaves. [Allergens: Gluten, Soya, Egg, Mustard]", price=6.00, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Andhra 65 (Prawns)", description="Very spicy Andhra-style prawns tossed with crushed red pepper and fiery curry spices. [Allergens: Gluten, Soya, Egg, Shellfish, Mustard]", price=6.50, category="nonveg_starters", is_veg=False, is_spicy=True, spice_level=3, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Veg Fried Rice / Noodles", description="High-heat wok tossed long grain rice or Hakka noodles cooked with shredded cabbage, carrots, spring onions and soya seasoning. [Allergens: Gluten, Soya, Celery]", price=5.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Manchurian Fried Rice / Noodles (Veg)", description="Wok tossed rice or noodles mixed with vegetable Manchurian crispies and coriander soy sauce. [Allergens: Gluten, Soya, Celery]", price=6.00, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Paneer Fried Rice / Noodles", description="Fried rice or noodles tossed with spiced paneer cubes, capsicum and soya sauce. [Allergens: Gluten, Soya, Dairy, Celery]", price=6.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Tofu Fried Rice / Noodles", description="Wok fried rice or Hakka noodles tossed with organic tofu bits and vegetables. [Allergens: Gluten, Soya, Celery]", price=6.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Mushroom Fried Rice / Noodles", description="Aromatic wok rice or noodles tossed with sliced mushrooms, garlic and pepper. [Allergens: Gluten, Soya, Celery]", price=6.00, category="rice_noodles", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Fried Rice / Noodles (Veg)", description="Spicy wok tossed rice or noodles coated with fiery house-made red Szechwan sauce. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Manchurian Rice / Noodles", description="Fiery Szechwan rice or noodles mixed with vegetable Manchurian balls. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Paneer Rice / Noodles", description="Szechwan chili spiced fried rice or noodles loaded with cottage cheese cubes. [Allergens: Gluten, Soya, Dairy, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Tofu Rice / Noodles", description="Tofu cubes tossed with spicy Szechwan rice or noodles. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Mushroom Rice / Noodles", description="Sautéed mushrooms cooked with fiery Szechwan red chili noodles or rice. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Rice / Noodles (Veg)", description="Aromatic basmati rice or noodles wok-tossed with golden crispy burnt garlic and crushed black pepper. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Manchurian Rice / Noodles", description="Burnt garlic flavored rice or noodles served with Manchurian veggie balls. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Paneer Rice / Noodles", description="Golden burnt garlic rice or noodles packed with paneer cubes and garlic chips. [Allergens: Gluten, Soya, Dairy, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Tofu Rice / Noodles", description="Burnt garlic wok noodles or rice served with organic tofu. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Mushroom Rice / Noodles", description="Earthy mushrooms wok fried with golden burnt garlic and rice or noodles. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Rice / Noodles (Veg)", description="Curry-infused fragrant street noodles or rice tossed with bell peppers and raisins. [Allergens: Gluten, Soya, Celery]", price=5.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Manchurian Rice / Noodles", description="Singapore style curry spice rice or noodles mixed with Manchurian balls. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Paneer Rice / Noodles", description="Curry flavored Singapore noodles or rice with spiced cottage cheese cubes. [Allergens: Gluten, Soya, Dairy, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Tofu Rice / Noodles", description="Fragrant curry spices wok tossed with tofu and yellow noodles. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Mushroom Rice / Noodles", description="Aromatic Singapore spiced curry noodles or rice cooked with mushrooms. [Allergens: Gluten, Soya, Celery]", price=6.50, category="rice_noodles", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles (Egg)", description="Wok tossed fried rice or noodles cooked with fluffy scrambled egg and scallions. [Allergens: Gluten, Soya, Egg, Celery]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles (Chicken)", description="Classic Bombay Chicken Hakka noodles or fried rice with seasoned chicken bits. [Allergens: Gluten, Soya, Egg, Celery]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles (Prawns)", description="Juicy prawns wok tossed with egg, garlic, soya and Hakka noodles or long grain rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Fried Rice / Noodles (Egg)", description="Spicy red Szechwan wok rice or noodles tossed with egg. [Allergens: Gluten, Soya, Egg, Celery]", price=6.50, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Fried Rice / Noodles (Chicken)", description="Fiery chicken Szechwan noodles or fried rice with dark soya and red chillies. [Allergens: Gluten, Soya, Egg, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Fried Rice / Noodles (Prawns)", description="Szechwan red chili spiced prawns tossed with Hakka noodles or basmati rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Rice / Noodles (Egg)", description="Golden burnt garlic chips tossed with egg fried rice or noodles. [Allergens: Gluten, Soya, Egg, Celery]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Rice / Noodles (Chicken)", description="Shredded chicken and crispy burnt garlic wok tossed with noodles or rice. [Allergens: Gluten, Soya, Egg, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Burnt Garlic Rice / Noodles (Prawns)", description="Prawns sautéed with aromatic burnt garlic chips and black pepper wok rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Rice / Noodles (Egg)", description="Yellow curry spice wok noodles or rice tossed with scrambled egg. [Allergens: Gluten, Soya, Egg, Celery]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Rice / Noodles (Chicken)", description="Curry spice infused Singapore rice or noodles with juicy chicken shreds. [Allergens: Gluten, Soya, Egg, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Singapore Rice / Noodles (Prawns)", description="Singapore curry spice king prawns fried with thin Hakka noodles. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=False, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles - Hyderabad Style (Egg)", description="Spicy regional Hyderabad style fried rice or noodles tossed with egg and red chili paste. [Allergens: Gluten, Soya, Egg, Celery]", price=6.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles - Hyderabad Style (Chicken)", description="Zesty Hyderabad style wok rice or noodles packed with spicy chicken and green chillies. [Allergens: Gluten, Soya, Egg, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Fried Rice / Noodles - Hyderabad Style (Prawns)", description="Hyderabad style spicy prawn fried rice or noodles cooked with curry leaves and red pepper. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]", price=7.00, category="rice_noodles", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="COMBO 1 (Rice / Noodles with Gravy)", description="Your choice of Fried Rice or Hakka Noodles served with hot Manchurian or Hot Garlic Gravy. [Allergens: Gluten, Soya, Egg]", price=9.00, category="combos", is_veg=False, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="COMBO 2 (Rice / Noodles with 65 + Drink)", description="Your choice of Fried Rice or Hakka Noodles served with Chicken 65 or Paneer 65 plus a refreshing Soft Drink. [Allergens: Gluten, Soya, Egg]", price=10.00, category="combos", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="TRIPLE COMBO (Rice and Noodles Mix and Gravy)", description="The legendary Bombay Triple Schezwan street meal! Szechwan fried rice mixed with Hakka noodles, crisp noodles and a bowl of spicy Schezwan Manchurian gravy. [Allergens: Gluten, Soya, Egg]", price=10.99, category="combos", is_veg=False, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Plain Chips", description="Crispy golden potato chips lightly salted. [Allergens: Gluten]", price=2.99, category="chips", is_veg=True, is_spicy=False, spice_level=0, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Masala Chips", description="Crispy fries tossed in aromatic Bombay chaat masala and chili spices. [Allergens: Gluten]", price=3.50, category="chips", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=False, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Chilli Chips", description="Crispy potato chips wok-tossed with dark soya sauce, green chillies, garlic and spring onion. [Allergens: Gluten, Soya]", price=3.99, category="chips", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Szechwan Chips", description="Crispy fries tossed with hot Szechwan chili paste, garlic and peppers. [Allergens: Gluten, Soya]", price=3.99, category="chips", is_veg=True, is_spicy=True, spice_level=2, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
            MenuItem(name="Bombay Chips", description="Signature crispy potato chips served with cooling yoghurt mint sauce and cilantro. [Allergens: Gluten, Dairy]", price=4.50, category="chips", is_veg=True, is_spicy=True, spice_level=1, is_chef_special=True, is_popular=True, image_url="/src/assets/images/bombay_manchow_soup_1786516536756.jpg", available=True),
        ]

        canonical_map = {d.name.strip().lower(): d for d in default_dishes}
        all_db_items = db.query(MenuItem).all()
        seen_names = set()
        
        # Purge duplicates or non-canonical items
        for item in all_db_items:
            norm_name = item.name.strip().lower()
            if norm_name in seen_names or norm_name not in canonical_map:
                db.delete(item)
            else:
                seen_names.add(norm_name)
        
        # Add any missing canonical dishes
        for norm_name, d in canonical_map.items():
            if norm_name not in seen_names:
                db.add(d)
        
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
        elif cat_lower in ["chips", "ours_special_chips", "special_chips"]:
            query = query.filter(MenuItem.category.in_(["chips", "ours_special_chips"]))
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
