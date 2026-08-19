import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  UtensilsCrossed,
  X,
  Eye,
  Layers,
  ArrowRight,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { Reservation, RestaurantTable, ReservationStatus } from '../types';

interface AdminReservationCalendarProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  onUpdateStatus: (reservationId: string, status: ReservationStatus) => Promise<void>;
  onNavigateToFloor?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AdminReservationCalendar: React.FC<AdminReservationCalendarProps> = ({
  reservations,
  tables,
  onUpdateStatus,
  onNavigateToFloor,
  onRefresh,
  isLoading
}) => {
  // Current displayed month & year (default to current date)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Selected single reservation for detail modal
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  // Modal for all reservations on a selected day
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  // View mode: 'month' | 'timeline'
  const [calendarView, setCalendarView] = useState<'month' | 'timeline'>('month');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Filter reservations based on search and status
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.occasion && r.occasion.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [reservations, statusFilter, searchQuery]);

  // Group reservations by date string YYYY-MM-DD
  const reservationsByDate = useMemo(() => {
    const map: Record<string, Reservation[]> = {};
    filteredReservations.forEach(r => {
      if (!r.date) return;
      // Normalize date string (in case format is YYYY-MM-DD or DD/MM/YYYY)
      let dateKey = r.date;
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(r);
    });

    // Sort each day's reservations by time
    Object.keys(map).forEach(dateKey => {
      map[dateKey].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    });

    return map;
  }, [filteredReservations]);

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const prevMonthDays = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const d = new Date(currentYear, currentMonth - 1, day);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      prevMonthDays.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        dateObj: d
      });
    }

    // Current month days
    const currentMonthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(currentYear, currentMonth, day);
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentMonthDays.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        dateObj: d
      });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const totalFilled = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalFilled % 7 === 0 ? 0 : 7 - (totalFilled % 7);
    const nextMonthDays = [];
    for (let day = 1; day <= remainingDays; day++) {
      const d = new Date(currentYear, currentMonth + 1, day);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      nextMonthDays.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        dateObj: d
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentYear, currentMonth]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Stats for the active viewed month
  const monthStats = useMemo(() => {
    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthResvs = reservations.filter(r => r.date && r.date.startsWith(currentMonthPrefix) && r.status !== 'cancelled');
    const totalGuests = monthResvs.reduce((acc, r) => acc + (Number(r.guests) || 0), 0);
    const rescheduled = monthResvs.filter(r => Boolean(r.rescheduledFrom)).length;
    return {
      totalBookings: monthResvs.length,
      totalGuests,
      rescheduledCount: rescheduled
    };
  }, [reservations, currentYear, currentMonth]);

  // Selected day reservations
  const selectedDayReservations = reservationsByDate[selectedDateStr] || [];

  // Helper status color styling
  const getStatusBadgeStyle = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900';
      case 'rescheduled':
        return 'bg-amber-950/90 text-amber-300 border-amber-800/80 hover:bg-amber-900 animate-pulse';
      case 'seated':
        return 'bg-blue-950/90 text-blue-300 border-blue-800/80 hover:bg-blue-900';
      case 'completed':
        return 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750';
      case 'cancelled':
      case 'rejected':
        return 'bg-rose-950/80 text-rose-400 border-rose-900 line-through opacity-70';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
    }
  };

  const getStatusPillColor = (status: ReservationStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500';
      case 'rescheduled': return 'bg-amber-500';
      case 'seated': return 'bg-blue-500';
      case 'completed': return 'bg-slate-500';
      case 'cancelled': return 'bg-rose-500';
      default: return 'bg-amber-400';
    }
  };

  // Trigger 15-minute auto evaluation
  const handleAutoEvaluate = async () => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/admin/reservations/auto-evaluate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error('Error in auto evaluate:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* HEADER CONTROLS & MONTH STATS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif text-white tracking-tight">
                  Reservation Calendar & Timeline
                </h2>
                <p className="text-xs text-slate-400">
                  Block-by-date visual schedule, guest capacities, table allocations & 15m hold statuses.
                </p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calendarView === 'month'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Month View</span>
              </button>
              <button
                onClick={() => setCalendarView('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  calendarView === 'timeline'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Day Timeline</span>
              </button>
            </div>

            {/* Auto-Assign & 15m Hold trigger */}
            <button
              onClick={handleAutoEvaluate}
              disabled={isEvaluating || isLoading}
              className="px-3.5 py-1.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-900/30 transition-all cursor-pointer"
              title="Automatically pair reservations with optimal tables and enforce 15-min grace holds"
            >
              <Sparkles className={`w-3.5 h-3.5 text-purple-200 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Checking...' : 'Auto-Assign (15m Hold)'}</span>
            </button>
          </div>
        </div>

        {/* MONTH STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="text-[10px] uppercase font-bold text-slate-400">Month Bookings</div>
            <div className="text-xl font-black font-mono text-white mt-0.5">{monthStats.totalBookings}</div>
            <div className="text-[10px] text-slate-500">{monthNames[currentMonth]} {currentYear}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="text-[10px] uppercase font-bold text-amber-400">Total Diners Expected</div>
            <div className="text-xl font-black font-mono text-amber-300 mt-0.5">{monthStats.totalGuests}</div>
            <div className="text-[10px] text-amber-500/80">Across all confirmed slots</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
            <div className="text-[10px] uppercase font-bold text-purple-400">15m Auto-Rescheduled</div>
            <div className="text-xl font-black font-mono text-purple-300 mt-0.5">{monthStats.rescheduledCount}</div>
            <div className="text-[10px] text-purple-500/80">No-show window protected</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
            <div className="text-[10px] uppercase font-bold text-emerald-400">Selected Day Load</div>
            <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
              {(reservationsByDate[selectedDateStr] || []).length} <span className="text-xs text-slate-400 font-normal">parties</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">{selectedDateStr}</div>
          </div>
        </div>

        {/* SEARCH, STATUS FILTER & MONTH NAVIGATION BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          {/* Month Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-sm text-white min-w-[160px] text-center font-serif">
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToToday}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors ml-1"
            >
              Today
            </button>
          </div>

          {/* Search & Filter Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search guest, phone, ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="seated">Seated</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {calendarView === 'month' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 bg-slate-950/90 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider text-center py-3">
            <div className="text-red-400">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-amber-400">Sat</div>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-900/50">
            {calendarDays.map((calDay) => {
              const dayResvs = reservationsByDate[calDay.dateStr] || [];
              const isToday = calDay.dateStr === todayStr;
              const isSelected = calDay.dateStr === selectedDateStr;
              const totalGuestsOnDay = dayResvs.reduce((acc, r) => acc + (Number(r.guests) || 0), 0);

              return (
                <div
                  key={calDay.dateStr}
                  onClick={() => {
                    setSelectedDateStr(calDay.dateStr);
                    if (dayResvs.length > 0) {
                      setIsDayModalOpen(true);
                    }
                  }}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 transition-all cursor-pointer flex flex-col justify-between group ${
                    !calDay.isCurrentMonth
                      ? 'bg-slate-950/40 text-slate-600'
                      : isSelected
                      ? 'bg-red-950/20 ring-2 ring-red-500/50 z-10'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  {/* Day Header: Date Number & Guest Count Pill */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-red-600 text-white font-black shadow-sm'
                          : isSelected
                          ? 'bg-slate-200 text-slate-900 font-bold'
                          : calDay.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {calDay.dayNumber}
                    </span>

                    {dayResvs.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
                        <Users className="w-2.5 h-2.5" />
                        <span>{totalGuestsOnDay}</span>
                      </span>
                    )}
                  </div>

                  {/* Blocked Out Reservations List for this date */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayResvs.slice(0, 3).map((resv) => {
                      const assignedTbl = tables.find(t => t.id === resv.assignedTableId);
                      const tableNum = resv.assignedTableNumber || (assignedTbl ? assignedTbl.tableNumber : null);

                      return (
                        <div
                          key={resv.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReservation(resv);
                          }}
                          className={`px-1.5 py-1 rounded-lg border text-[10px] font-semibold transition-all flex items-center justify-between gap-1 truncate ${getStatusBadgeStyle(
                            resv.status
                          )}`}
                          title={`#${resv.reservationNumber} - ${resv.name} (${resv.guests}p) at ${resv.time}`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusPillColor(resv.status)}`} />
                            <span className="font-mono font-bold">{resv.time}</span>
                            <span className="truncate max-w-[65px] font-medium">{resv.name}</span>
                          </div>
                          {tableNum && (
                            <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-900/80 text-purple-300 border border-purple-800/60 font-bold">
                              {tableNum}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {dayResvs.length > 3 && (
                      <div className="text-[10px] font-bold text-red-400 text-center py-0.5 hover:underline">
                        +{dayResvs.length - 3} more reservations
                      </div>
                    )}
                  </div>

                  {/* Empty state hint */}
                  {dayResvs.length === 0 && calDay.isCurrentMonth && (
                    <div className="text-[10px] text-slate-600 italic mt-auto opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      No bookings
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY TIMELINE SCHEDULE VIEW */}
      {calendarView === 'timeline' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          {/* Day Selector & Date Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs uppercase font-bold text-red-400 tracking-wider">Viewing Day Schedule</div>
              <h3 className="text-lg font-bold font-serif text-white">
                {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => setSelectedDateStr(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none"
              />
              <button
                onClick={() => setSelectedDateStr(todayStr)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700"
              >
                Today
              </button>
            </div>
          </div>

          {/* Timeline Blocks */}
          {selectedDayReservations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-600 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-400">No reservations booked for this date.</p>
              <p className="text-xs text-slate-500">Pick another date on the calendar or add a walk-in from the Table Monitor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayReservations.map((resv) => {
                const assignedTbl = tables.find(t => t.id === resv.assignedTableId);
                const tableNum = resv.assignedTableNumber || (assignedTbl ? assignedTbl.tableNumber : null);
                const holdExpiryTime = resv.holdExpiresAt
                  ? new Date(resv.holdExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : null;

                return (
                  <div
                    key={resv.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Time & Reference */}
                    <div className="flex items-start gap-3.5">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 text-center min-w-[70px]">
                        <Clock className="w-4 h-4 text-red-400 mx-auto mb-1" />
                        <span className="font-mono font-black text-sm text-white block">{resv.time}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-base text-white">{resv.name}</span>
                          <span className="font-mono text-xs text-amber-400 font-bold">#{resv.reservationNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            resv.status === 'confirmed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : resv.status === 'rescheduled'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : resv.status === 'seated'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : resv.status === 'completed'
                              ? 'bg-slate-900 text-slate-400 border border-slate-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {resv.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 font-semibold text-slate-300">
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            {resv.guests} Guests
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {resv.phone}
                          </span>
                          {resv.occasion && (
                            <span className="text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60 text-[10px]">
                              🎉 {resv.occasion}
                            </span>
                          )}
                        </div>

                        {resv.rescheduledFrom && (
                          <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1">
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                            <span>Auto-rescheduled from {resv.rescheduledFrom} (15m No-show grace expired)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Table Allocation & Hold Status */}
                    <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
                      <div className="text-right">
                        {tableNum ? (
                          <div className="inline-flex items-center gap-1.5 bg-purple-950/90 text-purple-300 border border-purple-800 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                            <span>🪑 Table {tableNum}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Unassigned</span>
                        )}

                        {holdExpiryTime && (resv.status === 'confirmed' || resv.status === 'rescheduled') && (
                          <div className="text-[10px] text-purple-400 font-bold mt-1">
                            ⏳ 15m Grace: held until {holdExpiryTime}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedReservation(resv)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        {resv.status === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(resv.id, 'confirmed')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            Confirm
                          </button>
                        )}

                        {resv.status !== 'seated' && resv.status !== 'completed' && resv.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (onNavigateToFloor) onNavigateToFloor();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
                            title="Open Floor Plan to seat guest"
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>Seat Party</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: DAY VIEW ALL RESERVATIONS */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Day Schedule Overview</span>
                <h3 className="text-lg font-bold font-serif text-white">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-3">
              {selectedDayReservations.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No reservations for this date.
                </div>
              ) : (
                selectedDayReservations.map((resv) => {
                  const assignedTbl = tables.find(t => t.id === resv.assignedTableId);
                  const tableNum = resv.assignedTableNumber || (assignedTbl ? assignedTbl.tableNumber : null);

                  return (
                    <div
                      key={resv.id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60">
                            {resv.time}
                          </span>
                          <span className="font-bold text-sm text-white">{resv.name}</span>
                          <span className="text-xs text-slate-400">({resv.guests} guests)</span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>Ref: <strong className="text-amber-400 font-mono">{resv.reservationNumber}</strong></span>
                          <span>Tel: {resv.phone}</span>
                        </div>
                        {resv.specialRequests && (
                          <div className="text-[11px] text-slate-400 italic">
                            "{resv.specialRequests}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {tableNum && (
                          <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/80 px-2 py-1 rounded border border-purple-800">
                            Table {tableNum}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setIsDayModalOpen(false);
                            setSelectedReservation(resv);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                          title="Inspect reservation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Total <strong>{selectedDayReservations.length}</strong> bookings ({selectedDayReservations.reduce((a, r) => a + (Number(r.guests) || 0), 0)} diners)
              </span>
              <button
                onClick={() => {
                  setIsDayModalOpen(false);
                  setCalendarView('timeline');
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center gap-1"
              >
                <span>Open Full Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE RESERVATION INSPECTION & STATUS ACTION */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Booking Details</span>
                <h3 className="text-lg font-bold font-serif text-white">{selectedReservation.name}</h3>
              </div>
              <button
                onClick={() => setSelectedReservation(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Reference #</span>
                  <span className="font-mono font-bold text-amber-400">{selectedReservation.reservationNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Party Size</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {selectedReservation.guests} Guests
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Date & Time</span>
                  <span className="font-bold text-slate-200">{selectedReservation.date} at {selectedReservation.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedReservation.status === 'confirmed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : selectedReservation.status === 'rescheduled'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {selectedReservation.status}
                  </span>
                </div>
              </div>

              {/* Contact info */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedReservation.phone}</span>
                </div>
                {selectedReservation.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedReservation.email}</span>
                  </div>
                )}
              </div>

              {/* Table assignment & 15m hold information */}
              <div className="bg-purple-950/40 border border-purple-800/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-purple-400" />
                    <span>Allocated Table:</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-purple-200">
                    {selectedReservation.assignedTableNumber || 'Auto-Allocating'}
                  </span>
                </div>
                {selectedReservation.holdExpiresAt && (
                  <div className="text-[11px] text-purple-300">
                    ⏳ 15m Grace Period Expiration: <strong>{new Date(selectedReservation.holdExpiresAt).toLocaleTimeString()}</strong>
                  </div>
                )}
                {selectedReservation.rescheduledFrom && (
                  <div className="text-[11px] text-amber-300 font-medium">
                    🔄 Rescheduled from {selectedReservation.rescheduledFrom} because initial 15m hold expired.
                  </div>
                )}
              </div>

              {selectedReservation.specialRequests && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Special Requests</span>
                  <p className="text-slate-300 italic mt-0.5">"{selectedReservation.specialRequests}"</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
              {selectedReservation.status === 'pending' && (
                <button
                  onClick={async () => {
                    await onUpdateStatus(selectedReservation.id, 'confirmed');
                    setSelectedReservation(null);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  Confirm Booking
                </button>
              )}
              {selectedReservation.status !== 'seated' && selectedReservation.status !== 'completed' && (
                <button
                  onClick={() => {
                    setSelectedReservation(null);
                    if (onNavigateToFloor) onNavigateToFloor();
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Seat at Table</span>
                </button>
              )}
              {selectedReservation.status !== 'cancelled' && (
                <button
                  onClick={async () => {
                    await onUpdateStatus(selectedReservation.id, 'cancelled');
                    setSelectedReservation(null);
                  }}
                  className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setSelectedReservation(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
