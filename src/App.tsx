import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GoogleBusinessCard } from './components/GoogleBusinessCard';
import { ChefSpecials } from './components/ChefSpecials';
import { MenuSection } from './components/MenuSection';
import { OffersSection } from './components/OffersSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { ReservationSection } from './components/ReservationSection';
import { ReviewsSection } from './components/ReviewsSection';
import { LocationSection } from './components/LocationSection';
import { ContactSection } from './components/ContactSection';
import { EventsSection } from './components/EventsSection';
import { Footer } from './components/Footer';
import { SeoSchema } from './components/SeoSchema';
import { ManageReservationModal } from './components/ManageReservationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AdminReservationAlertBanner } from './components/AdminReservationAlertBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LegalModals, LegalModalType } from './components/LegalModals';

import { BookTablePage } from './pages/BookTablePage';
import { AdminPage } from './pages/AdminPage';

import {
  MenuItem,
  MenuCategory,
  SpecialOffer,
  GalleryItem,
  Review,
  RestaurantSettings
} from './types';

import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_OFFERS,
  INITIAL_GALLERY,
  INITIAL_REVIEWS
} from './data/initialData';

import { DEFAULT_RESTAURANT_SETTINGS } from './config/restaurantConfig';
import { getApiUrl } from './utils/api';

