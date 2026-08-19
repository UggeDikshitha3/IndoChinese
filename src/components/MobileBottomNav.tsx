import React from 'react';
import { Phone, Navigation, Calendar, ShoppingBag } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface MobileBottomNavProps {
  settings?: RestaurantSettings;
  onBookTable: () => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onBookTable,
  cartItemCount = 0,
  onOpenCart
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-2xl px-2 py-2">
      <div className="grid grid-cols-4 gap-1.5">
        {/* Call Button */}
        <a
          id="mobile-call-button"
          href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors font-bold text-[10px] shadow-xs active:scale-95"
        >
          <Phone className="w-4 h-4 text-red-600 mb-0.5" />
          <span>CALL</span>
        </a>

        {/* Directions Button */}
        <a
          id="mobile-directions-button"
          href={currentSettings.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent((currentSettings.address || '') + ' ' + (currentSettings.city || ''))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors font-bold text-[10px] shadow-xs active:scale-95"
        >
          <Navigation className="w-4 h-4 text-amber-600 mb-0.5" />
          <span>MAP</span>
        </a>

        {/* Order Online Button */}
        <button
          id="mobile-order-online-button"
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-50 text-slate-900 border border-amber-300 font-bold text-[10px] shadow-xs active:scale-95"
        >
          <ShoppingBag className="w-4 h-4 text-red-600 mb-0.5" />
          <span>ORDER</span>
          {cartItemCount > 0 && (
            <span className="absolute 1 top-0.5 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
              {cartItemCount}
            </span>
          )}
        </button>

        {/* Book Table Button */}
        <button
          id="mobile-book-table-cta"
          onClick={onBookTable}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 transition-all font-bold text-[10px] shadow-md active:scale-95"
        >
          <Calendar className="w-4 h-4 text-amber-300 mb-0.5" />
          <span>BOOK</span>
        </button>
      </div>
    </div>
  );
};
