import { MenuCategory, MenuItem, SpecialOffer, GalleryItem, Review } from '../types';

// Asset paths for authentic generated dish photos
const IMG_SOUP = '/src/assets/images/bombay_manchow_soup_1786516536756.jpg';
const IMG_HOT_SOUR_SOUP = '/src/assets/images/hot_sour_soup_1786609347778.jpg';
const IMG_SWEET_SOUR_SOUP = '/src/assets/images/sweet_sour_soup_1786865648230.jpg';
const IMG_SWEET_CORN_SOUP = '/src/assets/images/sweet_corn_soup_1786609365927.jpg';
const IMG_TOM_YUM_CHICKEN = '/src/assets/images/tom_yum_chicken_soup_1786610012394.jpg';
const IMG_TOM_YUM_VEG = '/src/assets/images/tom_yum_veg_soup_1786865225455.jpg';
const IMG_MANCHOW_PRAWNS = '/src/assets/images/manchow_prawns_soup_1786615681191.jpg';
const IMG_HOT_SOUR_PRAWNS = '/src/assets/images/hot_sour_prawns_soup_1786615698187.jpg';
const IMG_SWEET_CORN_PRAWNS = '/src/assets/images/sweet_corn_prawns_soup_1786873008746.jpg';

// Dumplings (Momos)
const IMG_MOMO_STEAM = '/src/assets/images/steamed_dumplings_momo_1786520824895.jpg';
const IMG_MOMO_CHILLI = '/src/assets/images/chilli_wok_dumplings_1786520842041.jpg';
const IMG_MOMO_FRIED = '/src/assets/images/crispy_fried_momos_1786521404691.jpg';
const IMG_CHICKEN_MOMO_STEAM = '/src/assets/images/chicken_momos_steamed_1786610033977.jpg';
const IMG_CHICKEN_MOMO_CHILLI = '/src/assets/images/chicken_momos_chilli_1786610048331.jpg';
const IMG_CHICKEN_MOMO_FRIED = '/src/assets/images/chicken_momos_fried_1786610073286.jpg';

// Starters
const IMG_SPRING_ROLLS = '/src/assets/images/veg_spring_rolls_1786542679969.jpg';
const IMG_VEG_MANCHURIAN = '/src/assets/images/veg_manchurian_1786542694203.jpg';
const IMG_GOBI_MANCHURIAN = '/src/assets/images/gobi_manchurian_1786865605343.jpg';
const IMG_TOFU_MANCHURIAN = '/src/assets/images/tofu_manchurian_1786865617999.jpg';
const IMG_PANEER_MANCHURIAN = '/src/assets/images/paneer_manchurian_1786542710989.jpg';
const IMG_CHILLI_PANEER = '/src/assets/images/chilli_paneer_1786542725460.jpg';
const IMG_CHILLI_GOBI = '/src/assets/images/chilli_gobi_1786542738688.jpg';
const IMG_CHILLI_TOFU = '/src/assets/images/chilli_tofu_dry_1786865242576.jpg';
const IMG_SZECHWAN_PANEER = '/src/assets/images/szechwan_paneer_1786542753122.jpg';
const IMG_PANEER_65 = '/src/assets/images/paneer_65_1786542764483.jpg';
const IMG_GOBI_65 = '/src/assets/images/gobi_sixty_five_1786864920541.jpg';

const IMG_CHICKEN_LOLLIPOP_DRY = '/src/assets/images/chicken_lollipop_dry_1786864878519.jpg';
const IMG_CHICKEN_LOLLIPOP_SAUTED = '/src/assets/images/chicken_lollipop_sauced_1786516573910.jpg';
const IMG_CHICKEN_ROLL = '/src/assets/images/chicken_roll_1786542779983.jpg';
const IMG_CHICKEN_MANCHURIAN = '/src/assets/images/chicken_manchurian_1786864894429.jpg';
const IMG_CHILLI_CHICKEN = '/src/assets/images/chilli_chicken_1786542793770.jpg';
const IMG_CHICKEN_65 = '/src/assets/images/chicken_65_1786542806844.jpg';
const IMG_ANDHRA_65 = '/src/assets/images/andhra_spicy_65_1786865322955.jpg';
const IMG_CHILLI_PRAWNS = '/src/assets/images/chilli_prawns_1786542836086.jpg';
const IMG_PRAWN_65 = '/src/assets/images/prawn_65_classic_1786865689768.jpg';
const IMG_ANDHRA_PRAWN_65 = '/src/assets/images/andhra_prawn_65_1786865574041.jpg';
const IMG_PRAWN_MANCHURIAN = '/src/assets/images/prawn_manchurian_1786865589831.jpg';
const IMG_HOT_GARLIC_PRAWNS = '/src/assets/images/hot_garlic_prawns_1786865700810.jpg';
const IMG_HOT_GARLIC_CHICKEN = '/src/assets/images/hot_garlic_chicken_1786872610686.jpg';
const IMG_HOT_GARLIC_VEG = '/src/assets/images/hot_garlic_veg_1786964808786.jpg';
const IMG_HOT_GARLIC_GOBI = '/src/assets/images/hot_garlic_gobi_1786964822117.jpg';
const IMG_HOT_GARLIC_MUSHROOM = '/src/assets/images/hot_garlic_mushroom_1786964837820.jpg';
const IMG_HOT_GARLIC_PANEER = '/src/assets/images/hot_garlic_paneer_1786964854908.jpg';
const IMG_HOT_GARLIC_TOFU = '/src/assets/images/hot_garlic_tofu_1786964867817.jpg';

// Mushrooms & Specials
const IMG_MUSHROOM_MANCHURIAN = '/src/assets/images/mushroom_manchurian_1786610712161.jpg';
const IMG_CHILLI_MUSHROOM = '/src/assets/images/chilli_mushroom_1786610730124.jpg';
const IMG_MUSHROOM_65 = '/src/assets/images/mushroom_65_1786610746598.jpg';
const IMG_HOT_GARLIC_DISH = '/src/assets/images/hot_garlic_dish_1786613872546.jpg';

// Chips
const IMG_PLAIN_CHIPS = '/src/assets/images/plain_chips_1786542849444.jpg';
const IMG_MASALA_CHIPS = '/src/assets/images/masala_chips_1786542864367.jpg';
const IMG_CHILLI_CHIPS = '/src/assets/images/chilli_chips_1786542878114.jpg';
const IMG_SZECHWAN_CHIPS = '/src/assets/images/szechwan_chips_1786542892121.jpg';
const IMG_BOMBAY_CHIPS = '/src/assets/images/bombay_chips_1786542907959.jpg';

