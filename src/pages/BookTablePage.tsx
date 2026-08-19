import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Sparkles,
  Utensils,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Search,
  RotateCcw,
  XCircle,
  AlertCircle,
  Flame,
  Layers
} from 'lucide-react';
import { Reservation, RestaurantSettings } from '../types';
import { LiveTableOccupancyCard } from '../components/LiveTableOccupancyCard';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';
import { getApiUrl } from '../utils/api';

interface BookTablePageProps {
  settings?: RestaurantSettings;
  onNavigateHome: () => void;
  onExploreMenu?: () => void;
}

export const BookTablePage: React.FC<BookTablePageProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onNavigateHome,
  onExploreMenu
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const [activeTab, setActiveTab] = useState<'book' | 'manage'>('book');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Booking Form Fields
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('19:00');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialRequests, setSpecialRequests] = useState('');

  // Availability & Submission
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Manage Reservation Search
  const [searchRef, setSearchRef] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [managedReservation, setManagedReservation] = useState<Reservation | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('19:00');
  const [manageSuccessMessage, setManageSuccessMessage] = useState('');

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  // Check Availability when date, time, or guests change
  useEffect(() => {
    checkTableAvailability();
  }, [date, time, guests]);

  const checkTableAvailability = async () => {
    if (!date || !time) return;
    setIsCheckingAvailability(true);
    try {
      const res = await fetch(getApiUrl(`/api/availability?date=${date}&time=${time}&guests=${guests}`));
      if (res.ok) {
        const data = await res.json();
        if (data.available) {
          setAvailabilityMessage(`Tables Available (${data.availableTablesCount || data.totalMatchingTables} tables suited for ${guests} guests)`);
        } else {
          setAvailabilityMessage('High Demand: Selected time slot has limited availability.');
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleNextToContact = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!name.trim() || !phone.trim()) {
      setBookingError('Please enter your full name and contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        guests: Number(guests),
        date,
        time,
        occasion,
        specialRequests
      };

      const res = await fetch(getApiUrl('/api/reservations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete reservation. Please try another time.');
      }

      setConfirmedReservation(data);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setBookingError(err.message || 'An error occurred while booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLookupReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    setManageSuccessMessage('');
    setManagedReservation(null);

    if (!searchRef.trim() && !searchPhone.trim()) {
      setLookupError('Please enter your Reservation Reference or Phone Number.');
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchRef.trim()) params.append('ref', searchRef.trim());
      if (searchPhone.trim()) params.append('phone', searchPhone.trim());

      const res = await fetch(getApiUrl(`/api/reservations/lookup?${params.toString()}`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No matching reservation found.');

      const item = Array.isArray(data) ? data[0] : data;
      if (item) {
        setManagedReservation(item);
        setRescheduleDate(item.date);
        setRescheduleTime(item.time);
      } else {
        setLookupError('No reservation matches those details.');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Could not find booking.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelManaged = async () => {
    if (!managedReservation) return;

    try {
      const res = await fetch(getApiUrl(`/api/reservations/${managedReservation.id}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setManagedReservation({ ...managedReservation, status: 'cancelled' });
        setShowCancelConfirm(false);
        setManageSuccessMessage('Reservation has been cancelled successfully.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRescheduleManaged = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managedReservation) return;

    try {
      const res = await fetch(getApiUrl(`/api/reservations/${managedReservation.id}/reschedule`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });
      const data = await res.json();
      if (res.ok) {
        setManagedReservation({ ...managedReservation, date: rescheduleDate, time: rescheduleTime, status: 'confirmed' });
        setIsRescheduling(false);
        setManageSuccessMessage('Reservation time updated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-amber-900/40 py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold mb-4 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Restaurant Website</span>
          </button>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Table Booking & Hospitality</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white mb-2">
            Reserve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">Dining Experience</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Experience the sizzle of high-heat Hakka woks and authentic Bombay Indo-Chinese flavors in our premium dining room.
          </p>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'book'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Book New Table
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'manage'
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Manage Existing Booking
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* TAB 1: BOOK TABLE */}
        {activeTab === 'book' && (
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
            
            {/* Step Progress */}
            <div className="flex items-center justify-between max-w-md mx-auto border-b border-slate-100 pb-6 text-xs">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 1 ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  1
                </div>
                <span>Party & Schedule</span>
              </div>

              <div className="w-12 h-0.5 bg-slate-200" />

              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= 2 ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  2
                </div>
                <span>Guest Details</span>
              </div>

              <div className="w-12 h-0.5 bg-slate-200" />

              <div className={`flex items-center space-x-2 ${step === 3 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                }`}>
                  3
                </div>
                <span>Confirmation</span>
              </div>
            </div>

            {/* STEP 1: PARTY SIZE, DATE & TIME */}
            {step === 1 && (
              <form onSubmit={handleNextToContact} className="space-y-6 animate-fadeIn">
                
                {/* 1. Guests Selection */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-red-600" />
                    <span>Count of People Joining the Dinner</span>
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Specify the exact number of people attending for table allocation.
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    {/* Interactive Stepper Counter */}
                    <div className="flex items-center justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setGuests(String(Math.max(1, Number(guests) - 1)))}
                        className="w-12 h-12 rounded-l-2xl bg-white border border-r-0 border-slate-300 text-slate-800 font-black text-xl hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs active:scale-95"
                        aria-label="Decrease people count"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={guests}
                        onChange={(e) => setGuests(String(Math.max(1, Number(e.target.value))))}
                        className="w-24 h-12 bg-white border-y border-slate-300 text-center font-mono font-black text-xl text-slate-900 focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setGuests(String(Number(guests) + 1))}
                        className="w-12 h-12 rounded-r-2xl bg-white border border-l-0 border-slate-300 text-slate-800 font-black text-xl hover:bg-slate-100 flex items-center justify-center transition-colors shadow-xs active:scale-95"
                        aria-label="Increase people count"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick Party Size Selector */}
                    <div className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {['1', '2', '3', '4', '5', '6', '8', '10+'].map((num) => {
                        const val = num === '10+' ? '10' : num;
                        const isSelected = guests === val;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setGuests(val)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex-1 text-center ${
                              isSelected
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {num} {num === '1' ? 'Person' : 'People'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span>Reservation Date</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>Available Time Slot</span>
                    </label>
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-red-500"
                    >
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>{t} (Standard 90m Dining)</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Availability Status Indicator */}
                {availabilityMessage && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-semibold">{availabilityMessage}</span>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Guest Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: GUEST CONTACT INFO */}
            {step === 2 && (
              <form onSubmit={handleConfirmReservation} className="space-y-6 animate-fadeIn">
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-900">Selected Reservation:</span>
                    <span>{guests} Guests • {date} at {time}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-red-600 font-bold underline hover:text-red-800"
                  >
                    Change
                  </button>
                </div>

                {bookingError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 07123 456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="For instant email booking confirmation"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">Dining Occasion</label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:outline-none focus:border-red-500"
                    >
                      <option value="Casual Dining">Casual Dining</option>
                      <option value="Birthday Celebration">Birthday Celebration</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Business Dinner">Business Dinner</option>
                      <option value="Family Gathering">Family Gathering</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Special Dietary Requests or Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Jain / strictly vegetarian prep, high chair needed, extra spicy condiments..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 shadow-md transition-all flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>{isSubmitting ? 'Securing Table...' : 'CONFIRM RESERVATION'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CONFIRMATION VIEW */}
            {step === 3 && confirmedReservation && (
              <div className="text-center space-y-6 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-xs font-bold text-amber-700 tracking-widest uppercase">RESERVATION CONFIRMED</span>
                  <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 mt-1">
                    We Look Forward to Welcoming You!
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm mt-1">
                    A table has been provisionally reserved under your name at <strong>INDO CHINESE</strong>.
                  </p>
                </div>

                {/* Booking Voucher Card */}
                <div className="max-w-lg mx-auto bg-gradient-to-b from-amber-50/70 via-white to-orange-50/40 border border-amber-300 rounded-3xl p-6 text-left shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-200 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">RESERVATION REFERENCE</span>
                      <span className="text-lg font-mono font-black text-red-600">{confirmedReservation.reservationNumber}</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Guest Name</span>
                      <span className="font-bold text-slate-900 text-sm">{confirmedReservation.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Party Size</span>
                      <span className="font-bold text-slate-900 text-sm">{confirmedReservation.guests} Guests</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Date & Time</span>
                      <span className="font-bold text-slate-900 text-sm">{confirmedReservation.date} at {confirmedReservation.time}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Occasion</span>
                      <span className="font-bold text-slate-900 text-sm">{confirmedReservation.occasion || occasion}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Location: <strong>{currentSettings.address}, {currentSettings.city}, {currentSettings.postcode}</strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('manage');
                      setSearchRef(confirmedReservation.reservationNumber);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-bold"
                  >
                    Manage / Reschedule Booking
                  </button>

                  {onExploreMenu && (
                    <button
                      onClick={onExploreMenu}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
                    >
                      Explore Digital Menu
                    </button>
                  )}

                  <button
                    onClick={onNavigateHome}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                  >
                    Return to Homepage
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE RESERVATION */}
        {activeTab === 'manage' && (
          <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Manage Your Existing Reservation</h2>
              <p className="text-xs text-slate-500">Enter your Reservation ID or registered phone number to view or modify your booking.</p>
            </div>

            {manageSuccessMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{manageSuccessMessage}</span>
              </div>
            )}

            {lookupError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookupReservation} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reservation ID</label>
                <input
                  type="text"
                  placeholder="e.g. IC-2026-000123"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 07123 456789"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isSearching ? 'Finding...' : 'Look Up'}</span>
                </button>
              </div>
            </form>

            {managedReservation && (
              <div className="border border-amber-200 rounded-2xl p-5 bg-gradient-to-b from-white to-amber-50/20 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">RESERVATION ID</span>
                    <span className="text-base font-mono font-bold text-red-600">{managedReservation.reservationNumber}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    managedReservation.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {managedReservation.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Guest</span>
                    <span className="font-bold text-slate-900">{managedReservation.name}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Guests</span>
                    <span className="font-bold text-slate-900">{managedReservation.guests} People</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Schedule</span>
                    <span className="font-bold text-slate-900">{managedReservation.date} at {managedReservation.time}</span>
                  </div>
                </div>

                {managedReservation.status !== 'cancelled' && (
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
                    {!showCancelConfirm ? (
                      <>
                        <button
                          onClick={() => setIsRescheduling(!isRescheduling)}
                          className="px-4 py-2 rounded-xl border border-slate-300 font-bold hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{isRescheduling ? 'Cancel Edit' : 'Reschedule'}</span>
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Reservation</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200 animate-fadeIn">
                        <span className="font-bold text-rose-800">Cancel this booking?</span>
                        <button
                          onClick={handleCancelManaged}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                        >
                          Yes, Cancel
                        </button>
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold cursor-pointer"
                        >
                          Keep
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {isRescheduling && (
                  <form onSubmit={handleRescheduleManaged} className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">New Date</label>
                        <input
                          type="date"
                          required
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">New Time</label>
                        <select
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        >
                          {timeSlots.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl shadow-xs"
                      >
                        Confirm New Time
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
