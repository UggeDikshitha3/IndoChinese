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
import { OnlineOrderCartDrawer } from './components/OnlineOrderCartDrawer';
import { OnlineOrderCheckoutModal } from './components/OnlineOrderCheckoutModal';
import { ShoppingBag, ArrowRight } from 'lucide-react';

import { BookTablePage } from './pages/BookTablePage';
import { AdminPage } from './pages/AdminPage';

import {
  MenuItem,
  MenuCategory,
  SpecialOffer,
  GalleryItem,
  Review,
  RestaurantSettings,
  CartItem,
  OrderType
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

  // Online Food Ordering & Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('indochinese_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orderType, setOrderType] = useState<OrderType>('collection');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Sync Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('indochinese_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not save cart state:', e);
    }
  }, [cartItems]);

  const handleAddToCart = (item: MenuItem, quantity: number = 1, spiceLevel: string = 'Medium', instructions: string = '') => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        i => i.menuItem.id === item.id && (i.spiceLevel || 'Medium') === spiceLevel && (i.specialInstructions || '') === instructions
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      }
      return [...prev, {
        menuItem: item,
        quantity,
        spiceLevel,
        specialInstructions: instructions
      }];
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setPromoCode('');
    setAppliedDiscount(0);
  };

  const handleApplyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    const subtotal = cartItems.reduce((s, itm) => s + itm.menuItem.price * itm.quantity, 0);

    if (clean === 'BOMBAY10' || clean === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.10 * 100) / 100;
      setPromoCode(clean);
      setAppliedDiscount(disc);
      return { success: true, message: `10% Discount applied (-£${disc.toFixed(2)})` };
    }
    if (clean === 'WOKFREE' || clean === 'FREEDELIVERY') {
      setPromoCode(clean);
      setAppliedDiscount(2.50);
      return { success: true, message: 'Free Delivery code applied!' };
    }
    if (clean === 'TASTEOFINDIA' || clean === 'SAVE5') {
      const disc = Math.min(5.00, subtotal);
      setPromoCode(clean);
      setAppliedDiscount(disc);
      return { success: true, message: `£5.00 Flat Discount applied (-£${disc.toFixed(2)})` };
    }
    return { success: false, message: 'Invalid code. Try BOMBAY10 or SAVE5' };
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setAppliedDiscount(0);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: any) => {
    setCartItems([]);
    setPromoCode('');
    setAppliedDiscount(0);
    try {
      localStorage.removeItem('indochinese_cart_items');
    } catch {}
  };

  const totalCartCount = cartItems.reduce((sum, itm) => sum + itm.quantity, 0);

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
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
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
          onAddToCart={handleAddToCart}
        />

        {/* Full Menu Exploration (Starters, Szechwan Woks, Hakka Noodles, Manchurian, Desi-Chinese) */}
        <MenuSection
          categories={categories}
          menuItems={menuItems}
          onBookTable={handleNavigateBookTable}
          onAddToCart={handleAddToCart}
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
          onBookTable={handleNavigateBookTable}
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

      {/* Floating Cart Trigger Pill Button */}
      {totalCartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 animate-fadeIn">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-red-500/50 border-2 border-white transition-all transform active:scale-95 cursor-pointer font-bold text-xs sm:text-sm"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <span>View Cart ({totalCartCount})</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-full text-amber-200 font-mono text-xs">
              £{cartItems.reduce((s, itm) => s + itm.menuItem.price * itm.quantity, 0).toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Online Order Cart Drawer */}
      <OnlineOrderCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        orderType={orderType}
        onChangeOrderType={(t) => setOrderType(t)}
        promoCode={promoCode}
        onApplyPromoCode={handleApplyPromoCode}
        onRemovePromoCode={handleRemovePromoCode}
        appliedDiscount={appliedDiscount}
        onProceedToCheckout={handleProceedToCheckout}
        settings={settings}
      />

      {/* Online Order Checkout & Live Tracker Modal */}
      <OnlineOrderCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        orderType={orderType}
        promoCode={promoCode}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
        settings={settings}
      />

      {/* Mobile Fixed Action Bar (CALL, MAP, ORDER, BOOK TABLE) */}
      <MobileBottomNav
        settings={settings}
        onBookTable={handleNavigateBookTable}
        cartItemCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />
    </div>
  );
}
