import React, { useState } from 'react';
import { X, Flame, Sparkles, Heart, Clock, Utensils, CheckCircle2, AlertCircle, Share2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { MenuItem } from '../types';

interface DishDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (item: MenuItem) => void;
  onSelectPairingItem?: (item: MenuItem) => void;
  allItems: MenuItem[];
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectPairingItem,
  allItems,
}) => {
  const [selectedSpice, setSelectedSpice] = useState<number>(item?.spiceLevel || 1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !item) return null;

  // Addons available for Indo-Chinese cuisine
  const addonOptions = [
    { id: 'extra_crispy', label: 'Extra Crispy & Dry Wok Tossed', price: 0.00 },
    { id: 'chili_oil', label: 'House Szechwan Chili Oil Dip (+£0.80)', price: 0.80 },
    { id: 'fried_garlic', label: 'Golden Fried Garlic Crisps (+£0.50)', price: 0.50 },
    { id: 'extra_spring_onion', label: 'Extra Fresh Spring Onions & Cilantro', price: 0.00 },
  ];

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Find complementary dishes
  const recommendedPairings = (allItems || [])
    .filter(i => i.id !== item.id && (item.category.includes('rice') ? i.category.includes('starters') || i.category.includes('chicken') || i.category.includes('vegetarian') : i.category.includes('rice') || i.category.includes('noodles')))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/#menu`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-scaleUp text-slate-800 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-colors shadow-md"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = item.isVeg
                ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Badges Floating on Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {item.isVeg ? (
                  <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    VEGETARIAN
                  </span>
                ) : (
                  <span className="bg-red-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    100% HALAL NON-VEG
                  </span>
                )}

                {item.isChefSpecial && (
                  <span className="bg-amber-400 text-slate-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    CHEF'S SIGNATURE
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight drop-shadow-md">
                {item.name}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-serif block drop-shadow-md">
                £{item.price.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Favorite & Share Buttons */}
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(item)}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-md flex items-center gap-1.5 text-xs font-bold ${
                isFavorite
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-white/80 text-slate-700 hover:bg-white'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Favorited' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-md transition-all shadow-md"
              title="Share dish link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copiedLink && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md animate-fadeIn">
                Copied Link!
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Culinary Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              About This Dish & Wok Preparation
            </h4>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-0.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>Prep Time</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">10-14 Mins</span>
            </div>

            <div className="border-x border-slate-200">
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Wok Heat</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">High Flame Stir</span>
            </div>

            <div>
              <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs mb-0.5">
                <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                <span>Portion Size</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800">Regular (Serves 1-2)</span>
            </div>
          </div>

          {/* Spice Level Adjustment Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                <span>Select Your Preferred Heat Level</span>
              </label>
              <span className="text-xs font-bold text-red-600">
                {selectedSpice === 1 ? 'Mild & Aromatic' : selectedSpice === 2 ? 'Medium Spicy' : selectedSpice === 3 ? 'Hot Szechwan' : 'Extra Hot Bombay Wok'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { level: 1, label: 'Mild', peppers: '🌶️' },
                { level: 2, label: 'Medium', peppers: '🌶️🌶️' },
                { level: 3, label: 'Hot', peppers: '🌶️🌶️🌶️' },
                { level: 4, label: 'Fiery', peppers: '🌶️🌶️🌶️🌶️' },
              ].map(s => (
                <button
                  key={s.level}
                  type="button"
                  onClick={() => setSelectedSpice(s.level)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedSpice === s.level
                      ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs block mb-0.5">{s.peppers}</span>
                  <span className="text-xs font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Wok Add-ons */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
              Kitchen Add-ons & Condiments
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {addonOptions.map(addon => {
                const isSelected = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-50/80 border-amber-400 text-amber-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>{addon.label}</span>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300 text-slate-400'
                    }`}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Chef Instruction Note */}
          <div>
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
              Special Cooking Notes
            </label>
            <input
              type="text"
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              placeholder="e.g. Less oil, extra crispy, no ajinomoto, sauce on the side..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Complementary Chef Pairings */}
          {recommendedPairings.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tastes Best Paired With</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {recommendedPairings.map(pairItem => (
                  <div
                    key={pairItem.id}
                    onClick={() => onSelectPairingItem && onSelectPairingItem(pairItem)}
                    className="bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-300 rounded-xl p-2.5 flex items-center space-x-2.5 cursor-pointer transition-all group"
                  >
                    <img
                      src={pairItem.image}
                      alt={pairItem.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-bold text-slate-800 truncate group-hover:text-red-600 font-serif">
                        {pairItem.name}
                      </h5>
                      <span className="text-[11px] font-extrabold text-amber-700">
                        £{pairItem.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleFavorite(item)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isFavorite
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isFavorite ? 'Saved to Favorites' : 'Save Dish'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
