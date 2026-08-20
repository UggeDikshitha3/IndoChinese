import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Send,
  PartyPopper,
  Wine,
  Building,
  Heart,
  Crown,
  Phone,
  Mail,
  Flame,
  Check
} from 'lucide-react';
import { RestaurantSettings, EventInquiry } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';
import { getApiUrl } from '../utils/api';

interface EventsSectionProps {
  settings?: RestaurantSettings;
  onBookTable?: () => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onBookTable
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Birthday Party' as EventInquiry['eventType'],
    guests: 15,
    date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    time: '19:00',
    budget: '£30 - £50 per guest',
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const eventTypes: { type: EventInquiry['eventType']; title: string; desc: string; icon: any; img: string }[] = [
    {
      type: 'Birthday Party',
      title: 'Birthday Celebrations',
      desc: 'Celebrate in style with custom Indo-Chinese multi-course banquets, mocktails & dessert platters.',
      icon: PartyPopper,
      img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
    },
    {
      type: 'Anniversary',
      title: 'Anniversaries & Romances',
      desc: 'Intimate private booth seating, candlelit ambient atmosphere and chef-curated tasting courses.',
      icon: Heart,
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    },
    {
      type: 'Corporate Dinner',
      title: 'Corporate & Team Dinners',
      desc: 'Private banquet room with high-speed AV setup, dedicated service captains & bespoke corporate menus.',
      icon: Building,
      img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80'
    },
    {
      type: 'Private Dining',
      title: 'VIP Private Dining Room',
      desc: 'Exclusive dining space accommodating up to 25 guests with personalized wok tasting sessions.',
      icon: Crown,
      img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch(getApiUrl('/api/events/inquire'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit event inquiry.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try calling us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="events" className="py-20 bg-gradient-to-b from-white via-amber-50/30 to-white relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200/80 text-red-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>Private Dining & Group Celebrations</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif tracking-tight">
            Host Your Next Event With Us
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            From intimate birthday celebrations and anniversary dinners to corporate banquets and private room hire, our culinary team delivers unforgettable Indo-Chinese hospitality.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {eventTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                className="bg-white rounded-3xl border border-amber-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs text-red-600 flex items-center justify-center shadow-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm sm:text-base font-serif">{item.title}</h3>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.desc}
                  </p>

                  <button
                    onClick={() => {
                      setFormData({ ...formData, eventType: item.type });
                      const formEl = document.getElementById('event-inquiry-form');
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2 rounded-xl bg-amber-50 hover:bg-red-600 text-amber-900 hover:text-white border border-amber-200 hover:border-red-600 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Inquire for {item.title}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Event Inquiry Form & Booking Perks */}
        <div id="event-inquiry-form" className="bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-amber-900/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left info & highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Event Packages</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                Tailored Menus & Dedicated Service
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Whether you're booking 10 or 50 guests, our event coordinators tailor everything from appetizer platters to signature wok sizzlers.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Custom set menus with Vegetarian & Jain options available</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Dedicated table captains & customized welcome mocktails</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Private Banquet Hall equipped with projector & ambient lighting</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <Phone className="w-3.5 h-3.5" />
                <span>Prefer to speak directly with our Event Coordinator?</span>
              </div>
              <div className="text-sm font-bold font-mono text-white">
                Call: <a href={`tel:${(currentSettings?.phone || '').replace(/\s+/g, '')}`} className="underline hover:text-red-400">{currentSettings?.phone || '07777586916'}</a>
              </div>
            </div>
          </div>

          {/* Right: Booking Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
            {isSuccess ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 font-serif">
                  Event Inquiry Received!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{formData.name}</strong>. Our events manager will review your {formData.eventType} request for {formData.guests} guests on {formData.date} and contact you within 24 hours.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-200 pb-3">
                  <h4 className="text-base font-bold text-slate-900 font-serif">
                    Request Event & Private Dining Quote
                  </h4>
                  <p className="text-xs text-slate-500">
                    Fill out the details below and we will prepare a personalized proposal.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 07700 900123"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Occasion / Event Type *</label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventInquiry['eventType'] })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500 font-medium"
                    >
                      <option value="Birthday Party">Birthday Party</option>
                      <option value="Anniversary">Anniversary Celebration</option>
                      <option value="Corporate Dinner">Corporate & Business Dinner</option>
                      <option value="Private Dining">Private Dining Room Hire</option>
                      <option value="Festival Celebration">Festival / Diwali / NYE Dinner</option>
                      <option value="Group Gathering">Large Group Gathering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Number of Guests *</label>
                    <input
                      type="number"
                      min={6}
                      max={120}
                      required
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Special Requests / Dietary Preferences</label>
                  <textarea
                    rows={2}
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Tell us about special dietary requirements, cake cutting, stage decoration, or budget preferences..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'SENDING INQUIRY...' : 'SUBMIT EVENT INQUIRY'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
