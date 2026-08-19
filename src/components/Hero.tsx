import React from 'react';
import { ChevronDown, Utensils, ShoppingBag, Calendar, Flame, Star, ShieldCheck, Clock } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface HeroProps {
  settings?: RestaurantSettings;
  onExploreMenu?: () => void;
  onViewMenu?: () => void;
  onBookTable?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onExploreMenu,
  onViewMenu,
  onBookTable,
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  return (
    <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-slate-50 border-b border-slate-200">
      {/* Subtle Background Pattern & Light Image Blend */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <img
          src="/src/assets/images/triple_schezwan_combo_1786516611209.jpg"
          alt="Indo Chinese Restaurant Background"
          className="w-full h-full object-cover object-center filter grayscale mix-blend-multiply"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col items-center">
        
        {/* Official Logo Display */}
        <div className="mb-5 flex flex-col items-center">
          <img
            src="/src/assets/images/indochinese_logo_1786470451835.jpg"
            alt="INDO CHINESE - The Real Taste of Bombay"
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-amber-500 shadow-xl object-contain bg-white p-1 hover:scale-105 transition-transform"
          />
        </div>

        {/* Rating Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold mb-4 shadow-xs animate-fadeIn">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-slate-900">4.9</span>
          <span className="text-slate-600">• Rated #1 Bombay Indo-Chinese in Hounslow</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-serif mb-3">
          INDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">CHINESE</span>
        </h1>

        {/* Subtitle / Tagline */}
        <p className="text-xl sm:text-3xl font-bold text-amber-700 font-serif italic mb-5 max-w-3xl">
          "{currentSettings.tagline}"
        </p>

        {/* Supporting text */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 font-sans">
          {currentSettings.description}
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
          <button
            id="hero-view-menu-button"
            onClick={onExploreMenu || onViewMenu}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-300" />
            <span>VIEW MENU</span>
          </button>

          <button
            id="hero-book-table-button"
            onClick={onBookTable}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-md transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-900" />
            <span>BOOK A TABLE</span>
          </button>
        </div>

        {/* Trust Chips */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-200 text-xs sm:text-sm text-slate-700 w-full max-w-3xl">
          <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Flame className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold">High-Heat Wok Hei</span>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">Fresh Halal & Veg</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">Fast Takeaway & Delivery</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 animate-bounce">
          <button
            onClick={onExploreMenu || onViewMenu}
            className="text-slate-400 hover:text-red-600 transition-colors p-2 focus:outline-none cursor-pointer"
            aria-label="Scroll to menu"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};
