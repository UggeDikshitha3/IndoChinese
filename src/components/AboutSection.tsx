import React from 'react';
import { Flame, UtensilsCrossed, Sparkles, Award, ArrowRight, Calendar } from 'lucide-react';
import { RestaurantSettings } from '../types';

interface AboutSectionProps {
  settings?: RestaurantSettings;
  onExploreMenu?: () => void;
  onBookTable?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  settings,
  onExploreMenu,
  onBookTable
}) => {
  const handleExplore = () => {
    if (onExploreMenu) {
      onExploreMenu();
    } else {
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section id="about" className="py-20 bg-white text-slate-800 relative overflow-hidden border-t border-slate-200">
      {/* Background accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Column - Stacked Food & Chef Images */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Wok Flame Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden border border-slate-200 shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                  alt="High heat wok cooking technique"
                  className="w-full h-[380px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 flex items-center space-x-3 shadow-md">
                  <div className="p-2.5 rounded-lg bg-red-100 text-red-600">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">High-Heat Wok Hei</p>
                    <p className="text-[11px] text-slate-600">Authentic flame seared aromas</p>
                  </div>
                </div>
              </div>

              {/* Overlapping Chef Plate Image */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 z-20 w-48 sm:w-64 rounded-2xl overflow-hidden border-4 border-white shadow-xl hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80"
                  alt="Chilli Paneer presentation"
                  className="w-full h-44 sm:h-52 object-cover"
                />
              </div>

              {/* Decorative Experience Badge */}
              <div className="absolute -top-6 -left-4 sm:-left-6 z-20 bg-red-600 text-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center font-serif text-center border border-red-500">
                <span className="text-2xl font-extrabold leading-none">15+</span>
                <span className="text-[10px] uppercase font-sans font-bold tracking-wider mt-1">Years Culinary Heritage</span>
              </div>
            </div>
          </div>

          {/* Copy Column */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OUR STORY • BOMBAY TO HOUNSLOW</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif leading-tight">
              THE REAL TASTE OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">BOMBAY</span>
            </h2>

            <p className="text-base sm:text-lg text-red-700 font-serif italic">
              "Born on the vibrant, bustling streets of Bombay, Indo-Chinese cuisine is a true celebration of two rich culinary worlds coming together."
            </p>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
              It is where traditional Chinese stir-fry and wok techniques meet the bold, aromatic spices and explosive flavors of Indian street food.
            </p>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans">
              At <strong className="text-slate-900 font-semibold">Indo Chinese: The Real Taste of Bombay</strong>, we bring this iconic culinary culture straight to your plate. Inspired by the legendary roadside carts and classic eateries of Mumbai, our dishes are crafted with high-heat woks, fiery sauces, garlic, ginger, and fresh herbs to capture the exact punchy, wok-tossed flavor you know and love.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-sans">
              From sizzling noodles and crispy starters to rich, savory gravies, every dish is a nod to the spirit of Bombay—fast, bold, and unforgettable. Welcome to our table, where every bite brings you the authentic taste of the street!
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2.5 text-sm text-slate-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                <span>Fresh Local Produce</span>
              </div>
              <div className="flex items-center space-x-2.5 text-sm text-slate-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-amber-600"></div>
                <span>House-Made Chili Pastes</span>
              </div>
              <div className="flex items-center space-x-2.5 text-sm text-slate-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                <span>Generous Portion Sizes</span>
              </div>
              <div className="flex items-center space-x-2.5 text-sm text-slate-700 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                <span>100% Halal Options</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                id="about-explore-menu-button"
                onClick={handleExplore}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-md flex items-center space-x-2 group"
              >
                <span>EXPLORE OUR FULL MENU</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {onBookTable && (
                <button
                  id="about-book-table-button"
                  onClick={onBookTable}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all border border-slate-200 flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span>RESERVE A TABLE</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
