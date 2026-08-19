import React, { useState } from 'react';
import { Box, Sparkles, Check, Flame, ArrowRight, ShieldCheck, Heart, Plus, RotateCcw } from 'lucide-react';
import { MenuItem } from '../types';

interface WokBoxBuilderProps {
  onBookTable: () => void;
  onExploreMenu: () => void;
}

export const WokBoxBuilder: React.FC<WokBoxBuilderProps> = ({ onBookTable, onExploreMenu }) => {
  const [base, setBase] = useState('hakka_noodles');
  const [protein, setProtein] = useState('chilli_chicken');
  const [sauce, setSauce] = useState('szechwan_fire');
  const [side, setSide] = useState('spring_rolls');
  const [isAdded, setIsAdded] = useState(false);

  const bases = [
    { id: 'hakka_noodles', name: 'Classic Veg Hakka Noodles', cal: '320 kcal', veg: true },
    { id: 'egg_fried_rice', name: 'Wok Egg Fried Rice', cal: '340 kcal', veg: false },
    { id: 'szechwan_rice', name: 'Fiery Szechwan Basmati Rice', cal: '350 kcal', veg: true },
    { id: 'burnt_garlic_noodles', name: 'Burnt Garlic Hakka Noodles', cal: '330 kcal', veg: true },
  ];

  const proteins = [
    { id: 'chilli_chicken', name: '100% Halal Chilli Chicken', price: 0, veg: false },
    { id: 'paneer_65', name: 'Crispy Sautéed Paneer 65', price: 0, veg: true },
    { id: 'veg_manchurian', name: 'Golden Veg Manchurian Dumplings', price: 0, veg: true },
    { id: 'king_prawns', name: 'Jumbo Wok King Prawns (+£2.50)', price: 2.50, veg: false },
    { id: 'crispy_tofu', name: 'Organic Crispy Chilli Tofu', price: 0, veg: true },
  ];

  const sauces = [
    { id: 'szechwan_fire', name: 'Bombay Szechwan Fire (🌶️🌶️🌶️)', desc: 'Crushed red chilies, Sichuan peppercorns, garlic' },
    { id: 'sweet_garlic_soy', name: 'Sweet Garlic Soy Glaze (Mild)', desc: 'Dark soy, toasted sesame, honey, mild ginger' },
    { id: 'manchurian_gravy', name: 'Rich Manchurian Gravy (Medium 🌶️)', desc: 'Coriander root, green chilies, dark aromatics' },
    { id: 'black_pepper_wok', name: 'Crushed Black Pepper Wok (🌶️🌶️)', desc: 'Coarse ground peppercorns, scallions, onion' },
  ];

  const sides = [
    { id: 'spring_rolls', name: '2x Crispy Veg Spring Rolls', veg: true },
    { id: 'chicken_momo', name: '2x Steamed Chicken Momos', veg: false },
    { id: 'masala_chips', name: 'Bombay Masala Chips', veg: true },
    { id: 'hot_sour_soup', name: 'Cup of Hot & Sour Soup', veg: true },
  ];

  const selectedProteinObj = proteins.find(p => p.id === protein) || proteins[0];
  const totalPrice = 13.99 + selectedProteinObj.price;
  const originalValue = 18.50 + selectedProteinObj.price;
  const savings = originalValue - totalPrice;

  const handleSaveBox = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 3500);
  };

  return (
    <section id="wok-builder" className="py-16 bg-slate-100 text-slate-800 border-y border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold tracking-wider uppercase mb-3">
            <Box className="w-3.5 h-3.5 text-amber-700" />
            <span>INTERACTIVE COMBO BUILDER</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            Build Your Own <span className="text-red-600">Wok Box Special</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Customize your signature bowl in 4 easy steps: select your wok base, protein, signature sauce, and complimentary appetizer.
          </p>
        </div>

        {/* Builder Interactive Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Columns: Step by step configuration */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Base */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-mono font-bold flex items-center justify-center">1</span>
                  <span>Choose Your Wok Base</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Step 1 of 4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {bases.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBase(b.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      base === b.id
                        ? 'bg-red-50 border-red-500 text-red-900 font-bold shadow-xs ring-1 ring-red-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{b.name}</span>
                      <span className="text-[10px] text-slate-500">{b.cal} • {b.veg ? 'Veg' : 'Egg'}</span>
                    </div>
                    {base === b.id && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Protein */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-mono font-bold flex items-center justify-center">2</span>
                  <span>Choose Your Main / Protein</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Step 2 of 4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {proteins.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProtein(p.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      protein === p.id
                        ? 'bg-red-50 border-red-500 text-red-900 font-bold shadow-xs ring-1 ring-red-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.veg ? 'Pure Veg' : '100% Halal'}</span>
                    </div>
                    {protein === p.id && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Sauce & Heat */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-mono font-bold flex items-center justify-center">3</span>
                  <span>Select Wok Glaze & Sauce</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Step 3 of 4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sauces.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSauce(s.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      sauce === s.id
                        ? 'bg-red-50 border-red-500 text-red-900 font-bold shadow-xs ring-1 ring-red-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">{s.name}</span>
                      {sauce === s.id && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Complimentary Side */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-mono font-bold flex items-center justify-center">4</span>
                  <span>Pick Your Included Appetizer Side</span>
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Step 4 of 4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sides.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSide(s.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      side === s.id
                        ? 'bg-red-50 border-red-500 text-red-900 font-bold shadow-xs ring-1 ring-red-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{s.name}</span>
                      <span className="text-[10px] text-slate-500">{s.veg ? 'Vegetarian' : 'Non-Veg'}</span>
                    </div>
                    {side === s.id && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Box Summary Card */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-red-950 text-white rounded-3xl p-6 shadow-xl border border-red-900/40 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                    CUSTOM CREATION
                  </span>
                  <h4 className="text-xl font-bold font-serif text-white">Your Wok Box</h4>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
                  <Box className="w-5 h-5" />
                </div>
              </div>

              {/* Box Ingredient Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">1. Base:</span>
                  <span className="font-bold text-white text-right max-w-[170px]">
                    {bases.find(b => b.id === base)?.name}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-slate-400">2. Main:</span>
                  <span className="font-bold text-amber-300 text-right max-w-[170px]">
                    {selectedProteinObj.name}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-slate-400">3. Sauce:</span>
                  <span className="font-bold text-white text-right max-w-[170px]">
                    {sauces.find(s => s.id === sauce)?.name.split('(')[0]}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-slate-400">4. Side:</span>
                  <span className="font-bold text-white text-right max-w-[170px]">
                    {sides.find(s => s.id === side)?.name}
                  </span>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-300">Combo Special:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400 font-serif">
                      £{totalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 line-through ml-2">
                      £{originalValue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800/40 w-full justify-center">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>You Save £{savings.toFixed(2)} with this Wok Box!</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <button
                  onClick={handleSaveBox}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isAdded ? '✓ Custom Box Saved!' : 'Save This Custom Box'}</span>
                </button>

                <button
                  onClick={onBookTable}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Book Table to Taste This</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>

              {isAdded && (
                <p className="text-[11px] text-emerald-300 text-center animate-fadeIn font-semibold">
                  Saved! Mention this custom combo when placing your order or reserving a table.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
