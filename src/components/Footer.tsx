import React from 'react';
import { Flame, Phone, Mail, MapPin, Clock, Instagram, Facebook, ArrowUp, ShieldCheck } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface FooterProps {
  settings?: RestaurantSettings;
  onNavigate?: (sectionId: string) => void;
  onNavigateBookTable?: () => void;
  onOpenAdmin?: () => void;
  onOpenOrderTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onNavigate,
  onNavigateBookTable,
  onOpenAdmin,
  onOpenOrderTracking
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'reservations' && onNavigateBookTable) {
      onNavigateBookTable();
      return;
    }
    if (onNavigate) {
      onNavigate(sectionId);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-serif">
                INDO<span className="text-red-500"> CHINESE</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {settings.description}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500 flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-red-500 flex items-center justify-center transition-all"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <ShieldCheck className="w-3 h-3 mr-1" /> 100% Halal
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">
              NAVIGATION
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNavClick('home')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('menu')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Explore Digital Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('about')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Our Hakka Culinary Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('reservations')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Book a Dining Table
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('gallery')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Dish & Dining Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('reviews')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Google Customer Reviews
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="hover:text-white transition-colors text-slate-400"
                >
                  Location & Contact
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-amber-400 transition-colors text-amber-500/90 font-medium flex items-center gap-1.5 pt-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Staff & Admin Login</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & NAP */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">
              BRANCH & CONTACT US
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <a
                  href={currentSettings.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors underline decoration-slate-700 hover:decoration-white"
                >
                  {currentSettings.address}, {currentSettings.city} ({currentSettings.postcode})
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`} className="hover:text-white transition-colors font-medium">
                    {currentSettings.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                <a href={`mailto:${currentSettings.email}`} className="hover:text-white transition-colors">
                  {currentSettings.email}
                </a>
              </li>
            </ul>

            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">DELIVERY PLATFORMS</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-emerald-400 border border-slate-700">Uber Eats</span>
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-[#00cdbc] border border-slate-700">Deliveroo</span>
                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-red-400 border border-slate-700">Just Eat</span>
              </div>
            </div>
          </div>

          {/* Col 4: Opening Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 font-mono">
              OPENING HOURS
            </h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span>Every Day (Mon – Sun):</span>
                <span className="text-white font-bold text-red-400">10:30 AM – 09:30 PM</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} INDO CHINESE Restaurant. All rights reserved. Hounslow, London.</p>
          
          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all flex items-center space-x-1"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
