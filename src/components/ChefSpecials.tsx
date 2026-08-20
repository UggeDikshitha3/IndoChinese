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
    <section className="py-16 bg-gradient-to-b from-slate-50 via-amber-50/30 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>EXECUTIVE CHEF RECOMMENDATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            SIGNATURE <span className="text-red-600">CHEF SPECIALS</span>
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Master creations blending rare spices with high-flame wok technique.
          </p>
        </div>

        {/* Specials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300 flex flex-col justify-between group card-hover-lift"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = item.isVeg
                      ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                      : 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-slate-900" />
                  <span>MUST TRY</span>
                </span>

                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  {item.isVeg ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                      Veg
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                      Halal
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="bg-red-100 text-red-700 border border-red-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-0.5 shadow-2xs">
                      <Flame className="w-3 h-3 text-red-600 fill-red-600" />
                      <span>Spicy</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif group-hover:text-red-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900 font-serif">
                    £{item.price.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    Chef's Choice
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Explore Menu Banner CTA */}
        <div className="mt-10 text-center">
          <a
            href="#menu"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition-all shadow-xs group"
          >
            <Utensils className="w-4 h-4 text-red-600" />
            <span>SEE COMPLETE 105-DISH MENU</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

      </div>
    </section>
  );
};