// Rice & Noodles
const IMG_VEG_HAKKA_NOODLES = '/src/assets/images/veg_hakka_noodles_1786864935647.jpg';
const IMG_VEG_FRIED_RICE = '/src/assets/images/veg_hakka_fried_rice_1786613860757.jpg';
const IMG_EGG_FRIED_RICE = '/src/assets/images/egg_fried_rice_1786864861119.jpg';
const IMG_CHICKEN_FRIED_RICE = '/src/assets/images/chicken_fried_rice_1786865261779.jpg';
const IMG_CHICKEN_HAKKA_NOODLES = '/src/assets/images/chicken_hakka_noodles_1786609308917.jpg';
const IMG_SZECHWAN_FRIED_RICE = '/src/assets/images/szechwan_fried_rice_1786609327627.jpg';
const IMG_SZECHWAN_NOODLES = '/src/assets/images/szechwan_noodles_1786865275304.jpg';
const IMG_PANEER_FRIED_RICE = '/src/assets/images/paneer_fried_rice_1786865295220.jpg';
const IMG_BURNT_GARLIC_RICE = '/src/assets/images/burnt_garlic_rice_1786864831413.jpg';
const IMG_BURNT_GARLIC_NOODLES = '/src/assets/images/burnt_garlic_noodles_1786865309380.jpg';
const IMG_BURNT_GARLIC_MUSHROOM_RICE = '/src/assets/images/burnt_garlic_mushroom_rice_1786865904696.jpg';
const IMG_BURNT_GARLIC_PANEER_RICE = '/src/assets/images/burnt_garlic_paneer_rice_1786865926634.jpg';
const IMG_BURNT_GARLIC_TOFU_RICE = '/src/assets/images/burnt_garlic_tofu_rice_1786865942184.jpg';
const IMG_BURNT_GARLIC_MANCHURIAN_RICE = '/src/assets/images/burnt_garlic_manchurian_rice_1786865954823.jpg';
const IMG_BURNT_GARLIC_PRAWNS_RICE = '/src/assets/images/burnt_garlic_prawns_rice_1786865968949.jpg';
const IMG_SINGAPORE_NOODLES = '/src/assets/images/singapore_curry_noodles_1786864846091.jpg';
const IMG_SINGAPORE_FRIED_RICE = '/src/assets/images/singapore_fried_rice_1786865981318.jpg';
const IMG_PRAWN_FRIED_RICE = '/src/assets/images/prawn_fried_rice_1786864907958.jpg';
const IMG_PRAWN_HAKKA_NOODLES = '/src/assets/images/prawn_hakka_noodles_1786865634448.jpg';
const IMG_HYDERABAD_SPICY_RICE = '/src/assets/images/hyderabad_spicy_rice_1786865662834.jpg';
const IMG_HYDERABAD_EGG_RICE = '/src/assets/images/hyderabad_egg_rice_1786964773898.jpg';
const IMG_HYDERABAD_CHICKEN_RICE = '/src/assets/images/hyderabad_chicken_rice_1786964791860.jpg';
const IMG_TRIPLE_COMBO = '/src/assets/images/triple_schezwan_combo_1786516611209.jpg';

