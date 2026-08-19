import React, { useState } from 'react';
import {
  X,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import { Reservation, RestaurantSettings } from '../types';
import { DEFAULT_RESTAURANT_SETTINGS } from '../config/restaurantConfig';
import { getApiUrl } from '../utils/api';

interface ManageReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: RestaurantSettings;
  onBookNewTable?: () => void;
}

export const ManageReservationModal: React.FC<ManageReservationModalProps> = ({
  isOpen,
  onClose,
  settings = DEFAULT_RESTAURANT_SETTINGS,
  onBookNewTable
}) => {
  const currentSettings = settings || DEFAULT_RESTAURANT_SETTINGS;
  const [reservationRef, setReservationRef] = useState('');
  const [phone, setPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [foundReservation, setFoundReservation] = useState<Reservation | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('19:00');
  const [newGuests, setNewGuests] = useState(2);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setActionSuccess('');
    setShowCancelConfirm(false);
    setFoundReservation(null);

    if (!reservationRef.trim() && !phone.trim()) {
      setSearchError('Please enter your Reservation ID or registered Phone Number.');
      return;
    }

    setIsSearching(true);
    try {
      const queryParams = new URLSearchParams();
      if (reservationRef.trim()) queryParams.append('ref', reservationRef.trim());
      if (phone.trim()) queryParams.append('phone', phone.trim());

      const res = await fetch(getApiUrl(`/api/reservations/lookup?${queryParams.toString()}`));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'No booking found with the provided details.');
      }

      const match = Array.isArray(data) ? data[0] : data;
      if (match) {
        setFoundReservation(match);
        setNewDate(match.date);
        setNewTime(match.time);
        setNewGuests(match.guests);
      } else {
        setSearchError('No matching reservation was found.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error searching for reservation. Please verify your details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!foundReservation) return;

    setIsUpdating(true);
    try {
      const res = await fetch(getApiUrl(`/api/reservations/${foundReservation.id}/cancel`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel reservation');

      setFoundReservation({ ...foundReservation, status: 'cancelled' });
      setShowCancelConfirm(false);
      setActionSuccess('Your reservation has been cancelled successfully.');
    } catch (err: any) {
      setSearchError(err.message || 'Error cancelling booking.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundReservation) return;

    setIsUpdating(true);
    try {
      const res = await fetch(getApiUrl(`/api/reservations/${foundReservation.id}/reschedule`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          guests: Number(newGuests)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reschedule reservation');

      setFoundReservation({
        ...foundReservation,
        date: newDate,
        time: newTime,
        guests: Number(newGuests),
        status: 'confirmed'
      });
      setIsRescheduling(false);
      setActionSuccess('Your reservation date and time have been updated successfully!');
    } catch (err: any) {
      setSearchError(err.message || 'Failed to reschedule.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200 relative animate-scaleUp text-slate-800 my-auto">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Manage Your Booking</h3>
              <p className="text-xs text-slate-500">View details, request reschedule, or cancel reservation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
          )}

          {searchError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Lookup Form */}
          <form onSubmit={handleSearch} className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reservation ID</label>
                <input
                  type="text"
                  placeholder="e.g. IC-2026-000123"
                  value={reservationRef}
                  onChange={(e) => setReservationRef(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Registered Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 07123 456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500">Provide either ID or your phone number</span>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isSearching ? 'Verifying...' : 'Find Reservation'}</span>
              </button>
            </div>
          </form>

          {/* Found Reservation Details */}
          {foundReservation && (
            <div className="border border-amber-200 rounded-2xl p-5 bg-gradient-to-b from-white to-amber-50/30 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Reservation Reference</span>
                  <span className="text-base font-mono font-bold text-red-600">{foundReservation.reservationNumber}</span>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    foundReservation.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : foundReservation.status === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : foundReservation.status === 'seated'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {foundReservation.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Guest Name</span>
                  <span className="font-bold text-slate-900 text-sm">{foundReservation.name}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Party Size</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    {foundReservation.guests} Guests
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    {foundReservation.date} at {foundReservation.time}
                  </span>
                </div>
              </div>

              {foundReservation.specialRequests && (
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Preferences & Notes</span>
                  <span className="text-slate-700 italic">{foundReservation.specialRequests}</span>
                </div>
              )}

              {/* Actions */}
              {foundReservation.status !== 'cancelled' && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
                  {!showCancelConfirm ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(!isRescheduling)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isRescheduling ? 'Cancel Edit' : 'Reschedule Date/Time'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isUpdating}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Reservation</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-rose-50 p-2.5 rounded-xl border border-rose-200 animate-fadeIn">
                      <span className="text-xs font-bold text-rose-800">Confirm cancellation?</span>
                      <button
                        type="button"
                        onClick={handleCancelReservation}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Keep Booking
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reschedule Form */}
              {isRescheduling && (
                <form onSubmit={handleRescheduleSubmit} className="mt-3 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Select New Date & Time</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Date</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">New Time</label>
                      <select
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium"
                      >
                        {['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={newGuests}
                        onChange={(e) => setNewGuests(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      {isUpdating ? 'Updating...' : 'Save New Reservation Time'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Need assistance */}
          <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 block">Need urgent modifications?</span>
              <span>Call our hospitality host directly at <strong className="text-red-600">{currentSettings?.phone || '+44 20 8570 9888'}</strong></span>
            </div>
            {onBookNewTable && (
              <button
                onClick={() => {
                  onClose();
                  onBookNewTable();
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-xs flex-shrink-0"
              >
                Book New Table
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
