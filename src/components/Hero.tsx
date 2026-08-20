import React from 'react';
import { Utensils, Calendar, Flame, Star, ShieldCheck, Sparkles, MapPin, ArrowRight } from 'lucide-react';
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
    <section id="home" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800">
      
      {/* Dynamic Animated Ambient Glow Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-red-600/25 via-orange-500/20 to-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Background Pattern & Authentic Photography Blend */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img
          src="/src/assets/images/triple_schezwan_combo_1786516611209.jpg"
          alt="Indo Chinese Wok Background"
          className="w-full h-full object-cover object-center filter grayscale mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
        
        {/* Floating Brand Logo with Glow */}
        <div className="mb-6 relative group cursor-pointer animate-float">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
          <img
            src="/src/assets/images/indochinese_logo_1786470451835.jpg"
            alt="INDO CHINESE - The Real Taste of Bombay"
            className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-amber-400/90 shadow-2xl object-contain bg-slate-950 p-1.5"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-[10px] font-extrabold tracking-widest uppercase border border-amber-300 shadow-md">
            EST. 2026
          </div>
        </div>

        {/* Live Vibe Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-5 shadow-lg backdrop-blur-md">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="font-bold text-white">4.9/5</span>
          <span className="text-slate-400">• Rated #1 Bombay Indo-Chinese in London</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white font-serif mb-4 leading-none">
          INDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 drop-shadow-sm">CHINESE</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-3xl font-extrabold text-amber-400/95 font-serif italic mb-5 max-w-3xl drop-shadow-xs">
          "{currentSettings.tagline}"
        </p>

        {/* Supporting description */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-8 font-sans">
          {currentSettings.description}
        </p>

        {/* Location & High Heat Feature Highlight */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-8 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>124 High Street, Hounslow, London TW3</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-amber-300 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>500°C High-Heat Wok Hei</span>
          </span>
        </div>

        {/* Hero CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none">
          <button
            id="hero-view-menu-button"
            onClick={onExploreMenu || onViewMenu}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-xl shadow-red-950/50 transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer border border-red-400/30"
          >
            <Utensils className="w-4 h-4 text-amber-200" />
            <span>EXPLORE 64+ DISHES</span>
            <ArrowRight className="w-4 h-4 text-amber-200 ml-1" />
          </button>

          <button
            id="hero-book-table-button"
            onClick={onBookTable}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-950/40 transition-all flex items-center justify-center space-x-2 transform active:scale-95 cursor-pointer border border-amber-300"
          >
            <Calendar className="w-4 h-4 text-slate-950" />
            <span>BOOK A DINING TABLE</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-12 pt-8 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 w-full max-w-3xl">
          <div className="flex items-center justify-center space-x-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-xs">
            <Flame className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="font-semibold text-slate-200">High-Heat Wok Hei</span>
          </div>
          <div className="flex items-center justify-center space-x-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200">100% Halal & Fresh Veg</span>
          </div>
          <div className="col-span-2 md:col-span-1 flex items-center justify-center space-x-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 shadow-md backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200">Authentic Bombay Heritage</span>
          </div>
        </div>

      </div>
    </section>
  );
};
