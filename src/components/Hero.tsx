import React from 'react';
import { Utensils, Calendar, Flame, Star, ShieldCheck, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';
import logoImg from '../assets/images/indochinese_logo_1786470451835.jpg';

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
    <section id="home" className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-slate-50 border-b border-slate-200">
      
      {/* Dynamic Animated Ambient Glow Mesh (Warm Amber & Ruby Tones) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/30 via-red-200/25 to-rose-100/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center flex flex-col items-center">
        
        {/* Official Brand Crest with Floating Animation */}
        <div className="mb-5 relative group cursor-pointer animate-float">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition duration-500" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400 shadow-2xl bg-gradient-to-tr from-amber-500 via-red-600 to-amber-400 p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-2 border border-amber-400/40">
              <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-[9px] sm:text-[11px] font-black text-amber-300 uppercase tracking-widest mt-1 font-serif">INDO CHINESE</span>
              <span className="text-[7px] sm:text-[8px] text-amber-100 uppercase tracking-wider font-bold bg-red-900/80 px-2 py-0.5 rounded-full mt-0.5 border border-red-500/40">BOMBAY TASTE</span>
            </div>
          </div>
        </div>

        {/* Live Rating Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm font-semibold mb-4 shadow-xs animate-fadeIn">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-slate-900">4.9/5</span>
          <span className="text-slate-600">• Rated #1 Bombay Indo-Chinese in London</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-serif mb-3">
          INDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-amber-600">CHINESE</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-3xl font-bold text-amber-700 font-serif italic mb-5 max-w-3xl">
          "{currentSettings.tagline}"
        </p>

        {/* Supporting description */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-6 font-sans">
          {currentSettings.description}
        </p>

        {/* Location & High Heat Feature Highlight */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 text-xs text-slate-700">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>124 High Street, Hounslow, London TW3 1NA</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>500°C High-Heat Wok Hei</span>
          </span>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
          <button
            id="hero-view-menu-button"
            onClick={onExploreMenu || onViewMenu}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-md transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer"
          >
            <Utensils className="w-4 h-4 text-amber-300" />
            <span>EXPLORE 105+ DISHES</span>
            <ArrowRight className="w-4 h-4 text-amber-200 ml-1" />
          </button>

          <button
            id="hero-book-table-button"
            onClick={onBookTable}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 border border-amber-500 shadow-md transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-900" />
            <span>BOOK A DINING TABLE</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-200 text-xs sm:text-sm text-slate-700 w-full max-w-3xl">
          <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Flame className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span className="font-semibold">High-Heat Wok Hei</span>
          </div>
          <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">100% Halal & Fresh Veg</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center space-x-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">Authentic Bombay Taste</span>
          </div>
        </div>

      </div>
    </section>
  );
};