// Restaurant & Ambience Imagery
const IMG_KITCHEN_WOK = '/src/assets/images/fiery_wok_kitchen_1786965247008.jpg';
const IMG_AMBIENCE = '/src/assets/images/restaurant_ambience_1786965269878.jpg';
const IMG_CHEF_PLATING = '/src/assets/images/master_chef_plating_1786965291357.jpg';

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'soups', name: 'Soups', description: 'Authentic Bombay soups made with soya sauce, garlic & wok spices' },
  { id: 'momos', name: 'Bombay Special Dumplings', description: 'Handcrafted steamed, fried or chilli-tossed Bombay dumplings' },
  { id: 'veg_starters', name: 'Veg Starters', description: 'Crispy Veg, Paneer, Gobi and Tofu tossed in wok sauces' },
  { id: 'nonveg_starters', name: 'Non-Veg Starters', description: 'Chicken Lollipop, Rolls, Chilli, 65, Szechwan & Andhra specials' },
  { id: 'rice_noodles', name: 'Fried Rice & Noodles', description: 'High-heat wok tossed rice & noodles with Veg, Paneer, Chicken, Egg or Prawns' },
  { id: 'combos', name: 'Combo Special', description: 'Complete Bombay street food meal boxes with Rice, Noodles, Gravies & Drinks' },
  { id: 'chips', name: 'Ours Special Chips', description: 'Crispy potato chips tossed in Masala, Chilli, Szechwan & Mint Yogurt' }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ==================== 1. SOUPS ====================
  // (All soups are made with soya sauce and may contain gluten, dairy, celery and traces of sesame)
  {
    id: 'soup-manchow-veg',
    name: 'Manchow Soup (Veg)',
    description: 'Classic Bombay street-style thick soup topped with crispy fried noodles, garlic, coriander, and soya. [Allergens: Gluten, Soya, Celery]',
    price: 4.00,
    category: 'soups',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_SOUP,
    available: true
  },
  {
    id: 'soup-manchow-chicken',
    name: 'Manchow Soup (Chicken)',
    description: 'Aromatic chicken broth simmered with dark soy, finely chopped garlic, ginger and topped with crunchy fried noodles. [Allergens: Gluten, Soya, Celery]',
    price: 4.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_SOUP,
    available: true
  },
  {
    id: 'soup-manchow-prawns',
    name: 'Manchow Soup (Prawns)',
    description: 'Flavorful prawn soup infused with fresh coriander, spring onion and wok spices served with crunchy fried noodle topping. [Allergens: Gluten, Soya, Shellfish, Celery]',
    price: 5.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_MANCHOW_PRAWNS,
    available: true
  },
  {
    id: 'soup-hot-sour-veg',
    name: 'Hot-n-Sour Soup (Veg)',
    description: 'Tangy and spicy thick soup prepared with black pepper, chili sauce, soy, and vinegar. [Allergens: Gluten, Soya, Celery]',
    price: 4.00,
    category: 'soups',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HOT_SOUR_SOUP,
    available: true
  },
  {
    id: 'soup-hot-sour-chicken',
    name: 'Hot-n-Sour Soup (Chicken)',
    description: 'Spicy chicken broth infused with vinegar, chili oil, shredded chicken and mushrooms. [Allergens: Gluten, Soya, Celery]',
    price: 4.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HOT_SOUR_SOUP,
    available: true
  },
  {
    id: 'soup-hot-sour-prawns',
    name: 'Hot-n-Sour Soup (Prawns)',
    description: 'Fiery prawn soup packed with crushed pepper, vinegar and red chillies. [Allergens: Gluten, Soya, Shellfish, Celery]',
    price: 5.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_HOT_SOUR_PRAWNS,
    available: true
  },
  {
    id: 'soup-sweet-sour-veg',
    name: 'Sweet-n-Sour Soup (Veg)',
    description: 'Delightful sweet and tangy soy broth simmered with garden vegetables. [Allergens: Gluten, Soya, Celery]',
    price: 4.00,
    category: 'soups',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_SWEET_SOUR_SOUP,
    available: true
  },
  {
    id: 'soup-sweet-sour-chicken',
    name: 'Sweet-n-Sour Soup (Chicken)',
    description: 'Balanced sweet and sour broth cooked with shredded chicken and bell peppers. [Allergens: Gluten, Soya, Celery]',
    price: 4.99,
    category: 'soups',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_SWEET_SOUR_SOUP,
    available: true
  },
  {
    id: 'soup-sweet-sour-prawns',
    name: 'Sweet-n-Sour Soup (Prawns)',
    description: 'Succulent prawns in a sweet and sour soya broth with pineapple accents. [Allergens: Gluten, Soya, Shellfish, Celery]',
    price: 5.99,
    category: 'soups',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_SWEET_SOUR_SOUP,
    available: true
  },
  {
    id: 'soup-sweet-corn-veg',
    name: 'Sweet Corn Soup (Veg)',
    description: 'Mild and soothing creamy corn broth loaded with fresh sweetcorn kernels and sesame oil. [Allergens: Gluten, Soya, Dairy, Celery]',
    price: 4.00,
    category: 'soups',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_SWEET_CORN_SOUP,
    available: true
  },
  {
    id: 'soup-sweet-corn-chicken',
    name: 'Sweet Corn Soup (Chicken)',
    description: 'Creamy corn soup cooked with tender chicken shreds and egg drop ribbons. [Allergens: Gluten, Soya, Egg, Dairy, Celery]',
    price: 4.99,
    category: 'soups',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_SWEET_CORN_SOUP,
    available: true
  },
  {
    id: 'soup-sweet-corn-prawns',
    name: 'Sweet Corn Soup (Prawns)',
    description: 'Rich sweetcorn soup blended with juicy prawns and subtle garlic herbs. [Allergens: Gluten, Soya, Shellfish, Dairy, Celery]',
    price: 5.99,
    category: 'soups',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_SWEET_CORN_PRAWNS,
    available: true
  },
  {
    id: 'soup-tom-yum-veg',
    name: 'Tom Yum Soup (Veg - Soya)',
    description: 'Aromatic Thai-style soya soup simmered with lemongrass, galangal and Thai bird chillies. [Allergens: Gluten, Soya, Celery]',
    price: 4.00,
    category: 'soups',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_TOM_YUM_VEG,
    available: true
  },
  {
    id: 'soup-tom-yum-chicken',
    name: 'Tom Yum Soup (Chicken - Soya)',
    description: 'Spicy and sour Thai-inspired chicken broth cooked with soya, mushrooms and lime leaves. [Allergens: Gluten, Soya, Celery]',
    price: 4.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_TOM_YUM_CHICKEN,
    available: true
  },
  {
    id: 'soup-tom-yum-prawns',
    name: 'Tom Yum Soup (Prawns - Soya)',
    description: 'Tangy prawn Tom Yum soup with garlic, dark soya and fiery bird-eye chillies. [Allergens: Gluten, Soya, Shellfish, Celery]',
    price: 5.99,
    category: 'soups',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_TOM_YUM_CHICKEN,
    available: true
  },

  // ==================== 2. BOMBAY SPECIAL DUMPLINGS ====================
  // (Dumplings contain gluten (maida), soya and may contain sesame)
  {
    id: 'momo-veg-steam',
    name: 'Veg Dumpling (Steam)',
    description: 'Authentic hand-folded dumplings packed with finely spiced cabbage, carrots, onion and garlic, steamed to perfection. Served with red chili dip. [Allergens: Gluten, Soya]',
    price: 5.99,
    category: 'momos',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_MOMO_STEAM,
    available: true
  },
  {
    id: 'momo-veg-chilli',
    name: 'Veg Dumpling (Chilli)',
    description: 'Steamed veggie dumplings wok-tossed in fiery red Schezwan chili garlic sauce with bell peppers and spring onions. [Allergens: Gluten, Soya]',
    price: 6.50,
    category: 'momos',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_MOMO_CHILLI,
    available: true
  },
  {
    id: 'momo-veg-fried',
    name: 'Veg Dumpling (Fried)',
    description: 'Golden crisp deep-fried vegetable dumplings served with fiery red garlic dipping sauce. [Allergens: Gluten, Soya]',
    price: 6.50,
    category: 'momos',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_MOMO_FRIED,
    available: true
  },
  {
    id: 'momo-chicken-steam',
    name: 'Chicken Dumpling (Steam)',
    description: 'Juicy minced chicken marinated in Bombay street spices folded in delicate dumpling skins and steamed. [Allergens: Gluten, Soya]',
    price: 6.50,
    category: 'momos',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_MOMO_STEAM,
    available: true
  },
  {
    id: 'momo-chicken-chilli',
    name: 'Chicken Dumpling (Chilli)',
    description: 'Wok-tossed chicken momos coated in sticky red chili sauce, coriander, spring onion and crushed pepper. [Allergens: Gluten, Soya]',
    price: 6.99,
    category: 'momos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_MOMO_CHILLI,
    available: true
  },
  {
    id: 'momo-chicken-fried',
    name: 'Chicken Dumpling (Fried)',
    description: 'Crispy fried chicken dumplings packed with aromatic minced chicken, served hot with garlic chutney. [Allergens: Gluten, Soya]',
    price: 6.99,
    category: 'momos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_MOMO_FRIED,
    available: true
  },

  // ==================== 3. VEG STARTERS ====================
  // (All veg starters may contain gluten, soya and traces of sesame)
  {
    id: 'vstar-spring-rolls',
    name: 'Veg Spring Rolls',
    description: 'Golden crispy pastry rolls stuffed with shredded cabbage, carrots, glass noodles and Hakka spices. Served with sweet chili sauce. [Allergens: Gluten, Soya]',
    price: 3.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_SPRING_ROLLS,
    available: true
  },
  {
    id: 'vstar-manchurian-veg',
    name: 'Manchurian (Veg - Dry/Gravy)',
    description: 'Crispy fried vegetable balls tossed in classic dark soy, ginger, garlic, cilantro and green chili gravy or dry sauce. [Allergens: Gluten, Soya]',
    price: 4.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_VEG_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-manchurian-paneer',
    name: 'Manchurian (Paneer - Dry/Gravy)',
    description: 'Cottage cheese cubes tossed in spicy cilantro garlic Manchurian sauce. [Allergens: Gluten, Soya, Dairy]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PANEER_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-manchurian-gobi',
    name: 'Manchurian (Gobi - Dry/Gravy)',
    description: 'Crispy cauliflower florets coated in spiced Manchurian dark soy glaze. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_GOBI_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-manchurian-tofu',
    name: 'Manchurian (Tofu - Dry/Gravy)',
    description: 'Golden fried organic tofu cubes tossed with garlic Manchurian sauce. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_TOFU_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-manchurian-mushroom',
    name: 'Manchurian (Mushroom - Dry/Gravy)',
    description: 'Crispy battered button mushrooms tossed in classic dark soy, ginger, garlic, and cilantro Manchurian glaze. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_MUSHROOM_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-szechwan-veg',
    name: 'Szechwan (Veg - Dry/Gravy)',
    description: 'Mixed vegetable crispies wok-tossed in homemade spicy red Szechwan chili garlic paste. [Allergens: Gluten, Soya]',
    price: 4.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_VEG_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-szechwan-paneer',
    name: 'Szechwan (Paneer - Dry/Gravy)',
    description: 'Paneer cubes fried crisp and sautéed with red Szechwan chili paste and bell peppers. [Allergens: Gluten, Soya, Dairy]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_SZECHWAN_PANEER,
    available: true
  },
  {
    id: 'vstar-szechwan-gobi',
    name: 'Szechwan (Gobi - Dry/Gravy)',
    description: 'Crispy cauliflower wok-tossed in fiery Bombay Szechwan sauce. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_CHILLI_GOBI,
    available: true
  },
  {
    id: 'vstar-szechwan-tofu',
    name: 'Szechwan (Tofu - Dry/Gravy)',
    description: 'Silken tofu cubes tossed with fiery red Szechwan chili glaze and spring onions. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_CHILLI_TOFU,
    available: true
  },
  {
    id: 'vstar-szechwan-mushroom',
    name: 'Szechwan (Mushroom - Dry/Gravy)',
    description: 'Crispy mushrooms wok-tossed in homemade fiery Szechwan chili paste with bell peppers and scallions. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_MUSHROOM,
    available: true
  },
  {
    id: 'vstar-chilli-veg',
    name: 'Chilli (Veg - Dry/Gravy)',
    description: 'Mixed vegetable dumpling balls cooked with sliced green chillies, onions, bell peppers and dark soy. [Allergens: Gluten, Soya]',
    price: 4.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_VEG_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-chilli-paneer',
    name: 'Chilli (Paneer - Dry/Gravy)',
    description: 'Iconic Chilli Paneer! Fresh cottage cheese cubes tossed with capsicum, red onions, garlic and dark chili soy. [Allergens: Gluten, Soya, Dairy]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_PANEER,
    available: true
  },
  {
    id: 'vstar-chilli-gobi',
    name: 'Chilli (Gobi - Dry/Gravy)',
    description: 'Crunchy cauliflower florets tossed in dark chili soy sauce with capsicum. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_CHILLI_GOBI,
    available: true
  },
  {
    id: 'vstar-chilli-tofu',
    name: 'Chilli (Tofu - Dry/Gravy)',
    description: 'Crispy tofu tossed with fresh green chillies, garlic and chili soy marinade. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_CHILLI_TOFU,
    available: true
  },
  {
    id: 'vstar-chilli-mushroom',
    name: 'Chilli (Mushroom - Dry/Gravy)',
    description: 'Fresh mushrooms wok-fried with sliced green chillies, capsicum, onions and dark chili soy sauce. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_MUSHROOM,
    available: true
  },
  {
    id: 'vstar-65-veg',
    name: '65 (Veg)',
    description: 'Bombay street 65 seasoning on vegetable balls cooked with curry leaves and mustard seeds. [Allergens: Gluten, Soya, Mustard]',
    price: 4.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_VEG_MANCHURIAN,
    available: true
  },
  {
    id: 'vstar-65-paneer',
    name: '65 (Paneer)',
    description: 'Tangy and spicy South-Indian Bombay fusion Paneer 65 fried with tempered curry leaves and yogurt chili paste. [Allergens: Gluten, Soya, Dairy, Mustard]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_PANEER_65,
    available: true
  },
  {
    id: 'vstar-65-gobi',
    name: '65 (Gobi)',
    description: 'Crispy Gobi 65 florets cooked with roasted spices, garlic and curry leaves. [Allergens: Gluten, Soya, Mustard]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_GOBI_65,
    available: true
  },
  {
    id: 'vstar-65-tofu',
    name: '65 (Tofu)',
    description: 'Spiced Tofu 65 cooked with red chili paste, tempered mustard and curry leaves. [Allergens: Gluten, Soya, Mustard]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_CHILLI_TOFU,
    available: true
  },
  {
    id: 'vstar-65-mushroom',
    name: '65 (Mushroom)',
    description: 'Crispy Mushroom 65 florets cooked with roasted Bombay 65 spices, garlic and tempered curry leaves. [Allergens: Gluten, Soya, Mustard]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_MUSHROOM_65,
    available: true
  },
  {
    id: 'vstar-hotgarlic-veg',
    name: 'Hot Garlic (Veg - Dry/Gravy)',
    description: 'Crispy veggie balls coated in pungent spicy garlic red sauce. [Allergens: Gluten, Soya]',
    price: 4.99,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_HOT_GARLIC_VEG,
    available: true
  },
  {
    id: 'vstar-hotgarlic-paneer',
    name: 'Hot Garlic (Paneer - Dry/Gravy)',
    description: 'Paneer cubes tossed in extra garlic red chili paste and scallions. [Allergens: Gluten, Soya, Dairy]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HOT_GARLIC_PANEER,
    available: true
  },
  {
    id: 'vstar-hotgarlic-gobi',
    name: 'Hot Garlic (Gobi - Dry/Gravy)',
    description: 'Crispy cauliflower in rich garlic chili sauce. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_HOT_GARLIC_GOBI,
    available: true
  },
  {
    id: 'vstar-hotgarlic-tofu',
    name: 'Hot Garlic (Tofu - Dry/Gravy)',
    description: 'Tofu cubes sautéed in fiery hot garlic wok glaze. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_HOT_GARLIC_TOFU,
    available: true
  },
  {
    id: 'vstar-hotgarlic-mushroom',
    name: 'Hot Garlic (Mushroom - Dry/Gravy)',
    description: 'Fresh mushrooms sautéed in rich garlic chili sauce with scallions. [Allergens: Gluten, Soya]',
    price: 5.50,
    category: 'veg_starters',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HOT_GARLIC_MUSHROOM,
    available: true
  },

  // ==================== 4. NON-VEG STARTERS ====================
  // (All non-veg starters may contain gluten, soya, egg and traces of sesame)
  {
    id: 'nvstar-chicken-lollipop-dry',
    name: 'Chicken Lollipop (Dry)',
    description: 'Frenched chicken winglets marinated in Bombay red spices, crisp-fried and served dry with signature garlic chutney. [Allergens: Gluten, Soya, Egg]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_LOLLIPOP_DRY,
    available: true
  },
  {
    id: 'nvstar-chicken-lollipop-sauted',
    name: 'Chicken Lollipop (Sauted)',
    description: 'Fried chicken lollipops sautéed in a sticky, rich Schezwan chili garlic oil with spring onions. [Allergens: Gluten, Soya, Egg]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_LOLLIPOP_SAUTED,
    available: true
  },
  {
    id: 'nvstar-chicken-rolls',
    name: 'Chicken Rolls',
    description: 'Crispy golden rolls filled with spiced minced chicken, peppers and soya glaze. [Allergens: Gluten, Soya, Egg]',
    price: 4.99,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_CHICKEN_ROLL,
    available: true
  },
  {
    id: 'nvstar-manchurian-chicken',
    name: 'Manchurian (Chicken - Dry/Gravy)',
    description: 'Tender chicken bites tossed in classic coriander, dark soy, ginger, garlic and green chili sauce. [Allergens: Gluten, Soya, Egg]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_CHICKEN_MANCHURIAN,
    available: true
  },
  {
    id: 'nvstar-manchurian-prawns',
    name: 'Manchurian (Prawns - Dry/Gravy)',
    description: 'Crispy prawns cooked in dark soy Manchurian sauce with finely chopped garlic and cilantro. [Allergens: Gluten, Soya, Egg, Shellfish]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PRAWN_MANCHURIAN,
    available: true
  },
  {
    id: 'nvstar-szechwan-chicken',
    name: 'Szechwan (Chicken - Dry/Gravy)',
    description: 'Succulent chicken pieces wok-tossed in homemade fiery Szechwan red chili paste. [Allergens: Gluten, Soya, Egg]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_CHICKEN,
    available: true
  },
  {
    id: 'nvstar-szechwan-prawns',
    name: 'Szechwan (Prawns - Dry/Gravy)',
    description: 'King prawns tossed in red Szechwan chili paste with bell peppers and spring onion. [Allergens: Gluten, Soya, Egg, Shellfish]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: false,
    image: IMG_CHILLI_PRAWNS,
    available: true
  },
  {
    id: 'nvstar-chilli-chicken',
    name: 'Chilli (Chicken - Dry/Gravy)',
    description: 'Famous Chilli Chicken! Batter-fried chicken chunks tossed with green chillies, onions, peppers and soy. [Allergens: Gluten, Soya, Egg]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_CHICKEN,
    available: true
  },
  {
    id: 'nvstar-chilli-prawns',
    name: 'Chilli (Prawns - Dry/Gravy)',
    description: 'Plump prawns sautéed with fresh green chillies, sliced onion, capsicum and spicy soy glaze. [Allergens: Gluten, Soya, Egg, Shellfish]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_CHILLI_PRAWNS,
    available: true
  },
  {
    id: 'nvstar-65-chicken',
    name: '65 (Chicken)',
    description: 'Bombay street style Chicken 65 tossed with tempered curry leaves, mustard seeds and red chillies. [Allergens: Gluten, Soya, Egg, Mustard]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_65,
    available: true
  },
  {
    id: 'nvstar-65-prawns',
    name: '65 (Prawns)',
    description: 'Spiced crispy prawns fried with curry leaves, yogurt chili blend and mustard seeds. [Allergens: Gluten, Soya, Egg, Shellfish, Mustard]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_PRAWN_65,
    available: true
  },
  {
    id: 'nvstar-hotgarlic-chicken',
    name: 'Hot Garlic (Chicken - Dry/Gravy)',
    description: 'Diced chicken cooked in fiery red chili garlic wok gravy with scallions. [Allergens: Gluten, Soya, Egg]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HOT_GARLIC_CHICKEN,
    available: true
  },
  {
    id: 'nvstar-hotgarlic-prawns',
    name: 'Hot Garlic (Prawns - Dry/Gravy)',
    description: 'Prawns cooked in intensely aromatic red hot garlic sauce. [Allergens: Gluten, Soya, Egg, Shellfish]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_HOT_GARLIC_PRAWNS,
    available: true
  },
  {
    id: 'nvstar-andhra65-chicken',
    name: 'Andhra 65 (Chicken)',
    description: 'Extremely spicy regional specialty! Chicken fried with roasted Guntur red chillies, black pepper, and curry leaves. [Allergens: Gluten, Soya, Egg, Mustard]',
    price: 6.00,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 3,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_ANDHRA_65,
    available: true
  },
  {
    id: 'nvstar-andhra65-prawns',
    name: 'Andhra 65 (Prawns)',
    description: 'Very spicy Andhra-style prawns tossed with crushed red pepper and fiery curry spices. [Allergens: Gluten, Soya, Egg, Shellfish, Mustard]',
    price: 6.50,
    category: 'nonveg_starters',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 3,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_ANDHRA_PRAWN_65,
    available: true
  },

  // ==================== 5. FRIED RICE & NOODLES ====================
  // (All fried rice & noodles are prepared with soya sauce and may contain gluten, egg, celery and traces of sesame)
  // --- VEGETARIAN VARIATIONS ---
  {
    id: 'rice-veg-fried',
    name: 'Veg Fried Rice / Noodles',
    description: 'High-heat wok tossed long grain rice or Hakka noodles cooked with shredded cabbage, carrots, spring onions and soya seasoning. [Allergens: Gluten, Soya, Celery]',
    price: 5.00,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_VEG_HAKKA_NOODLES,
    available: true
  },
  {
    id: 'rice-manchurian-veg',
    name: 'Manchurian Fried Rice / Noodles (Veg)',
    description: 'Wok tossed rice or noodles mixed with vegetable Manchurian crispies and coriander soy sauce. [Allergens: Gluten, Soya, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_BURNT_GARLIC_MANCHURIAN_RICE,
    available: true
  },
  {
    id: 'rice-paneer-veg',
    name: 'Paneer Fried Rice / Noodles',
    description: 'Fried rice or noodles tossed with spiced paneer cubes, capsicum and soya sauce. [Allergens: Gluten, Soya, Dairy, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PANEER_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-tofu-veg',
    name: 'Tofu Fried Rice / Noodles',
    description: 'Wok fried rice or Hakka noodles tossed with organic tofu bits and vegetables. [Allergens: Gluten, Soya, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_TOFU_RICE,
    available: true
  },
  {
    id: 'rice-mushroom-veg',
    name: 'Mushroom Fried Rice / Noodles',
    description: 'Aromatic wok rice or noodles tossed with sliced mushrooms, garlic and pepper. [Allergens: Gluten, Soya, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MUSHROOM_RICE,
    available: true
  },

  {
    id: 'rice-szechwan-veg',
    name: 'Szechwan Fried Rice / Noodles (Veg)',
    description: 'Spicy wok tossed rice or noodles coated with fiery house-made red Szechwan sauce. [Allergens: Gluten, Soya, Celery]',
    price: 5.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_SZECHWAN_NOODLES,
    available: true
  },
  {
    id: 'rice-szechwan-manchurian',
    name: 'Szechwan Manchurian Rice / Noodles',
    description: 'Fiery Szechwan rice or noodles mixed with vegetable Manchurian balls. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_BURNT_GARLIC_MANCHURIAN_RICE,
    available: true
  },
  {
    id: 'rice-szechwan-paneer',
    name: 'Szechwan Paneer Rice / Noodles',
    description: 'Szechwan chili spiced fried rice or noodles loaded with cottage cheese cubes. [Allergens: Gluten, Soya, Dairy, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_BURNT_GARLIC_PANEER_RICE,
    available: true
  },
  {
    id: 'rice-szechwan-tofu',
    name: 'Szechwan Tofu Rice / Noodles',
    description: 'Tofu cubes tossed with spicy Szechwan rice or noodles. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_TOFU_RICE,
    available: true
  },
  {
    id: 'rice-szechwan-mushroom',
    name: 'Szechwan Mushroom Rice / Noodles',
    description: 'Sautéed mushrooms cooked with fiery Szechwan red chili noodles or rice. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MUSHROOM_RICE,
    available: true
  },

  {
    id: 'rice-burntgarlic-veg',
    name: 'Burnt Garlic Rice / Noodles (Veg)',
    description: 'Aromatic basmati rice or noodles wok-tossed with golden crispy burnt garlic and crushed black pepper. [Allergens: Gluten, Soya, Celery]',
    price: 5.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_BURNT_GARLIC_RICE,
    available: true
  },
  {
    id: 'rice-burntgarlic-manchurian',
    name: 'Burnt Garlic Manchurian Rice / Noodles',
    description: 'Burnt garlic flavored rice or noodles served with Manchurian veggie balls. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MANCHURIAN_RICE,
    available: true
  },
  {
    id: 'rice-burntgarlic-paneer',
    name: 'Burnt Garlic Paneer Rice / Noodles',
    description: 'Golden burnt garlic rice or noodles packed with paneer cubes and garlic chips. [Allergens: Gluten, Soya, Dairy, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_BURNT_GARLIC_PANEER_RICE,
    available: true
  },
  {
    id: 'rice-burntgarlic-tofu',
    name: 'Burnt Garlic Tofu Rice / Noodles',
    description: 'Burnt garlic wok noodles or rice served with organic tofu. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_TOFU_RICE,
    available: true
  },
  {
    id: 'rice-burntgarlic-mushroom',
    name: 'Burnt Garlic Mushroom Rice / Noodles',
    description: 'Earthy mushrooms wok fried with golden burnt garlic and rice or noodles. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MUSHROOM_RICE,
    available: true
  },

  {
    id: 'rice-singapore-veg',
    name: 'Singapore Rice / Noodles (Veg)',
    description: 'Curry-infused fragrant street noodles or rice tossed with bell peppers and raisins. [Allergens: Gluten, Soya, Celery]',
    price: 5.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_SINGAPORE_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-singapore-manchurian',
    name: 'Singapore Manchurian Rice / Noodles',
    description: 'Singapore style curry spice rice or noodles mixed with Manchurian balls. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MANCHURIAN_RICE,
    available: true
  },
  {
    id: 'rice-singapore-paneer',
    name: 'Singapore Paneer Rice / Noodles',
    description: 'Curry flavored Singapore noodles or rice with spiced cottage cheese cubes. [Allergens: Gluten, Soya, Dairy, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_BURNT_GARLIC_PANEER_RICE,
    available: true
  },
  {
    id: 'rice-singapore-tofu',
    name: 'Singapore Tofu Rice / Noodles',
    description: 'Fragrant curry spices wok tossed with tofu and yellow noodles. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_TOFU_RICE,
    available: true
  },
  {
    id: 'rice-singapore-mushroom',
    name: 'Singapore Mushroom Rice / Noodles',
    description: 'Aromatic Singapore spiced curry noodles or rice cooked with mushrooms. [Allergens: Gluten, Soya, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_MUSHROOM_RICE,
    available: true
  },

  // --- NON-VEGETARIAN VARIATIONS ---
  {
    id: 'rice-fried-egg',
    name: 'Fried Rice / Noodles (Egg)',
    description: 'Wok tossed fried rice or noodles cooked with fluffy scrambled egg and scallions. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_EGG_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-fried-chicken',
    name: 'Fried Rice / Noodles (Chicken)',
    description: 'Classic Bombay Chicken Hakka noodles or fried rice with seasoned chicken bits. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-fried-prawns',
    name: 'Fried Rice / Noodles (Prawns)',
    description: 'Juicy prawns wok tossed with egg, garlic, soya and Hakka noodles or long grain rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PRAWN_FRIED_RICE,
    available: true
  },

  {
    id: 'rice-szechwan-egg',
    name: 'Szechwan Fried Rice / Noodles (Egg)',
    description: 'Spicy red Szechwan wok rice or noodles tossed with egg. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.50,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_EGG_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-szechwan-chicken',
    name: 'Szechwan Fried Rice / Noodles (Chicken)',
    description: 'Fiery chicken Szechwan noodles or fried rice with dark soya and red chillies. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHICKEN_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-szechwan-prawns',
    name: 'Szechwan Fried Rice / Noodles (Prawns)',
    description: 'Szechwan red chili spiced prawns tossed with Hakka noodles or basmati rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PRAWN_HAKKA_NOODLES,
    available: true
  },

  {
    id: 'rice-burntgarlic-egg',
    name: 'Burnt Garlic Rice / Noodles (Egg)',
    description: 'Golden burnt garlic chips tossed with egg fried rice or noodles. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_EGG_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-burntgarlic-chicken',
    name: 'Burnt Garlic Rice / Noodles (Chicken)',
    description: 'Shredded chicken and crispy burnt garlic wok tossed with noodles or rice. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_BURNT_GARLIC_NOODLES,
    available: true
  },
  {
    id: 'rice-burntgarlic-prawns',
    name: 'Burnt Garlic Rice / Noodles (Prawns)',
    description: 'Prawns sautéed with aromatic burnt garlic chips and black pepper wok rice. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_BURNT_GARLIC_PRAWNS_RICE,
    available: true
  },

  {
    id: 'rice-singapore-egg',
    name: 'Singapore Rice / Noodles (Egg)',
    description: 'Yellow curry spice wok noodles or rice tossed with scrambled egg. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_SINGAPORE_FRIED_RICE,
    available: true
  },
  {
    id: 'rice-singapore-chicken',
    name: 'Singapore Rice / Noodles (Chicken)',
    description: 'Curry spice infused Singapore rice or noodles with juicy chicken shreds. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_SINGAPORE_NOODLES,
    available: true
  },
  {
    id: 'rice-singapore-prawns',
    name: 'Singapore Rice / Noodles (Prawns)',
    description: 'Singapore curry spice king prawns fried with thin Hakka noodles. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: false,
    image: IMG_BURNT_GARLIC_PRAWNS_RICE,
    available: true
  },

  {
    id: 'rice-hyderabad-egg',
    name: 'Fried Rice / Noodles - Hyderabad Style (Egg)',
    description: 'Spicy regional Hyderabad style fried rice or noodles tossed with egg and red chili paste. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 6.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_HYDERABAD_EGG_RICE,
    available: true
  },
  {
    id: 'rice-hyderabad-chicken',
    name: 'Fried Rice / Noodles - Hyderabad Style (Chicken)',
    description: 'Zesty Hyderabad style wok rice or noodles packed with spicy chicken and green chillies. [Allergens: Gluten, Soya, Egg, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_HYDERABAD_CHICKEN_RICE,
    available: true
  },
  {
    id: 'rice-hyderabad-prawns',
    name: 'Fried Rice / Noodles - Hyderabad Style (Prawns)',
    description: 'Hyderabad style spicy prawn fried rice or noodles cooked with curry leaves and red pepper. [Allergens: Gluten, Soya, Egg, Shellfish, Celery]',
    price: 7.00,
    category: 'rice_noodles',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PRAWN_FRIED_RICE,
    available: true
  },

  // ==================== 6. COMBO SPECIAL ====================
  {
    id: 'combo-1',
    name: 'COMBO 1 (Rice / Noodles with Gravy)',
    description: 'Your choice of Fried Rice or Hakka Noodles served with hot Manchurian or Hot Garlic Gravy. [Allergens: Gluten, Soya, Egg]',
    price: 9.00,
    category: 'combos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_TRIPLE_COMBO,
    available: true
  },
  {
    id: 'combo-2',
    name: 'COMBO 2 (Rice / Noodles with 65 + Drink)',
    description: 'Your choice of Fried Rice or Hakka Noodles served with Chicken 65 or Paneer 65 plus a refreshing Soft Drink. [Allergens: Gluten, Soya, Egg]',
    price: 10.00,
    category: 'combos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_TRIPLE_COMBO,
    available: true
  },
  {
    id: 'combo-triple',
    name: 'TRIPLE COMBO (Rice and Noodles Mix and Gravy)',
    description: 'The legendary Bombay Triple Schezwan street meal! Szechwan fried rice mixed with Hakka noodles, crisp noodles and a bowl of spicy Schezwan Manchurian gravy. [Allergens: Gluten, Soya, Egg]',
    price: 10.99,
    category: 'combos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_TRIPLE_COMBO,
    available: true
  },

  // ==================== 7. OURS SPECIAL CHIPS ====================
  {
    id: 'chip-plain',
    name: 'Plain Chips',
    description: 'Crispy golden potato chips lightly salted. [Allergens: Gluten]',
    price: 2.99,
    category: 'chips',
    isVeg: true,
    isSpicy: false,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_PLAIN_CHIPS,
    available: true
  },
  {
    id: 'chip-masala',
    name: 'Masala Chips',
    description: 'Crispy fries tossed in aromatic Bombay chaat masala and chili spices. [Allergens: Gluten]',
    price: 3.50,
    category: 'chips',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: false,
    isPopular: true,
    image: IMG_MASALA_CHIPS,
    available: true
  },
  {
    id: 'chip-chilli',
    name: 'Chilli Chips',
    description: 'Crispy potato chips wok-tossed with dark soya sauce, green chillies, garlic and spring onion. [Allergens: Gluten, Soya]',
    price: 3.99,
    category: 'chips',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_CHILLI_CHIPS,
    available: true
  },
  {
    id: 'chip-szechwan',
    name: 'Szechwan Chips',
    description: 'Crispy fries tossed with hot Szechwan chili paste, garlic and peppers. [Allergens: Gluten, Soya]',
    price: 3.99,
    category: 'chips',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_SZECHWAN_CHIPS,
    available: true
  },
  {
    id: 'chip-bombay',
    name: 'Bombay Chips',
    description: 'Signature crispy potato chips served with cooling yoghurt mint sauce and cilantro. [Allergens: Gluten, Dairy]',
    price: 4.50,
    category: 'chips',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isChefSpecial: true,
    isPopular: true,
    image: IMG_BOMBAY_CHIPS,
    available: true
  }
];