export default function App() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_RESTAURANT_SETTINGS);
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [offers, setOffers] = useState<SpecialOffer[]>(INITIAL_OFFERS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  // Routing state
  const [currentPage, setCurrentPage] = useState<'home' | 'book-table' | 'admin'>(() => {
    const isPathAdmin =
      window.location.pathname.startsWith('/admin') ||
      window.location.hash === '#admin' ||
      window.location.search.includes('admin');
    return isPathAdmin ? 'admin' : 'home';
  });

  const [activeSection, setActiveSection] = useState('home');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('indochinese_admin_token'));
  });

  // Check URL hash for routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setCurrentPage('admin');
      } else if (window.location.hash === '#reservations' || window.location.hash === '#book-table') {
        setCurrentPage('book-table');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch API data from server
  useEffect(() => {
    fetchSettings();
    fetchMenuData();
    fetchReviews();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(getApiUrl('/api/settings'));
      if (res.ok) {
        const raw = await res.json();
        if (!raw) return;

        let addressStr = DEFAULT_RESTAURANT_SETTINGS.address;
        let cityStr = DEFAULT_RESTAURANT_SETTINGS.city;
        let postcodeStr = DEFAULT_RESTAURANT_SETTINGS.postcode;
        let countryStr = DEFAULT_RESTAURANT_SETTINGS.country;
        let lat = DEFAULT_RESTAURANT_SETTINGS.latitude;
        let lng = DEFAULT_RESTAURANT_SETTINGS.longitude;

        if (typeof raw.address === 'object' && raw.address !== null) {
          addressStr = raw.address.street || raw.address.full || DEFAULT_RESTAURANT_SETTINGS.address;
          cityStr = raw.address.city || raw.address.area || DEFAULT_RESTAURANT_SETTINGS.city;
          postcodeStr = raw.address.postcode || DEFAULT_RESTAURANT_SETTINGS.postcode;
          countryStr = raw.address.country || DEFAULT_RESTAURANT_SETTINGS.country;
          if (raw.address.coordinates) {
            lat = raw.address.coordinates.lat ?? lat;
            lng = raw.address.coordinates.lng ?? lng;
          }
        } else if (typeof raw.address === 'string' && raw.address.trim()) {
          addressStr = raw.address;
          if (raw.city) cityStr = raw.city;
          if (raw.postcode) postcodeStr = raw.postcode;
        }

        let hoursArray = DEFAULT_RESTAURANT_SETTINGS.openingHours;
        if (Array.isArray(raw.openingHours)) {
          hoursArray = raw.openingHours;
        } else if (typeof raw.openingHours === 'object' && raw.openingHours !== null) {
          hoursArray = Object.entries(raw.openingHours).map(([d, timeStr]) => {
            const dayName = d.charAt(0).toUpperCase() + d.slice(1);
            let open = "12:00 PM";
            let close = "10:30 PM";
            if (typeof timeStr === 'string' && timeStr.includes('-')) {
              const parts = timeStr.split('-');
              open = parts[0].trim();
              close = parts[1].trim();
            } else if (typeof timeStr === 'string') {
              open = timeStr;
            }
            return { day: dayName, open, close, closed: false };
          });
        }

        const normalized: RestaurantSettings = {
          ...DEFAULT_RESTAURANT_SETTINGS,
          ...raw,
          name: raw.name || DEFAULT_RESTAURANT_SETTINGS.name,
          tagline: raw.tagline || DEFAULT_RESTAURANT_SETTINGS.tagline,
          description: raw.description || DEFAULT_RESTAURANT_SETTINGS.description,
          phone: raw.phone || DEFAULT_RESTAURANT_SETTINGS.phone,
          email: raw.email || DEFAULT_RESTAURANT_SETTINGS.email,
          whatsapp: raw.whatsapp || raw.social?.whatsapp || DEFAULT_RESTAURANT_SETTINGS.whatsapp,
          address: addressStr,
          city: cityStr,
          postcode: postcodeStr,
          country: countryStr,
          latitude: lat,
          longitude: lng,
          openingHours: hoursArray,
          googleMapsUrl: raw.googleMapsUrl || raw.social?.googleMaps || DEFAULT_RESTAURANT_SETTINGS.googleMapsUrl,
          googleBusinessProfileUrl: raw.googleBusinessProfileUrl || raw.social?.googleBusiness || DEFAULT_RESTAURANT_SETTINGS.googleBusinessProfileUrl,
          instagramUrl: raw.instagramUrl || raw.social?.instagram || DEFAULT_RESTAURANT_SETTINGS.instagramUrl,
          facebookUrl: raw.facebookUrl || raw.social?.facebook || DEFAULT_RESTAURANT_SETTINGS.facebookUrl,
          tiktokUrl: raw.tiktokUrl || DEFAULT_RESTAURANT_SETTINGS.tiktokUrl
        };

        setSettings(normalized);
      }
    } catch (err) {
      console.warn('Failed to load server settings, using defaults:', err);
    }
  };

  const fetchMenuData = async () => {
    try {
      const [catRes, menuRes, offersRes, galRes] = await Promise.all([
        fetch(getApiUrl('/api/menu/categories')),
        fetch(getApiUrl('/api/menu')),
        fetch(getApiUrl('/api/offers')),
        fetch(getApiUrl('/api/gallery'))
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (menuRes.ok) setMenuItems(await menuRes.json());
      if (offersRes.ok) setOffers(await offersRes.json());
      if (galRes.ok) setGallery(await galRes.json());
    } catch (err) {
      console.warn('Using local fallback for menu datasets:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(getApiUrl('/api/reviews'));
      if (res.ok) setReviews(await res.json());
    } catch (err) {
      console.warn('Using fallback reviews');
    }
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBookTable = () => {
    setCurrentPage('book-table');
    window.location.hash = '#reservations';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    setCurrentPage('admin');
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Admin Page
  if (currentPage === 'admin') {
    return (
      <AdminPage
        settings={settings}
        onUpdateSettings={(newS) => setSettings(newS)}
        onMenuUpdated={fetchMenuData}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  // If on Book Table Page
  if (currentPage === 'book-table') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <SeoSchema settings={settings} menuItems={menuItems} />
        <Header
          settings={settings}
          activeSection="reservations"
          setActiveSection={setActiveSection}
          onNavigateHome={handleNavigateHome}
          onNavigateBookTable={handleNavigateBookTable}
          onOpenManageReservation={() => setIsManageModalOpen(true)}
          onOpenAdmin={handleOpenAdmin}
          isAdminLoggedIn={isAdminLoggedIn}
        />

        <main className="flex-1">
          <BookTablePage
            settings={settings}
            onNavigateHome={handleNavigateHome}
            onExploreMenu={() => {
              handleNavigateHome();
              setTimeout(() => {
                const el = document.getElementById('menu');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        </main>

        <Footer
          settings={settings}
          onNavigateBookTable={handleNavigateBookTable}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* Manage Existing Reservation Modal */}
        <ManageReservationModal
          isOpen={isManageModalOpen}
          onClose={() => setIsManageModalOpen(false)}
          settings={settings}
          onBookNewTable={handleNavigateBookTable}
        />

        {/* Mobile Sticky Bar */}
        <MobileBottomNav
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />
      </div>
    );
  }

  // Public Home Page (Complete Experience)
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-red-500 selection:text-white">
      <SeoSchema settings={settings} menuItems={menuItems} />

      {/* Main Navigation Header */}
      <Header
        settings={settings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateHome={handleNavigateHome}
        onNavigateBookTable={handleNavigateBookTable}
        onOpenManageReservation={() => setIsManageModalOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <main className="flex-1 pb-16 sm:pb-0">
        {/* Hero Banner with immediate Table Booking CTA */}
        <Hero
          settings={settings}
          onBookTable={handleNavigateBookTable}
          onExploreMenu={() => {
            const menuEl = document.getElementById('menu');
            if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Google Business & NAP Card */}
        <GoogleBusinessCard
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />

        {/* Chef Specials & Signature Indo-Chinese Delicacies */}
        <ChefSpecials
          menuItems={menuItems}
          onBookTable={handleNavigateBookTable}
        />

        {/* Full Menu Exploration (Starters, Szechwan Woks, Hakka Noodles, Manchurian, Desi-Chinese) */}
        <MenuSection
          categories={categories}
          menuItems={menuItems}
          onBookTable={handleNavigateBookTable}
        />

        {/* Why Choose Indo-Chinese High-Heat Wok Dining */}
        <WhyChooseUs />

        {/* About Restaurant & Wok Heritage */}
        <AboutSection
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />

        {/* Dine-In Special Offers & Lunch Sets */}
        <OffersSection
          offers={offers}
          onBookTable={handleNavigateBookTable}
        />

        {/* Restaurant Ambiance & Photo Gallery */}
        <GallerySection
          gallery={gallery}
          onBookTable={handleNavigateBookTable}
        />

        {/* Instant Table Reservation Section */}
        <ReservationSection
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />

        {/* Events, Private Dining & Banquet Celebrations */}
        <EventsSection
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />

        {/* Customer Testimonials & Reviews */}
        <ReviewsSection
          reviews={reviews}
          settings={settings}
          onBookTable={handleNavigateBookTable}
          onReviewSubmitted={(newRev) => setReviews(prev => [newRev, ...prev])}
        />

        {/* Location, Google Map & Opening Hours */}
        <LocationSection
          settings={settings}
          onBookTable={handleNavigateBookTable}
        />

        {/* Contact Us Form */}
        <ContactSection
          settings={settings}
        />
      </main>

      {/* Footer with NAP Info, Opening Hours, & Legal */}
      <Footer
        settings={settings}
        onNavigateBookTable={handleNavigateBookTable}
        onOpenAdmin={handleOpenAdmin}
        onOpenLegalModal={(type) => setActiveLegalModal(type)}
      />

      {/* Admin Real-Time Reservation Alert Banner */}
      {isAdminLoggedIn && (
        <AdminReservationAlertBanner
          isAdmin={isAdminLoggedIn}
          onNavigateToAdmin={handleOpenAdmin}
        />
      )}

      {/* Manage Reservation Modal */}
      <ManageReservationModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        settings={settings}
        onBookNewTable={handleNavigateBookTable}
      />

      {/* Commercial Legal & Compliance Modals (Privacy, Terms, Allergens, Hygiene) */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        settings={settings}
      />

      {/* Cookie Consent Notice (UK GDPR) */}
      <CookieConsentBanner
        onOpenPrivacyPolicy={() => setActiveLegalModal('privacy')}
      />

      {/* Mobile Fixed Action Bar (CALL, MAP, BOOK TABLE) */}
      <MobileBottomNav
        settings={settings}
        onBookTable={handleNavigateBookTable}
      />
    </div>
  );
}
