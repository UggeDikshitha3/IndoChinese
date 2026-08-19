import React, { useState } from 'react';
import { Sparkles, Flame, RefreshCw, ArrowRight, Check, Heart, HelpCircle, Utensils } from 'lucide-react';
import { MenuItem } from '../types';

interface CravingFinderProps {
  items: MenuItem[];
  onSelectDish: (item: MenuItem) => void;
}

export const CravingFinder: React.FC<CravingFinderProps> = ({ items, onSelectDish }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 'results'>(1);
  const [cravingType, setCravingType] = useState<string>('all');
  const [dietaryType, setDietaryType] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [spicePreference, setSpicePreference] = useState<'mild' | 'medium' | 'fiery'>('medium');
  const [matchedItems, setMatchedItems] = useState<MenuItem[]>([]);

  const handleStart = () => {
    setIsOpen(true);
    setStep(1);
  };

  const handleReset = () => {
    setStep(1);
    setCravingType('all');
    setDietaryType('all');
    setSpicePreference('medium');
    setMatchedItems([]);
  };

  const calculateMatches = () => {
    const safeItems = items || [];
    let filtered = safeItems.filter(item => {
      // Dietary match
      if (dietaryType === 'veg' && !item.isVeg) return false;
      if (dietaryType === 'nonveg' && item.isVeg) return false;

      // Spice preference match
      if (spicePreference === 'mild' && (item.spiceLevel || 1) > 1) return false;
      if (spicePreference === 'fiery' && (!item.isSpicy || (item.spiceLevel || 1) < 2)) return false;

      // Craving type match
      if (cravingType === 'soup' && !item.category.includes('soup')) return false;
      if (cravingType === 'momo' && !item.category.includes('momo') && !item.name.toLowerCase().includes('momo') && !item.name.toLowerCase().includes('dumpling')) return false;
      if (cravingType === 'noodles' && !item.name.toLowerCase().includes('noodle') && !item.category.includes('noodle')) return false;
      if (cravingType === 'rice' && !item.name.toLowerCase().includes('rice') && !item.category.includes('rice')) return false;
      if (cravingType === 'starter' && !item.category.includes('starter') && !item.category.includes('special')) return false;

      return true;
    });

    if (filtered.length === 0) {
      filtered = safeItems.filter(i => (dietaryType === 'veg' ? i.isVeg : dietaryType === 'nonveg' ? !i.isVeg : true)).slice(0, 3);
    }

    setMatchedItems(filtered.slice(0, 3));
    setStep('results');
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-900/40 relative overflow-hidden mb-12">
      {/* Background Glow Accents */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {!isOpen ? (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Wok Taste Matcher</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-tight">
              Not sure what to order tonight?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Answer 3 quick craving questions to find your personalized Indo-Chinese culinary match in seconds.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-6 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center space-x-2 whitespace-nowrap"
          >
            <Utensils className="w-4 h-4 text-amber-300" />
            <span>Launch Craving Matcher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm sm:text-base font-serif">Wok Taste Matcher</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>{step === 'results' ? 'Your Matches' : `Step ${step} of 3`}</span>
              <button
                onClick={handleReset}
                className="p-1 hover:text-white transition-colors"
                title="Restart quiz"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* STEP 1: Craving Type */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-lg font-bold text-white font-serif">
                1. What kind of texture & dish are you craving?
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: '🔥 Surprise Me / Open to All', desc: 'Any signature item' },
                  { id: 'noodles', label: '🍜 Hakka Noodles', desc: 'Wok-tossed street noodles' },
                  { id: 'rice', label: '🍚 Szechwan / Fried Rice', desc: 'Aromatic basmati stir fry' },
                  { id: 'momo', label: '🥟 Bombay Momos', desc: 'Steamed, fried or chilli' },
                  { id: 'starter', label: '🍗 Crispy Starters', desc: '65, Manchurian, Rolls' },
                  { id: 'soup', label: '🥣 Comforting Soups', desc: 'Manchow, Hot & Sour' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCravingType(c.id);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      cravingType === c.id
                        ? 'bg-red-600/30 border-red-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold block text-white mb-0.5">{c.label}</span>
                    <span className="text-[11px] text-slate-400">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Dietary Type */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-lg font-bold text-white font-serif">
                2. What is your dietary preference?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'all', label: '🥗 Both Veg & Non-Veg', desc: 'Show all delicious options' },
                  { id: 'veg', label: '🌿 100% Pure Vegetarian', desc: 'Paneer, Mushroom, Tofu, Veggies' },
                  { id: 'nonveg', label: '🍗 Halal Chicken & Seafood', desc: 'Chicken, King Prawns' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setDietaryType(d.id as any);
                      setStep(3);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      dietaryType === d.id
                        ? 'bg-red-600/30 border-red-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-bold block text-white mb-1">{d.label}</span>
                    <span className="text-xs text-slate-400">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Spice Preference */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h4 className="text-lg font-bold text-white font-serif">
                3. How much heat can you handle?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'mild', label: '🌶️ Mild & Flavorful', desc: 'Subtle spices, garlic, ginger, no burn' },
                  { id: 'medium', label: '🌶️🌶️ Medium Authentic', desc: 'Classic Indo-Chinese savory kick' },
                  { id: 'fiery', label: '🌶️🌶️🌶️ Fiery Szechwan Wok', desc: 'Full Mumbai street spice experience' },
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSpicePreference(s.id as any);
                      calculateMatches();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      spicePreference === s.id
                        ? 'bg-red-600/30 border-red-500 text-white font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-sm font-bold block text-white mb-1">{s.label}</span>
                    <span className="text-xs text-slate-400">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS VIEW */}
          {step === 'results' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white font-serif">
                    🎯 Top 3 Dishes Handpicked For You
                  </h4>
                  <p className="text-xs text-slate-300">
                    Based on your craving profile: {dietaryType.toUpperCase()} • {spicePreference.toUpperCase()} SPICE
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  Try Again
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {matchedItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectDish(item)}
                    className="bg-white/10 hover:bg-white/15 border border-white/20 hover:border-amber-400/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="relative h-32 overflow-hidden bg-slate-800">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = item.isVeg
                            ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                            : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        {item.isVeg ? (
                          <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">VEG</span>
                        ) : (
                          <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded">NON-VEG</span>
                        )}
                      </div>
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 text-amber-300 text-xs font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        £{item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h5 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors font-serif">
                          {item.name}
                        </h5>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-amber-400 font-semibold">
                        <span>Click to view details</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