export const INITIAL_OFFERS: SpecialOffer[] = [
  {
    id: 'off1',
    title: 'TRIPLE COMBO STREET FEAST',
    description: 'Rice & Noodles Mix with Rich Gravy & Crispy Noodle Topping.',
    discountBadge: 'ONLY £10.99',
    originalPrice: 13.50,
    offerPrice: 10.99,
    image: IMG_TRIPLE_COMBO,
    validDays: 'Everyday Delivery & Takeaway',
    code: 'TRIPLE10',
    linkedMenuItemId: 'combo-triple'
  },
  {
    id: 'off2',
    title: 'COMBO 2 (RICE/NOODLES + 65 + DRINK)',
    description: 'Your choice of Rice or Noodles with Chicken 65 or Paneer 65 & Soft Drink.',
    discountBadge: 'ONLY £10.00',
    originalPrice: 12.50,
    offerPrice: 10.00,
    image: IMG_TRIPLE_COMBO,
    validDays: 'Mon - Sun All Day',
    code: 'COMBO265',
    linkedMenuItemId: 'combo-2'
  },
  {
    id: 'off3',
    title: 'BOMBAY CHIPS SPECIAL',
    description: 'Add authentic Bombay Chips with yogurt mint dip to any main order for just £4.50!',
    discountBadge: 'POPULAR DIP',
    offerPrice: 4.50,
    image: IMG_BOMBAY_CHIPS,
    validDays: 'All Orders',
    code: 'BOMBAYCHIPS',
    linkedMenuItemId: 'chip-bombay'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Triple Schezwan Street Feast',
    category: 'chef_specials',
    image: IMG_TRIPLE_COMBO,
    caption: 'Bombay signature street combo with wok-tossed rice, noodles & rich gravy'
  },
  {
    id: 'g2',
    title: 'High-Flame Fiery Wok Station',
    category: 'restaurant',
    image: IMG_KITCHEN_WOK,
    caption: 'Authentic wok-hei cooking technique over roaring gas burners'
  },
  {
    id: 'g3',
    title: 'Signature Chicken Lollipops',
    category: 'chef_specials',
    image: IMG_CHICKEN_LOLLIPOP_DRY,
    caption: 'Frenched chicken drumettes coated in secret Indo-Chinese spices'
  },
  {
    id: 'g4',
    title: 'Dining Room & Ambient Atmosphere',
    category: 'ambience',
    image: IMG_AMBIENCE,
    caption: 'Warm and inviting seating perfect for family feasts and casual dining'
  },
  {
    id: 'g5',
    title: 'Sizzling Chilli King Prawns',
    category: 'food',
    image: IMG_CHILLI_PRAWNS,
    caption: 'Juicy whole prawns sautéed with bell peppers and green chillies'
  },
  {
    id: 'g6',
    title: 'Master Chef Plating & Finishing',
    category: 'restaurant',
    image: IMG_CHEF_PLATING,
    caption: 'Every wok order freshly prepared and garnished with scallions'
  },
  {
    id: 'g7',
    title: 'Sizzling Chilli Paneer',
    category: 'food',
    image: IMG_CHILLI_PANEER,
    caption: 'Crispy golden paneer cubes tossed with spring onions and dark soy'
  },
  {
    id: 'g8',
    title: 'Hot Garlic Chicken',
    category: 'food',
    image: IMG_HOT_GARLIC_CHICKEN,
    caption: 'Succulent diced chicken tossed in fiery roasted red garlic sauce'
  },
  {
    id: 'g9',
    title: 'Steamed Bombay Dumplings (Momos)',
    category: 'food',
    image: IMG_MOMO_STEAM,
    caption: 'Handcrafted momos served with fiery Bombay red chutney dip'
  },
  {
    id: 'g10',
    title: 'Bombay Manchow Soup with Crispy Noodles',
    category: 'food',
    image: IMG_SOUP,
    caption: 'Aromatic dark soya broth topped with signature crispy fried noodles'
  },
  {
    id: 'g11',
    title: 'Hyderabad Spicy Chicken Rice',
    category: 'chef_specials',
    image: IMG_HYDERABAD_CHICKEN_RICE,
    caption: 'Long-grain basmati tossed with fragrant curry leaves & green chillies'
  },
  {
    id: 'g12',
    title: 'Andhra Spicy King Prawns 65',
    category: 'chef_specials',
    image: IMG_ANDHRA_PRAWN_65,
    caption: 'Deep-fried marinated king prawns tempered with regional spices'
  },
  {
    id: 'g13',
    title: 'Burnt Garlic Paneer Fried Rice',
    category: 'food',
    image: IMG_BURNT_GARLIC_PANEER_RICE,
    caption: 'Aromatic fried rice loaded with crispy golden garlic chips & paneer'
  },
  {
    id: 'g14',
    title: 'Crispy Veg Hakka Noodles',
    category: 'food',
    image: IMG_VEG_HAKKA_NOODLES,
    caption: 'Street-style thin noodles stir-fried with julienned vegetables'
  },
  {
    id: 'g15',
    title: 'Crispy Gobi Manchurian',
    category: 'food',
    image: IMG_GOBI_MANCHURIAN,
    caption: 'Crunchy cauliflower florets glazed in sweet-tangy-spicy Manchurian sauce'
  },
  {
    id: 'g16',
    title: 'Bombay Masala Chips with Mint Yogurt',
    category: 'food',
    image: IMG_BOMBAY_CHIPS,
    caption: 'Crispy potato chips dusted in house chaat spice with cool yogurt dip'
  },
  {
    id: 'g17',
    title: 'Hot Garlic King Prawns',
    category: 'chef_specials',
    image: IMG_HOT_GARLIC_PRAWNS,
    caption: 'Plump king prawns in intense slow-roasted garlic and chilli glaze'
  },
  {
    id: 'g18',
    title: 'Aromatic Lemongrass Tom Yum Soup',
    category: 'food',
    image: IMG_TOM_YUM_CHICKEN,
    caption: 'Tangy and spicy Thai-Chinese broth infused with fresh galangal & herbs'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Aarav Patel',
    rating: 5,
    date: '1 day ago',
    year: 2026,
    comment: 'Finally authentic Bombay style Chinese in Hounslow! The Manchow soup with crispy noodles and Chicken Lollipop taste exactly like Mumbai roadside stalls.',
    source: 'Google',
    recommendedDish: 'Chicken Lollipop & Manchow Soup',
    verified: true
  },
  {
    id: 'r2',
    author: 'Priya Sharma',
    rating: 5,
    date: '3 days ago',
    year: 2026,
    comment: 'The Triple Combo is unreal! Generous portion of Schezwan rice and noodles with rich gravy. Will definitely be ordering weekly.',
    source: 'Google',
    recommendedDish: 'TRIPLE COMBO',
    verified: true
  },
  {
    id: 'r3',
    author: 'Rohan Mehta',
    rating: 5,
    date: '1 week ago',
    year: 2026,
    comment: 'Bombay Chilli Dumplings and Masala Chips are top tier. Wok flavor is genuine, quick service and 100% Halal.',
    source: 'Google',
    recommendedDish: 'Bombay Dumplings & Masala Chips',
    verified: true
  },
  {
    id: 'r4',
    author: 'Aisha Khan',
    rating: 5,
    date: '2 weeks ago',
    year: 2026,
    comment: 'Hosted our family get-together in the VIP dining section. The Schezwan Fried Rice, Dragon Chicken, and Veg Momos blew everyone away.',
    source: 'TripAdvisor',
    recommendedDish: 'Dragon Chicken & Veg Steamed Momos',
    verified: true
  },
  {
    id: 'r5',
    author: 'Marcus Davies',
    rating: 5,
    date: '3 weeks ago',
    year: 2026,
    comment: 'Best Indo-Chinese restaurant in West London without a doubt. The wok hei (breath of the wok) in their Hakka Noodles is absolute perfection.',
    source: 'Google',
    recommendedDish: 'Chicken Hakka Noodles',
    verified: true
  },
  {
    id: 'r6',
    author: 'Sneha Kulkarni',
    rating: 5,
    date: '1 month ago',
    year: 2026,
    comment: 'Brought me straight back to Bombay’s Khau Galli! The Paneer Chilli Dry and Hot & Sour Soup have that exact spicy-tangy street kick.',
    source: 'Google',
    recommendedDish: 'Chilli Paneer Dry',
    verified: true
  },
  {
    id: 'r7',
    author: 'David Sterling',
    rating: 5,
    date: '1 month ago',
    year: 2026,
    comment: 'The burnt garlic fried rice paired with Manchurian gravy is sensational. Spotless dining room, attentive waitstaff, and fast turnaround.',
    source: 'Direct',
    recommendedDish: 'Burnt Garlic Fried Rice',
    verified: true
  },
  {
    id: 'r8',
    author: 'Zainab Begum',
    rating: 5,
    date: '2 months ago',
    year: 2026,
    comment: 'Loved that everything is 100% Halal certified! Crispy Thread Paneer and Bombay Chilli Prawns are must-tries for any seafood lover.',
    source: 'Google',
    recommendedDish: 'Bombay Chilli Prawns',
    verified: true
  },
  {
    id: 'r9',
    author: 'Vikram Singhania',
    rating: 5,
    date: '2 months ago',
    year: 2026,
    comment: 'Booked their banquet hall for a corporate dinner of 25 people. Flawless service, personalized set menu, and every single dish arrived piping hot.',
    source: 'TripAdvisor',
    recommendedDish: 'Chef’s Gold Banquet Platter',
    verified: true
  },
  {
    id: 'r10',
    author: 'Chloe Bennett',
    rating: 5,
    date: '3 months ago',
    year: 2026,
    comment: 'Such vibrant flavours! The Sweet Corn Chicken Soup was comforting and the Schezwan Chicken Momos were juicy, plump, and deeply flavorful.',
    source: 'Google',
    recommendedDish: 'Schezwan Chicken Momos',
    verified: true
  },
  {
    id: 'r11',
    author: 'Rajesh Joshi',
    rating: 5,
    date: '3 months ago',
    year: 2026,
    comment: 'As a strict vegetarian from Mumbai, their Jain & Vegetarian options are unmatched. Veg Manchurian and Triple Schezwan Rice made my weekend.',
    source: 'Google',
    recommendedDish: 'Veg Manchurian Gravy',
    verified: true
  },
  {
    id: 'r12',
    author: 'Fatima Al-Mansoor',
    rating: 5,
    date: '4 months ago',
    year: 2026,
    comment: 'The ambience is gorgeous with modern Bombay aesthetics. Chicken Lollipop with their signature fiery Schezwan dip is addictive.',
    source: 'Direct',
    recommendedDish: 'Masala Chicken Lollipop',
    verified: true
  },
  {
    id: 'r13',
    author: 'Liam O’Connor',
    rating: 5,
    date: '4 months ago',
    year: 2026,
    comment: 'Massive portions and incredible value for money. The Singapore Noodles and Crispy Salt & Pepper Squid were five stars.',
    source: 'Google',
    recommendedDish: 'Singapore Vermicelli Noodles',
    verified: true
  },
  {
    id: 'r14',
    author: 'Ananya Deshmukh',
    rating: 5,
    date: '5 months ago',
    year: 2026,
    comment: 'We travel 45 minutes just to eat their Bombay Street Style Chowmein and Crispy Corn Salt & Pepper. Truly unmissable dining spot.',
    source: 'TripAdvisor',
    recommendedDish: 'Street Style Chowmein',
    verified: true
  },
  {
    id: 'r15',
    author: 'Tariq Mahmood',
    rating: 5,
    date: '5 months ago',
    year: 2026,
    comment: 'Superb service from Rohit and the team. The table ordering via POS with SMS invoice was ultra seamless and modern.',
    source: 'Google',
    recommendedDish: 'Crispy Lamb in Black Pepper',
    verified: true
  },
  {
    id: 'r16',
    author: 'Natasha Ivanova',
    rating: 5,
    date: '6 months ago',
    year: 2026,
    comment: 'First time trying Indo-Chinese cuisine and I am obsessed. The dumplings are so tender and the chilli garlic gravy is to die for.',
    source: 'Google',
    recommendedDish: 'Fried Chicken Momos',
    verified: true
  },
  {
    id: 'r17',
    author: 'Karan Malhotra',
    rating: 5,
    date: '6 months ago',
    year: 2026,
    comment: 'The Schezwan Fried Rice has that genuine fiery red Bombay color and aroma without artificial taste. Top marks to the Mumbai head chefs.',
    source: 'Google',
    recommendedDish: 'Schezwan Egg Fried Rice',
    verified: true
  },
  {
    id: 'r18',
    author: 'Sophia Taylor',
    rating: 5,
    date: '7 months ago',
    year: 2026,
    comment: 'Came for Sunday lunch with friends. Warm atmosphere, polite servers, and the mocktails pair great with spicy starters.',
    source: 'Direct',
    recommendedDish: 'Lychee Chilli Mocktail & Paneer 65',
    verified: true
  },
  {
    id: 'r19',
    author: 'Devendra Verma',
    rating: 5,
    date: '8 months ago',
    year: 2026,
    comment: 'Celebrated our 25th Wedding Anniversary here. Outstanding hospitality, custom seating arrangement, and exceptional banquet food.',
    source: 'Google',
    recommendedDish: 'Anniversary Special Banquet Platter',
    verified: true
  },
  {
    id: 'r20',
    author: 'Rehan Siddiqui',
    rating: 5,
    date: '9 months ago',
    year: 2026,
    comment: 'The Wok-Tossed Chilli Chicken is crispy on the outside and juicy inside. Easily the top dining spot on Hounslow High Street.',
    source: 'TripAdvisor',
    recommendedDish: 'Wok-Tossed Chilli Chicken',
    verified: true
  },
  {
    id: 'r21',
    author: 'Maya Sen',
    rating: 5,
    date: '10 months ago',
    year: 2026,
    comment: 'Extra spicy Manchow soup cured my cold instantly! Crunchy fried noodles on top were fresh and delicious. Love this place!',
    source: 'Google',
    recommendedDish: 'Extra Spicy Manchow Soup',
    verified: true
  },
  {
    id: 'r22',
    author: 'James Wilson',
    rating: 5,
    date: '11 months ago',
    year: 2026,
    comment: 'Great location near Treaty Centre. Clean tables, fast lunch specials, and the Bombay Masala Chips are legendary.',
    source: 'Google',
    recommendedDish: 'Bombay Masala Chips',
    verified: true
  },
  {
    id: 'r23',
    author: 'Simran Kaur',
    rating: 5,
    date: '11 months ago',
    year: 2026,
    comment: 'Their Kurkure Momos and Chilli Garlic Noodles have set a new benchmark. Highly recommended for party bookings.',
    source: 'Google',
    recommendedDish: 'Kurkure Momos',
    verified: true
  },
  {
    id: 'r24',
    author: 'Harpreet Singh',
    rating: 5,
    date: '11 months ago',
    year: 2026,
    comment: 'Outstanding food quality and generous portions. The spicy Szechuan gravy with steamed basmati rice is pure comfort food.',
    source: 'Direct',
    recommendedDish: 'Szechuan Chicken Gravy',
    verified: true
  },
  {
    id: 'r25',
    author: 'Emily Watson',
    rating: 5,
    date: '12 months ago',
    year: 2026,
    comment: 'Staff was so welcoming and helped us choose dishes according to our mild spice preference. 10/10 dining experience.',
    source: 'Google',
    recommendedDish: 'Mild Garlic Butter Noodles',
    verified: true
  }
];

