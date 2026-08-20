import React from 'react';
import { Phone, Navigation, Calendar, ShoppingBag } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface MobileBottomNavProps {
  settings?: RestaurantSettings;
  onBookTable: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onBookTable
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-2xl px-3 py-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Call Button */}
        <a
          id="mobile-call-button"
          href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs shadow-xs active:scale-95"
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
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors font-bold text-xs shadow-xs active:scale-95"
        >
          <Navigation className="w-4 h-4 text-amber-600 mb-0.5" />
          <span>MAP</span>
        </a>

        {/* Book Table Button */}
        <button
          id="mobile-book-button"
          onClick={onBookTable}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs shadow-md active:scale-95 tracking-wide"
        >
          <Calendar className="w-4 h-4 text-amber-200 mb-0.5" />
          <span>BOOK</span>
        </button>
      </div>
    </div>
  );
};
