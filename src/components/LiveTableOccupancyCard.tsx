import React, { useState, useEffect } from 'react';
import { TableStatusSummary, Reservation } from '../types';
import { subscribeToFirestoreReservations, calculateTableStatus } from '../lib/firebase';
import { getApiUrl } from '../utils/api';
import { Users, Sparkles, RefreshCw, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface LiveTableOccupancyCardProps {
  theme?: 'dark' | 'light';
  compact?: boolean;
}

export const LiveTableOccupancyCard: React.FC<LiveTableOccupancyCardProps> = ({
  theme = 'dark',
  compact = false
}) => {
  const [tableStatus, setTableStatus] = useState<TableStatusSummary>({
    totalTables: 20,
    availableTables: 14,
    bookedTablesToday: 6,
    occupancyPercentage: 30,
    lastUpdated: 'Just now',
    areas: [
      { name: 'Tables for 1–2 People', totalTables: 4, availableTables: 3, occupiedTables: 1 },
      { name: 'Tables for 3–4 People', totalTables: 8, availableTables: 6, occupiedTables: 2 },
      { name: 'Tables for 5–6 People', totalTables: 4, availableTables: 3, occupiedTables: 1 },
      { name: 'Tables for 7+ People', totalTables: 4, availableTables: 2, occupiedTables: 2 }
    ]
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch initial table status from server and subscribe to real-time updates
  useEffect(() => {
    const fetchStatusFromServer = async () => {
      try {
        const res = await fetch(getApiUrl('/api/tables/status'));
        if (res.ok) {
          const data = await res.json();
          setTableStatus(data);
        }
      } catch (err) {
        console.warn('Could not fetch initial table status from API:', err);
      }
    };

    fetchStatusFromServer();

    // Subscribe to Firestore for real-time live table reservation updates
    const unsubscribe = subscribeToFirestoreReservations((reservations: Reservation[]) => {
      if (reservations && reservations.length > 0) {
        const updatedStatus = calculateTableStatus(reservations);
        setTableStatus(updatedStatus);
      }
    });

    // Also listen for in-app table creation events
    const handleLocalReservation = () => {
      setIsSyncing(true);
      fetchStatusFromServer().finally(() => {
        setTimeout(() => setIsSyncing(false), 600);
      });
    };

    window.addEventListener('table_reservation_created', handleLocalReservation);

    // Periodic poll fallback every 20 seconds
    const interval = setInterval(fetchStatusFromServer, 20000);

    return () => {
      unsubscribe();
      window.removeEventListener('table_reservation_created', handleLocalReservation);
      clearInterval(interval);
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(getApiUrl('/api/tables/status'));
      if (res.ok) {
        const data = await res.json();
        setTableStatus(data);
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const isDark = theme === 'dark';

  if (compact) {
    return (
      <div className={`p-3.5 rounded-2xl border transition-all ${
        isDark 
          ? 'bg-neutral-900/90 border-neutral-800 text-neutral-200' 
          : 'bg-emerald-50/90 border-emerald-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold font-mono tracking-tight uppercase">
              Live Real-Time Table Availability
            </span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
            isDark ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-200 text-emerald-900'
          }`}>
            {tableStatus.availableTables} of {tableStatus.totalTables} Tables Open
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl p-5 sm:p-6 border shadow-xl transition-all ${
      isDark
        ? 'bg-neutral-950/95 border-neutral-800 text-white'
        : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
    }`}>
      {/* Top Header with Pulse Indicator */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-5">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold tracking-wide uppercase font-mono flex items-center gap-1.5">
              <span>Real-Time Table Availability</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50' : 'bg-amber-100 text-amber-800'
              }`}>
                Live Synced
              </span>
            </h3>
            <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
              Updated: {tableStatus.lastUpdated}
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          title="Refresh Live Table Status"
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/80 border-emerald-900/40' : 'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-emerald-500 font-bold mb-1">
            <span>Available Tables</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {tableStatus.availableTables}
          </div>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Ready for instant booking
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-amber-500 font-bold mb-1">
            <span>Reserved Today</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {tableStatus.bookedTablesToday}
          </div>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Confirmed bookings
          </p>
        </div>

        <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 ${
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs text-neutral-400 font-bold mb-1">
            <span>Total Restaurant Tables</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {tableStatus.totalTables}
          </div>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Unified dining floor
          </p>
        </div>
      </div>
    </div>
  );
};
