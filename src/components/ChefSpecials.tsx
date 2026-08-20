import React from 'react';
import { Sparkles, Flame, Star, ArrowRight, Utensils } from 'lucide-react';
import { MenuItem } from '../types';

interface ChefSpecialsProps {
  items?: MenuItem[];
  menuItems?: MenuItem[];
  onBookTable?: () => void;
}

export const ChefSpecials: React.FC<ChefSpecialsProps> = ({ items, menuItems, onBookTable }) => {
  const safeItems = items || menuItems || [];
  const chefItems = safeItems.filter(i => i && i.isChefSpecial).slice(0, 4);

  if (chefItems.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-y border-slate-800 relative overflow-hidden">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>EXECUTIVE CHEF SELECTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight">
            SIGNATURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">CHEF SPECIALS</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 font-sans max-w-xl mx-auto">
            High-flame wok creations hand-crafted with artisanal spices, fiery chilies, and authentic Bombay wok technique.
          </p>
        </div>

        {/* Specials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {chefItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-red-950/40 transition-all duration-300 flex flex-col justify-between group card-hover-lift backdrop-blur-xs"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = item.isVeg
                      ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                      : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                {/* Must Try Badge */}
                <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>CHEF SIGNATURE</span>
                </span>

                {/* Dietary / Spice Badge */}
                <div className="absolute top-3 right-3 flex items-center space-x-1.5">
                  {item.isVeg ? (
                    <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Pure Veg
                    </span>
                  ) : (
                    <span className="bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      100% Halal
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-0.5 shadow-md">
                      <Flame className="w-3 h-3 fill-white" />
                      <span>Spicy</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-serif group-hover:text-amber-400 transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-1.5 font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">PRICE</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      £{item.price.toFixed(2)}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-700/60">
                    Live Wok Tossed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore Menu Banner CTA */}
        <div className="mt-12 text-center">
          <a
            href="#menu"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs transition-all shadow-md group"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>SEE COMPLETE 64-DISH MENU</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
