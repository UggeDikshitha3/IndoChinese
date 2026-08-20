import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, ExternalLink, Calendar } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface LocationSectionProps {
  settings?: RestaurantSettings;
  onBookTable: () => void;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings = DEFAULT_RESTAURANT_SETTINGS, onBookTable }) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wider uppercase mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>FIND US IN HOUNSLOW</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-serif tracking-tight">
            LOCATION & <span className="text-red-600">OPENING HOURS</span>
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Conveniently situated on Hounslow High Street with easy parking and public transit access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Interactive Map Embed View */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs relative min-h-[380px] flex flex-col justify-between">
            {/* Embedded Google Maps iFrame */}
            <iframe
              title="INDO CHINESE Location Map"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.5123456789!2d${currentSettings.longitude || -0.3609}!3d${currentSettings.latitude || 51.4682}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTE0NicwNS41Ik4gMMKwMjEnMzkuMiJX!5e0!3m2!1sen!2suk!4v1650000000000!5m2!1sen!2suk`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '340px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
              <div className="flex items-center space-x-2 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="font-bold text-slate-900">{currentSettings.address}, {currentSettings.city} ({currentSettings.postcode})</span>
              </div>

              <a
                id="location-get-directions-button"
                href={currentSettings.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>GET DIRECTIONS</span>
              </a>
            </div>
          </div>

          {/* Business Info & Opening Hours Table */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span>Opening Hours</span>
              </h3>

              <div className="space-y-2 text-xs">
                {(Array.isArray(currentSettings.openingHours) 
                  ? currentSettings.openingHours 
                  : (typeof currentSettings.openingHours === 'object' && currentSettings.openingHours !== null
                    ? Object.entries(currentSettings.openingHours).map(([d, t]) => ({
                        day: d.charAt(0).toUpperCase() + d.slice(1),
                        open: typeof t === 'string' && t.includes('-') ? t.split('-')[0].trim() : '12:00 PM',
                        close: typeof t === 'string' && t.includes('-') ? t.split('-')[1].trim() : '10:30 PM'
                      }))
                    : []
                  )
                ).map((h: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700 font-sans"
                  >
                    <span className="font-semibold">{h.day}</span>
                    <span className="text-red-600 font-mono font-bold">{h.open} – {h.close}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 mt-6 space-y-3">
              <a
                href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
                className="w-full py-3 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>CALL RESTAURANT ({currentSettings.phone})</span>
              </a>

              <button
                onClick={onBookTable}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>RESERVE TABLE ONLINE</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
