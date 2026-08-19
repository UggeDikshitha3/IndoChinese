import React from 'react';
import { Star, MapPin, Phone, Mail, Clock, Navigation, ExternalLink, ShieldCheck, ShoppingBag, Calendar } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface GoogleBusinessCardProps {
  settings?: RestaurantSettings;
  onBookTable: () => void;
  onViewMenu?: () => void;
}

export const GoogleBusinessCard: React.FC<GoogleBusinessCardProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onBookTable,
  onViewMenu,
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  return (
    <section className="relative z-20 -mt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-lg text-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                Google Business Profile Verified
              </span>
              <span className="text-xs text-slate-500 font-medium">• Indo-Chinese Restaurant</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif tracking-tight">
              {currentSettings.name}
            </h2>

            {/* Google Ratings Row */}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <span className="font-bold text-amber-700">4.9</span>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-medium pl-1">(248 Google Reviews)</span>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">{currentSettings.priceRange || '££'}</span>
                <span>•</span>
                <span>Dine-in</span>
                <span>•</span>
                <span>Takeaway</span>
                <span>•</span>
                <span>No-contact Delivery</span>
              </div>
            </div>
          </div>

          {/* Opening Status Badge */}
          <div className="flex items-center space-x-3 bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
            <Clock className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Open Now
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5 font-medium">
                Today: 10:30 AM – 09:30 PM
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 text-sm">
          {/* Address */}
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Address</p>
              <p className="font-bold text-slate-900">{currentSettings.address}</p>
              <p className="text-xs text-slate-600">{currentSettings.city}, {currentSettings.postcode}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <Phone className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phone</p>
              <a
                href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
                className="font-bold text-slate-900 hover:text-red-600 transition-colors"
              >
                {currentSettings.phone}
              </a>
              <p className="text-xs text-slate-600">Direct Reservations & Inquiries</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <Mail className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</p>
              <a
                href={`mailto:${currentSettings.email}`}
                className="font-bold text-slate-900 hover:text-rose-600 transition-colors truncate block max-w-[200px]"
              >
                {currentSettings.email}
              </a>
              <p className="text-xs text-slate-600">General & Party Enquiries</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <a
            id="gcard-directions-button"
            href={currentSettings.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-300"
          >
            <Navigation className="w-3.5 h-3.5 text-amber-600" />
            <span>GET DIRECTIONS</span>
          </a>

          <a
            id="gcard-call-button"
            href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border border-slate-300"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>CALL NOW</span>
          </a>

          <button
            id="gcard-book-button"
            onClick={onBookTable}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>BOOK TABLE</span>
          </button>
        </div>
      </div>
    </section>
  );
};
