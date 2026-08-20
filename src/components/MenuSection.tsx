import React, { useState, useEffect } from 'react';
import { Search, Flame, Leaf, Sparkles, SlidersHorizontal, Info, Heart, Eye, ArrowRight, X, Plus, ShoppingBag, Check } from 'lucide-react';
import { MenuCategory, MenuItem } from '../types';
import { DishDetailModal } from './DishDetailModal';
import { CravingFinder } from './CravingFinder';
import { INITIAL_CATEGORIES, INITIAL_MENU_ITEMS } from '../data/initialData';

interface MenuSectionProps {
  categories?: MenuCategory[];
  items?: MenuItem[];
  menuItems?: MenuItem[];
  onBookTable?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  categories = [],
  items,
  menuItems,
  onBookTable
}) => {
  const safeCategories = (categories && categories.length > 0) ? categories : INITIAL_CATEGORIES;

  // Deduplicate safeItems by normalized name to guarantee 0 duplicates under any network condition
  const safeItems = React.useMemo(() => {
    const raw = (items && items.length > 0) ? items : (menuItems && menuItems.length > 0) ? menuItems : INITIAL_MENU_ITEMS;
    const seen = new Set<string>();
    return raw.filter(item => {
      const norm = (item.name || '').trim().toLowerCase();
      if (!norm || seen.has(norm)) return false;
      seen.add(norm);
      return true;
    });
  }, [items, menuItems]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [spicyOnly, setSpicyOnly] = useState<boolean>(false);
  const [chefSpecialsOnly, setChefSpecialsOnly] = useState<boolean>(false);
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Favorites state persisted in localStorage
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('indochinese_favorite_dishes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active dish detail modal
  const [activeDish, setActiveDish] = useState<MenuItem | null>(null);

  const toggleFavorite = (item: MenuItem) => {
    setFavoriteIds(prev => {
      const updated = prev.includes(item.id)
        ? prev.filter(id => id !== item.id)
        : [...prev, item.id];
      try {
        localStorage.setItem('indochinese_favorite_dishes', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save favorites:', e);
      }
      return updated;
    });
  };

  const isCategoryMatch = (itemCat: string, targetCat: string) => {
    if (targetCat === 'all') return true;
    if (itemCat === targetCat) return true;
    
    // Normalized aliases
    if (targetCat === 'soups' && (itemCat === 'soup' || itemCat === 'soups')) return true;
    if (targetCat === 'momos' && (itemCat === 'momos' || itemCat === 'momo' || itemCat === 'dumplings')) return true;
    if (targetCat === 'veg_starters' && (itemCat === 'veg_starters' || itemCat === 'starters' || itemCat === 'vegetarian')) return true;
    if (targetCat === 'nonveg_starters' && (itemCat === 'nonveg_starters' || itemCat === 'chicken' || itemCat === 'meat' || itemCat === 'seafood')) return true;
    if (targetCat === 'rice_noodles' && (itemCat === 'rice_noodles' || itemCat === 'rice' || itemCat === 'noodles')) return true;
    if (targetCat === 'combos' && (itemCat === 'combos' || itemCat === 'combo')) return true;
    if (targetCat === 'chips' && (itemCat === 'chips' || itemCat === 'chip')) return true;

    return false;
  };

  // Filter items
  const filteredItems = safeItems.filter((item) => {
    // Favorites only
    if (favoritesOnly && !favoriteIds.includes(item.id)) {
      return false;
    }
    // Category match
    if (!isCategoryMatch(item.category, selectedCategory)) {
      return false;
    }
    // Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCategory) return false;
    }
    // Veg/NonVeg
    if (vegFilter === 'veg' && !item.isVeg) return false;
    if (vegFilter === 'nonveg' && item.isVeg) return false;

    // Spicy
    if (spicyOnly && !item.isSpicy) return false;

    // Chef Specials
    if (chefSpecialsOnly && !item.isChefSpecial) return false;

    return true;
  });

  const hasActiveFilters = searchQuery !== '' || vegFilter !== 'all' || spicyOnly || chefSpecialsOnly || favoritesOnly || selectedCategory !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setVegFilter('all');
    setSpicyOnly(false);
    setChefSpecialsOnly(false);
    setFavoritesOnly(false);
  };

  return (
    <section id="menu" className="py-20 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISCOVER OUR DIGITAL MENU</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">INDO CHINESE</span> MENU
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Freshly prepared to order using authentic high-heat woks, house chili condiments, and traditional Hakka seasonings.
          </p>
        </div>

        {/* Smart Craving Matcher Quiz Integration */}
        <CravingFinder
          items={safeItems}
          onSelectDish={(item) => setActiveDish(item)}
        />

        {/* Official Allergen Key Banner from Menu Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-xs text-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider block sm:inline mr-2">ALLERGEN KEY:</span>
                <span className="text-slate-600">Please ask our staff if you have any allergies before placing your order.</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-700">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">G</strong> Gluten</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">S</strong> Soya</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">N</strong> Nuts</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">D</strong> Dairy</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">E</strong> Egg</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">SF</strong> Shellfish</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">SE</strong> Sesame</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">MU</strong> Mustard</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200"><strong className="text-red-600">C</strong> Celery</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar Controls */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes (e.g. Chilli Paneer, Noodles)..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              {/* Veg Toggle */}
              <div className="bg-white border border-slate-300 rounded-xl p-1 flex items-center space-x-1">
                <button
                  onClick={() => setVegFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    vegFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setVegFilter('veg')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition-all ${
                    vegFilter === 'veg' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span>Veg Only</span>
                </button>
                <button
                  onClick={() => setVegFilter('nonveg')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    vegFilter === 'nonveg' ? 'bg-red-50 text-red-700 border border-red-300' : 'text-slate-600 hover:text-red-700'
                  }`}
                >
                  <span>Non-Veg</span>
                </button>
              </div>

              {/* Spicy Filter */}
              <button
                onClick={() => setSpicyOnly(!spicyOnly)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  spicyOnly
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-600" />
                <span>Spicy Only</span>
              </button>

              {/* Chef Specials Filter */}
              <button
                onClick={() => setChefSpecialsOnly(!chefSpecialsOnly)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  chefSpecialsOnly
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Chef Specials</span>
              </button>

              {/* Favorites Wishlist Filter */}
              <button
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  favoritesOnly
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-rose-600 text-rose-600' : 'text-rose-500'}`} />
                <span>Saved ({favoriteIds.length})</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin border-t border-slate-200 pt-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              All Categories ({safeItems.length})
            </button>
            {safeCategories.map((cat) => {
              const count = safeItems.filter((i) => isCategoryMatch(i.category, cat.id)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Active Filter Chips bar if any filters are active */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600 animate-fadeIn">
              <span className="font-bold text-slate-700">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-semibold">
                  Category: {safeCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-red-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {vegFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold">
                  {vegFilter === 'veg' ? 'Vegetarian Only' : 'Non-Veg Only'}
                  <button onClick={() => setVegFilter('all')} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {spicyOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold">
                  Spicy Only
                  <button onClick={() => setSpicyOnly(false)} className="hover:text-rose-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {chefSpecialsOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-semibold">
                  Chef Specials Only
                  <button onClick={() => setChefSpecialsOnly(false)} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {favoritesOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold">
                  Saved Dishes
                  <button onClick={() => setFavoritesOnly(false)} className="hover:text-rose-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 font-semibold">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-slate-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="ml-auto text-red-600 hover:text-red-800 font-bold underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Menu Grid Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <Info className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-lg font-bold text-slate-900 font-serif">No dishes found matching your current filters</p>
            <p className="text-xs text-slate-600 mt-1">Try resetting the filter criteria to see all dishes from the menu.</p>
            <button
              onClick={resetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              Reset All Filters & View All Dishes ({safeItems.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isFav = favoriteIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-red-300 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
                  onClick={() => setActiveDish(item)}
                >
                  {/* Dish Image Header */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = item.isVeg
                          ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                          : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

                    {/* Dietary Badges */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      {item.isVeg ? (
                        <span className="bg-white/90 border border-emerald-300 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md flex items-center space-x-1 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          <span>VEG</span>
                        </span>
                      ) : (
                        <span className="bg-white/90 border border-red-300 text-red-800 text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-md flex items-center space-x-1 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                          <span>NON-VEG</span>
                        </span>
                      )}

                      {item.isChefSpecial && (
                        <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-xs flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>CHEF SPECIAL</span>
                        </span>
                      )}
                    </div>

                    {/* Spice Level & Favorite Quick Toggle */}
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                      {item.isSpicy && (
                        <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-md border border-red-200 flex items-center space-x-0.5 shadow-xs">
                          {[...Array(item.spiceLevel || 1)].map((_, idx) => (
                            <Flame key={idx} className="w-3.5 h-3.5 text-red-600 fill-red-600 animate-pulse" />
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item);
                        }}
                        className={`p-1.5 rounded-md backdrop-blur-md border transition-all shadow-xs ${
                          isFav
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white/90 text-slate-600 border-slate-200 hover:text-rose-600'
                        }`}
                        title={isFav ? 'Remove favorite' : 'Save dish'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {item.isPopular && (
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded shadow-xs">
                        ★ Most Ordered
                      </span>
                    )}

                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Explore Dish</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 font-serif group-hover:text-red-600 transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-lg font-extrabold text-slate-900 font-serif">
                          £{item.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider truncate">
                        {item.category.replace('_', ' ')}
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveDish(item)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                        title="View dish details, allergens & spice level"
                      >
                        <span>View Dish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dish Detail & Customization Modal */}
        <DishDetailModal
          item={activeDish}
          isOpen={!!activeDish}
          onClose={() => setActiveDish(null)}
          isFavorite={activeDish ? favoriteIds.includes(activeDish.id) : false}
          onToggleFavorite={toggleFavorite}
          onSelectPairingItem={(pairingItem) => setActiveDish(pairingItem)}
          allItems={safeItems}
        />
      </div>
    </section>
  );
};

