import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, Flame, PackageCheck, Bike, Phone, MapPin, Sparkles, Calendar } from 'lucide-react';
import { RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';

interface LiveTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: RestaurantSettings;
}

export const LiveTrackerModal: React.FC<LiveTrackerModalProps> = ({ isOpen, onClose, settings = DEFAULT_RESTAURANT_SETTINGS }) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'order' | 'reservation'>('order');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedCode, setSearchedCode] = useState('');

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchedCode(query.trim().toUpperCase());
    setHasSearched(true);
  };

  const steps = [
    {
      id: 1,
      title: 'Order Confirmed',
      desc: 'Sent to the kitchen wok line',
      time: '12:15 PM',
      completed: true,
      current: false,
      icon: CheckCircle2,
    },
    {
      id: 2,
      title: 'Wok Master Firing',
      desc: 'Tossing fresh vegetables & proteins on high flame',
      time: '12:22 PM',
      completed: true,
      current: true,
      icon: Flame,
    },
    {
      id: 3,
      title: 'Garnish & Quality Check',
      desc: 'Inspecting temperature, spice balance & packaging',
      time: 'Est. 12:30 PM',
      completed: false,
      current: false,
      icon: PackageCheck,
    },
    {
      id: 4,
      title: 'Ready for Collection',
      desc: 'Hot & ready at the front counter',
      time: 'Est. 12:35 PM',
      completed: false,
      current: false,
      icon: Bike,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-scaleUp text-slate-800 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-100 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-serif">
            Live Kitchen & Order Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time wok preparation status for your takeaway, delivery, or table booking.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('order');
              setHasSearched(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'order' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Takeaway / Order Tracker
          </button>
          <button
            onClick={() => {
              setActiveTab('reservation');
              setHasSearched(false);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'reservation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Table Reservation Lookup
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'order' ? 'Enter Order Ref (e.g. ORD-9821 or Demo)' : 'Enter Booking Ref (e.g. RES-4410)'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
            >
              Track
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-slate-400">
            <span>Tip: Try typing <button type="button" onClick={() => { setQuery('ORD-8821'); setSearchedCode('ORD-8821'); setHasSearched(true); }} className="text-red-600 font-bold hover:underline">ORD-8821</button> for a live demo.</span>
          </div>
        </form>

        {/* Search Result Stage View */}
        {hasSearched ? (
          <div className="space-y-6 animate-fadeIn">
            {activeTab === 'order' ? (
              <>
                {/* Active Order Summary Header */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                        #{searchedCode}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        In Progress
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      Estimated Ready Time: <span className="text-red-600 font-extrabold">~12 Mins</span>
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Order Type</span>
                    <span className="text-xs font-bold text-slate-800">Collection (Takeaway)</span>
                  </div>
                </div>

                {/* Animated Timeline Stepper */}
                <div className="space-y-4 pl-2">
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="relative flex items-start space-x-3.5">
                        {/* Connecting Line */}
                        {idx !== steps.length - 1 && (
                          <div className={`absolute left-4 top-8 w-0.5 h-9 -ml-px ${
                            step.completed ? 'bg-red-500' : 'bg-slate-200'
                          }`} />
                        )}

                        {/* Step Icon Badge */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          step.completed
                            ? 'bg-red-600 text-white shadow-xs'
                            : step.current
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                            : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Step Details */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between">
                            <h5 className={`text-xs sm:text-sm font-bold ${
                              step.completed || step.current ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                              {step.title}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400">{step.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Reservation Lookup Result */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    #{searchedCode}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    ✓ Confirmed Table
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest Name:</span>
                    <span className="font-bold text-slate-800">VIP Guest</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date & Time:</span>
                    <span className="font-bold text-slate-800">Today, 7:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Party Size:</span>
                    <span className="font-bold text-slate-800">4 Guests (Main Dining Hall)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Kitchen Contact Help */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span>Collection at {currentSettings.address}, {currentSettings.city}</span>
              </div>
              <a
                href={`tel:${(currentSettings.phone || '').replace(/\s+/g, '')}`}
                className="font-bold text-red-600 hover:text-red-700 flex items-center space-x-1 whitespace-nowrap"
              >
                <Phone className="w-3 h-3" />
                <span>Call Kitchen</span>
              </a>
            </div>
          </div>
        ) : (
          /* Empty / Default Guidance */
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
            <Sparkles className="w-6 h-6 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 font-serif">
              Instant Real-Time Kitchen Connection
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Whenever you place a takeaway order or reserve a table with Indo Chinese, your reference number allows you to follow the live preparation status step-by-step.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