export const INITIAL_SETTINGS = {
  name: 'INDO CHINESE',
  tagline: 'THE REAL TASTE OF BOMBAY',
  description: 'Authentic Bombay street style Indo-Chinese wok specialities in Hounslow, London. Handcrafted momos, chicken lollipops, triple schezwan rice & noodles.',
  address: '124 High Street',
  city: 'Hounslow, London',
  postcode: 'TW3 1NA',
  country: 'United Kingdom',
  phone: '+44 20 8570 9888',
  email: 'info@indochinese-restaurant.com',
  whatsapp: '+447123456789',
  latitude: 51.4682,
  longitude: -0.3609,
  priceRange: '££',
  openingHours: [
    { day: 'Monday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Tuesday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Wednesday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Thursday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Friday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Saturday', open: '10:30 AM', close: '09:30 PM' },
    { day: 'Sunday', open: '10:30 AM', close: '09:30 PM' }
  ],
  googleMapsUrl: 'https://maps.google.com/?q=124+High+Street+Hounslow',
  googleBusinessProfileUrl: 'https://g.page/r/indochinese-hounslow',
  instagramUrl: 'https://instagram.com/indochineserestaurant',
  facebookUrl: 'https://facebook.com/indochineserestaurant',
  tiktokUrl: 'https://tiktok.com/@indochineserestaurant',
  orderingEnabled: true,
  reservationsEnabled: true,
  minOrderDelivery: 15,
  deliveryFee: 2.50,
  freeDeliveryThreshold: 35
};
