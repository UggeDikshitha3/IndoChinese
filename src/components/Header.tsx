import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Menu as MenuIcon,
  X,
  Flame,
  Phone,
  MapPin,
  UserCheck,
  Clock,
  Search,
  ChevronRight,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';
import logoImg from '../assets/images/indochinese_logo_1786470451835.jpg';

interface HeaderProps {
  settings?: RestaurantSettings;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onNavigateHome: () => void;
  onNavigateBookTable: () => void;
  onOpenManageReservation: () => void;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  activeSection,
  setActiveSection,
  onNavigateHome,
  onNavigateBookTable,
  onOpenManageReservation,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'menu', label: 'Menu' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'events', label: 'Events' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);

    if (id === 'reservations') {
      onNavigateBookTable();
      return;
    }

    if (id === 'home') {
      onNavigateHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    onNavigateHome();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      {/* Top NAP & Booking Management Bar */}
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs py-2 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a
              href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
              className="flex items-center space-x-1.5 hover:text-amber-400 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>{currentSettings.phone}</span>
            </a>
            <a
              href={currentSettings.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-amber-400 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentSettings.address}, {currentSettings.city}</span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenManageReservation}
              className="flex items-center space-x-1.5 text-amber-300 hover:text-amber-200 transition-colors font-semibold"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Manage Existing Booking</span>
            </button>

            <button
              id="admin-dashboard-button"
              onClick={onOpenAdmin}
              className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition-colors pl-3 border-l border-slate-800 font-bold"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin Floor Monitor' : 'Staff / Admin Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-amber-200 py-3'
            : 'bg-white/90 backdrop-blur-sm border-b border-amber-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left group focus:outline-none"
          >
            <img
              src={logoImg}
              alt="INDO CHINESE Logo"
              className="w-11 h-11 rounded-full border-2 border-amber-500/80 object-cover shadow-sm group-hover:scale-105 transition-transform bg-white"
            />
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 block font-serif">
                INDO<span className="text-red-600"> CHINESE</span>
              </span>
              <span className="text-[10px] text-amber-800 tracking-widest uppercase font-mono block -mt-1 font-bold">
                FINE DINING & RESERVATIONS
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSection === link.id
                    ? 'text-red-600 bg-red-50 border border-red-200 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <button
              id="header-manage-booking-button"
              onClick={onOpenManageReservation}
              className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5 text-slate-600" />
              <span>Manage Booking</span>
            </button>

            <button
              id="header-book-table-button"
              onClick={onNavigateBookTable}
              className="px-4.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-md transition-all flex items-center space-x-1.5 transform active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>BOOK TABLE</span>
            </button>
          </div>

          {/* Mobile Actions: Hamburger Toggle */}
          <div className="flex sm:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white flex flex-col justify-between p-6 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Flame className="w-6 h-6 text-red-600" />
                <span className="text-xl font-bold text-slate-900 font-serif">INDO CHINESE</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col space-y-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-between ${
                    activeSection === link.id
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenManageReservation();
              }}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-bold border border-slate-300 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>Manage Existing Booking</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAdmin) onOpenAdmin();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 text-amber-300 font-bold border border-slate-700 flex items-center justify-center space-x-2 text-xs uppercase tracking-wider"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin Floor Monitor' : 'Staff & Admin Login'}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateBookTable();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold flex items-center justify-center space-x-2 shadow-md text-xs uppercase tracking-wider"
            >
              <Calendar className="w-5 h-5 text-amber-300" />
              <span>BOOK A TABLE</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
