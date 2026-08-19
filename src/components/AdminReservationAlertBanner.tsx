import React, { useState, useEffect } from 'react';
import { Reservation } from '../types';
import { playReservationChime } from '../utils/audioAlert';
import { subscribeToFirestoreReservations } from '../lib/firebase';
import { Bell, Check, X, ShieldAlert, ExternalLink, Calendar, Users, Phone, Sparkles } from 'lucide-react';

interface AdminReservationAlertBannerProps {
  isAdmin: boolean;
  onNavigateToAdmin: () => void;
}

export const AdminReservationAlertBanner: React.FC<AdminReservationAlertBannerProps> = ({
  isAdmin,
  onNavigateToAdmin
}) => {
  const [activeAlert, setActiveAlert] = useState<Reservation | null>(null);
  const [alertQueue, setAlertQueue] = useState<Reservation[]>([]);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen to in-app direct reservation events
    const handleLocalReservation = (e: any) => {
      const reservation: Reservation = e.detail;
      if (reservation) {
        triggerAlert(reservation);
      }
    };

    window.addEventListener('table_reservation_created', handleLocalReservation);

    // Subscribe to real-time Firestore reservations
    const unsubscribe = subscribeToFirestoreReservations((reservations) => {
      if (isInitialLoad) {
        // Record existing reservation IDs so we don't alert on initial startup
        const initialIdSet = new Set(reservations.map(r => r.id || r.reservationNumber));
        setKnownIds(initialIdSet);
        setIsInitialLoad(false);
        return;
      }

      // Check if there are newly added reservations
      reservations.forEach(r => {
        const id = r.id || r.reservationNumber;
        if (id && !knownIds.has(id)) {
          setKnownIds(prev => new Set(prev).add(id));
          triggerAlert(r);
        }
      });
    });

    return () => {
      window.removeEventListener('table_reservation_created', handleLocalReservation);
      unsubscribe();
    };
  }, [isAdmin, isInitialLoad, knownIds]);

  const triggerAlert = (reservation: Reservation) => {
    playReservationChime();
    setActiveAlert(reservation);
    setAlertQueue(prev => [reservation, ...prev.slice(0, 9)]);

    // Try browser system notification if permitted
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🛎️ New Table Reservation: ${reservation.name}`, {
          body: `${reservation.guests} Guests on ${reservation.date} at ${reservation.time}\nPhone: ${reservation.phone}`,
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      // Ignore system notification error
    }
  };

  const handleDismiss = () => {
    setActiveAlert(null);
  };

  const handleConfirmReservation = async (reservation: Reservation) => {
    try {
      const token = localStorage.getItem('indochinese_admin_token') || 'admin_secret_token';
      await fetch(`/api/admin/reservations/${reservation.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
    } catch (err) {
      console.warn('Failed to update status on server:', err);
    }
    setActiveAlert(null);
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Active Floating Alert Toast */}
      {activeAlert && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-md w-full animate-bounce-in">
          <div className="bg-neutral-950/95 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl text-white backdrop-blur-xl relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-pulse">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/90 px-2 py-0.5 rounded-full border border-amber-800/60">
                    Live Table Booking Alert
                  </span>
                  <h4 className="text-sm font-extrabold text-white mt-0.5">
                    {activeAlert.name}
                  </h4>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Booking Details Grid */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 space-y-2 mb-4 text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Date & Time:</span>
                </span>
                <span className="font-bold text-white">
                  {activeAlert.date} at {activeAlert.time}
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-300">
                <span className="flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guests:</span>
                </span>
                <span className="font-bold text-amber-400">
                  {activeAlert.guests} Guests
                </span>
              </div>

              <div className="flex items-center justify-between text-neutral-300">
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Phone:</span>
                </span>
                <a
                  href={`tel:${activeAlert.phone}`}
                  className="font-bold text-neutral-200 hover:text-amber-400 underline"
                >
                  {activeAlert.phone}
                </a>
              </div>

              {activeAlert.specialRequests && (
                <div className="pt-1.5 border-t border-neutral-800 text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-300">Notes:</span> {activeAlert.specialRequests}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleConfirmReservation(activeAlert);
                  onNavigateToAdmin();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Dashboard</span>
              </button>

              <button
                onClick={() => handleConfirmReservation(activeAlert)}
                className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom / Header Admin Privileges Bar Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={onNavigateToAdmin}
          className="flex items-center space-x-2 bg-neutral-950/90 hover:bg-neutral-900 border border-amber-500/50 text-white px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md transition-all group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-neutral-200 group-hover:text-white">
            Admin Privileges Active
          </span>
          {alertQueue.length > 0 && (
            <span className="bg-amber-500 text-neutral-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {alertQueue.length}
            </span>
          )}
        </button>
      </div>
    </>
  );
};
