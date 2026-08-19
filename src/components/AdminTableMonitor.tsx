import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  LayoutGrid,
  Filter,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  UserCheck,
  DollarSign,
  Coffee,
  RotateCcw
} from 'lucide-react';
import { RestaurantTable, TableStatus, Reservation } from '../types';
import { getApiUrl } from '../utils/api';

interface AdminTableMonitorProps {
  tables: RestaurantTable[];
  reservations: Reservation[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AdminTableMonitor: React.FC<AdminTableMonitorProps> = ({
  tables,
  reservations,
  onRefresh,
  isLoading
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [minGuestsFilter, setMinGuestsFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'floor'>('grid');
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // Modal states for seating party & table editing
  const [seatingModalTable, setSeatingModalTable] = useState<RestaurantTable | null>(null);
  const [seatingPartyName, setSeatingPartyName] = useState('');
  const [seatingGuests, setSeatingGuests] = useState<number>(2);
  const [seatingDuration, setSeatingDuration] = useState<number>(90);
  const [seatingServer, setSeatingServer] = useState('Rohit K.');
  const [seatingNotes, setSeatingNotes] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState<string>('');

  // Table add/edit modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Partial<RestaurantTable> | null>(null);

  // Update timer every second for real-time live elapsed duration display
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to calculate elapsed time in minutes & seconds
  const getElapsedSeatedTime = (seatedAt?: string) => {
    if (!seatedAt) return null;
    const diffMs = Math.max(0, nowTimestamp - new Date(seatedAt).getTime());
    const totalMinutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return {
      minutes: totalMinutes,
      seconds,
      formatted: `${totalMinutes}m ${seconds.toString().padStart(2, '0')}s`
    };
  };

  // Helper to calculate 15-minute hold remaining time
  const getHoldCountdown = (holdExpiresAt?: string) => {
    if (!holdExpiresAt) return null;
    const exp = new Date(holdExpiresAt).getTime();
    const diffMs = exp - nowTimestamp;
    if (diffMs <= 0) {
      return { isExpired: true, minutes: 0, seconds: 0, formatted: '0m 00s (Expired)' };
    }
    const totalMinutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return {
      isExpired: false,
      minutes: totalMinutes,
      seconds,
      formatted: `${totalMinutes}m ${seconds.toString().padStart(2, '0')}s remaining`
    };
  };

  // Helper to get time until expected vacate
  const getTimeRemaining = (expectedVacateTime?: string) => {
    if (!expectedVacateTime) return null;
    const diffMs = new Date(expectedVacateTime).getTime() - nowTimestamp;
    const minutes = Math.round(diffMs / 60000);
    return minutes;
  };

  // Auto-evaluation state
  const [isAutoEvaluating, setIsAutoEvaluating] = useState(false);
  const [evalFeedback, setEvalFeedback] = useState<string | null>(null);

  const handleTriggerAutoAssignAndHold = async () => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;
    setIsAutoEvaluating(true);
    setEvalFeedback(null);
    try {
      const res = await fetch(getApiUrl('/api/admin/reservations/auto-evaluate'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvalFeedback(data.message || 'Auto-evaluation completed.');
        onRefresh();
        setTimeout(() => setEvalFeedback(null), 6000);
      }
    } catch (err) {
      console.error('Error auto-evaluating reservations:', err);
    } finally {
      setIsAutoEvaluating(false);
    }
  };

  // Table delete confirmation state
  const [tableToDelete, setTableToDelete] = useState<{ id: string; tableNumber: string } | null>(null);
  const [isDeletingTable, setIsDeletingTable] = useState(false);

  // Status Actions
  const handleSeatParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seatingModalTable) return;
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${seatingModalTable.id}/seat`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          partyName: seatingPartyName || 'Walk-in Guest',
          guests: seatingGuests,
          durationMinutes: seatingDuration,
          assignedServer: seatingServer,
          reservationId: selectedReservationId || undefined,
          notes: seatingNotes
        })
      });

      if (res.ok) {
        setSeatingModalTable(null);
        setSeatingPartyName('');
        setSeatingNotes('');
        setSelectedReservationId('');
        onRefresh();
      }
    } catch (err) {
      console.error('Error seating party:', err);
    }
  };

  const handleIssueBill = async (tableId: string) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}/bill`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Error issuing bill:', err);
    }
  };

  const handleCompleteTable = async (tableId: string, setStatus: 'cleaning' | 'available') => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}/complete`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ setStatus })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Error completing table:', err);
    }
  };

  const handleExtendStay = async (tableId: string, mins: number) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}/extend`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ additionalMinutes: mins })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Error extending table time:', err);
    }
  };

  const handleDirectStatusChange = async (tableId: string, status: TableStatus) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleSaveTableConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editingTable.tableNumber || !editingTable.capacity) return;

    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const isEdit = Boolean(editingTable.id);
      const url = isEdit ? getApiUrl(`/api/admin/tables/${editingTable.id}`) : getApiUrl('/api/admin/tables');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingTable,
          area: editingTable.area || 'Dining Room'
        })
      });

      if (res.ok) {
        setIsAddEditModalOpen(false);
        setEditingTable(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Error saving table:', err);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    setIsDeletingTable(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTableToDelete(null);
        setIsAddEditModalOpen(false);
        setEditingTable(null);
        onRefresh();
      }
    } catch (err) {
      console.error('Error deleting table:', err);
    } finally {
      setIsDeletingTable(false);
    }
  };

  // KPIs
  const totalTablesCount = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'bill_issued');
  const availableTablesCount = tables.filter(t => t.status === 'available').length;
  const reservedTablesCount = tables.filter(t => t.status === 'reserved').length;
  const cleaningTablesCount = tables.filter(t => t.status === 'cleaning').length;
  const totalCurrentGuests = occupiedTables.reduce((acc, t) => acc + (t.currentGuests || t.capacity), 0);
  const occupancyRate = totalTablesCount > 0 ? Math.round((occupiedTables.length / totalTablesCount) * 100) : 0;

  // Average time in restaurant for currently seated tables
  const seatedElapsedList = occupiedTables
    .map(t => getElapsedSeatedTime(t.seatedAt)?.minutes || 0)
    .filter(m => m > 0);
  const avgSeatedTime = seatedElapsedList.length > 0
    ? Math.round(seatedElapsedList.reduce((a, b) => a + b, 0) / seatedElapsedList.length)
    : 0;

  // Filtered Tables by Status and Minimum Guests Capacity
  const filteredTables = tables.filter(t => {
    let matchGuests = true;
    if (minGuestsFilter !== 'All') {
      const minCount = Number(minGuestsFilter);
      if (!isNaN(minCount)) {
        matchGuests = t.capacity >= minCount;
      }
    }

    const matchStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchGuests && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Live Seating Stats & KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl p-4 shadow-md shadow-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Live Occupancy</span>
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono">{occupancyRate}%</span>
            <div className="w-full bg-amber-700/50 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
            </div>
          </div>
          <span className="text-[10px] text-amber-100 mt-2 font-medium">
            {occupiedTables.length} of {totalTablesCount} tables in use
          </span>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Available Tables</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-emerald-800">{availableTablesCount}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Ready for walk-ins & bookings</span>
        </div>

        <div className="bg-white border border-red-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Currently Seated</span>
            <Users className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900">{totalCurrentGuests}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">Guests</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Across {occupiedTables.length} active tables</span>
        </div>

        <div className="bg-white border border-sky-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Avg Dining Time</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-slate-900">{avgSeatedTime}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">Mins</span>
          </div>
          <span className="text-[10px] text-sky-600 font-medium">Live average table turnaround</span>
        </div>

        <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Upcoming Reserved</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black font-mono text-purple-900">{reservedTablesCount}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">Tables</span>
          </div>
          <span className="text-[10px] text-purple-600 font-medium">{cleaningTablesCount} in cleaning</span>
        </div>
      </div>

      {/* Control Bar: Status Tabs, Party Size Filter, View Toggles, Add Table */}
      <div className="bg-white border border-amber-200/70 rounded-2xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
        
        {/* Status Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'All', label: 'All Tables', count: totalTablesCount },
            { id: 'available', label: '🟢 Available', count: availableTablesCount },
            { id: 'occupied', label: '🔴 Occupied', count: occupiedTables.length },
            { id: 'reserved', label: '🟣 Reserved', count: reservedTablesCount },
            { id: 'cleaning', label: '🧹 Cleaning', count: cleaningTablesCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatus === tab.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedStatus === tab.id ? 'bg-red-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Party Size / Guest Filter, Layout Toggle & Action Buttons */}
        <div className="flex items-center gap-2 justify-between lg:justify-end flex-wrap">
          {/* Party Size Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold text-slate-600">Guests:</span>
            <select
              value={minGuestsFilter}
              onChange={(e) => setMinGuestsFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">Any Party Size</option>
              <option value="1">1+ People</option>
              <option value="2">2+ People</option>
              <option value="3">3+ People</option>
              <option value="4">4+ People</option>
              <option value="6">6+ People</option>
              <option value="8">8+ Large Party</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('floor')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'floor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Floor Plan Layout View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Floor Map</span>
            </button>
          </div>

          {/* Auto-Assign Tables & 15m Grace Hold Button */}
          <button
            onClick={handleTriggerAutoAssignAndHold}
            disabled={isAutoEvaluating}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-purple-600/20 transition-all"
            title="Automatically assign available tables to reservations and enforce 15-minute no-show hold before auto-rescheduling"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-200 ${isAutoEvaluating ? 'animate-spin' : ''}`} />
            <span>{isAutoEvaluating ? 'Evaluating...' : 'Auto-Assign (15m Hold)'}</span>
          </button>

          {/* Add New Table Button */}
          <button
            onClick={() => {
              setEditingTable({
                tableNumber: `T-${(tables.length + 1).toString().padStart(2, '0')}`,
                capacity: 4,
                status: 'available',
                assignedServer: 'Rohit K.'
              });
              setIsAddEditModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-red-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Auto-Evaluation Banner Feedback */}
      {evalFeedback && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>{evalFeedback}</span>
          </div>
          <button onClick={() => setEvalFeedback(null)} className="text-purple-600 hover:text-purple-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TABLE MONITORING MAIN VIEW */}
      {viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const isOccupied = table.status === 'occupied' || table.status === 'bill_issued';
            const elapsed = getElapsedSeatedTime(table.seatedAt);
            const remainingMins = getTimeRemaining(table.expectedVacateTime);

            // Timer color coding based on duration spent
            let timerBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (elapsed && elapsed.minutes >= 75) {
              timerBadgeClass = 'bg-red-50 text-red-700 border-red-200 animate-pulse';
            } else if (elapsed && elapsed.minutes >= 45) {
              timerBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            }

            return (
              <div
                key={table.id}
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 transition-all shadow-xs hover:shadow-md ${
                  table.status === 'occupied'
                    ? 'border-red-200/90 ring-1 ring-red-500/10'
                    : table.status === 'bill_issued'
                    ? 'border-amber-300 bg-amber-50/20'
                    : table.status === 'reserved'
                    ? 'border-purple-200'
                    : table.status === 'cleaning'
                    ? 'border-sky-200'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Table Header: Number, Capacity, Status Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {table.tableNumber}
                      </span>
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Fits {table.capacity} People</span>
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        table.status === 'occupied'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : table.status === 'bill_issued'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : table.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : table.status === 'reserved'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {table.status === 'bill_issued' ? 'Bill Issued' : table.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center justify-between">
                    <span>{table.capacity} Person Table</span>
                    {table.assignedServer && (
                      <span className="text-[10px] text-slate-400 font-normal">Server: {table.assignedServer}</span>
                    )}
                  </div>
                </div>

                {/* Seated Info & Real-Time Elapsed Seating Timer */}
                {isOccupied && elapsed ? (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                        {table.currentPartyName || 'Guest Party'}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{table.currentGuests || table.capacity} guests</span>
                      </div>
                    </div>

                    {/* Dynamic Real-Time Ticking Stop-Watch */}
                    <div className={`p-2 rounded-lg border flex items-center justify-between ${timerBadgeClass}`}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Time in Restaurant:</span>
                      </div>
                      <span className="font-mono font-black text-xs">
                        {elapsed.formatted}
                      </span>
                    </div>

                    {/* Progress / Estimated turnover time */}
                    {table.expectedVacateTime && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Expected Turn:</span>
                        <span className={`font-bold ${remainingMins !== null && remainingMins <= 0 ? 'text-red-600 font-mono' : 'text-slate-700'}`}>
                          {remainingMins !== null && remainingMins > 0 ? `In ~${remainingMins} mins` : 'Turnover due now'}
                        </span>
                      </div>
                    )}

                    {table.assignedServer && (
                      <div className="text-[10px] text-slate-500">
                        Server: <strong className="text-slate-800">{table.assignedServer}</strong>
                      </div>
                    )}

                    {table.notes && (
                      <div className="text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded border border-amber-200 italic line-clamp-1">
                        "{table.notes}"
                      </div>
                    )}
                  </div>
                ) : table.status === 'reserved' ? (
                  (() => {
                    const holdCountdown = getHoldCountdown(table.holdExpiresAt);
                    return (
                      <div className="bg-purple-50/90 border border-purple-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-purple-900 text-xs font-bold truncate max-w-[130px]">
                            <Calendar className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                            <span className="truncate">{table.currentPartyName || 'Reserved Booking'}</span>
                          </div>
                          {table.reservedTime && (
                            <span className="text-[11px] font-mono font-bold text-purple-800 bg-purple-200/70 px-1.5 py-0.5 rounded">
                              {table.reservedTime}
                            </span>
                          )}
                        </div>

                        {/* 15-Minute Grace Period Hold Countdown */}
                        <div className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
                          holdCountdown && holdCountdown.isExpired
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-purple-100/70 text-purple-900 border-purple-300/80'
                        }`}>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-purple-700" />
                              <span>15m Grace Hold:</span>
                            </span>
                            <span className="font-mono font-black text-xs">
                              {holdCountdown ? holdCountdown.formatted : '15m Window'}
                            </span>
                          </div>
                          <span className="text-[9px] text-purple-700 leading-tight">
                            ⚡ Auto-reschedules to next slot if no arrival within 15 min
                          </span>
                        </div>

                        {table.notes && (
                          <div className="text-[10px] text-purple-800 bg-purple-100/40 p-1.5 rounded border border-purple-200/60 italic line-clamp-1">
                            "{table.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : table.status === 'cleaning' ? (
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center space-y-1">
                    <div className="text-xs font-bold text-sky-800 flex items-center justify-center gap-1">
                      <RotateCcw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                      <span>Table Bussed & Cleaning</span>
                    </div>
                    <div className="text-[10px] text-sky-600">Sanitizing for next guest</div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-3 text-center space-y-1">
                    <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for Guests</span>
                    </div>
                    <div className="text-[10px] text-emerald-600">Available for walk-in seating</div>
                  </div>
                )}

                {/* Table Actions Toolbar */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                  {table.status === 'available' ? (
                    <button
                      onClick={() => {
                        setSeatingModalTable(table);
                        setSeatingGuests(table.capacity);
                        setSeatingPartyName('');
                        setSeatingDuration(90);
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Seat Walk-in / Guest</span>
                    </button>
                  ) : table.status === 'occupied' ? (
                    <div className="w-full grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleIssueBill(table.id)}
                        className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <DollarSign className="w-3 h-3 text-amber-600" />
                        <span>Issue Bill</span>
                      </button>
                      <button
                        onClick={() => handleExtendStay(table.id, 15)}
                        className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                        <span>+15 Mins</span>
                      </button>
                      <button
                        onClick={() => handleCompleteTable(table.id, 'cleaning')}
                        className="col-span-2 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Clear & Mark Cleaning</span>
                      </button>
                    </div>
                  ) : table.status === 'bill_issued' ? (
                    <div className="w-full flex items-center gap-1.5">
                      <button
                        onClick={() => handleCompleteTable(table.id, 'cleaning')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Payment Received (Clean)</span>
                      </button>
                    </div>
                  ) : table.status === 'cleaning' ? (
                    <button
                      onClick={() => handleDirectStatusChange(table.id, 'available')}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready (Mark Available)</span>
                    </button>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          setSeatingModalTable(table);
                          setSeatingGuests(table.capacity);
                          setSeatingPartyName(table.currentPartyName || '');
                        }}
                        className="py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                      >
                        <span>Seat Reservation</span>
                      </button>
                      <button
                        onClick={() => handleDirectStatusChange(table.id, 'available')}
                        className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center"
                      >
                        <span>Cancel Booking</span>
                      </button>
                    </div>
                  )}

                  {/* Secondary Edit/Delete Icon buttons */}
                  <div className="w-full flex justify-between items-center pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="font-mono">ID: {table.id}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTable(table);
                          setIsAddEditModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                        title="Edit Table Details"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setTableToDelete({ id: table.id, tableNumber: table.tableNumber })}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Delete Table"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* INTERACTIVE FLOOR PLAN VIEW */
        <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <h4 className="font-bold text-slate-900 font-serif text-base">Restaurant Floor Map Overview</h4>
              <p className="text-xs text-slate-500">Live floor layout of all tables with real-time guest assignments and booking statuses.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
              <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Available</span>
              <span className="flex items-center gap-1 text-red-700"><span className="w-2.5 h-2.5 rounded bg-red-500" /> Occupied</span>
              <span className="flex items-center gap-1 text-amber-700"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Bill Issued</span>
              <span className="flex items-center gap-1 text-purple-700"><span className="w-2.5 h-2.5 rounded bg-purple-500" /> Reserved</span>
            </div>
          </div>

          {/* Render Tables in Floor Plan Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
            {filteredTables.map((table) => {
              const isOccupied = table.status === 'occupied' || table.status === 'bill_issued';
              const elapsed = getElapsedSeatedTime(table.seatedAt);

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (table.status === 'available' || table.status === 'reserved') {
                      setSeatingModalTable(table);
                      setSeatingGuests(table.capacity);
                      setSeatingPartyName(table.currentPartyName || '');
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                    table.status === 'occupied'
                      ? 'bg-red-50 border-red-300 text-red-900 shadow-xs hover:border-red-500'
                      : table.status === 'bill_issued'
                      ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs hover:border-amber-500'
                      : table.status === 'reserved'
                      ? 'bg-purple-50 border-purple-300 text-purple-900 hover:border-purple-500'
                      : table.status === 'cleaning'
                      ? 'bg-sky-50 border-sky-300 text-sky-900 hover:border-sky-500'
                      : 'bg-white border-emerald-200 text-slate-900 hover:border-emerald-500 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-black text-sm">{table.tableNumber}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">Fits {table.capacity}</span>
                  </div>

                  <div className="my-auto py-1">
                    {isOccupied && elapsed ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold font-mono block text-red-700">
                          ⏱️ {elapsed.minutes}m seated
                        </span>
                        <span className="text-[10px] font-bold text-slate-900 truncate block max-w-full">
                          {table.currentPartyName || 'Guest Party'}
                        </span>
                      </div>
                    ) : table.status === 'reserved' ? (
                      (() => {
                        const holdCountdown = getHoldCountdown(table.holdExpiresAt);
                        return (
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                              <span>📅 {table.reservedTime || 'Reserved'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-purple-950 truncate block max-w-full">
                              {table.currentPartyName || 'Booking'}
                            </span>
                            <span className={`text-[9px] font-bold block ${
                              holdCountdown && holdCountdown.isExpired ? 'text-rose-600' : 'text-purple-700'
                            }`}>
                              ⏳ {holdCountdown ? (holdCountdown.isExpired ? 'Expired' : `${holdCountdown.minutes}m hold left`) : '15m Hold'}
                            </span>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                        {table.status === 'bill_issued' ? 'Bill Issued' : table.status}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between border-t border-slate-200/60 pt-1">
                    <span className="truncate max-w-[70px]">{table.assignedServer || 'Staff'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableToDelete({ id: table.id, tableNumber: table.tableNumber });
                      }}
                      className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEATING MODAL (Walk-in or Booking) */}
      {seatingModalTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base font-serif">
                  Seat Party at Table {seatingModalTable.tableNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Capacity: {seatingModalTable.capacity} Guests • {seatingModalTable.assignedServer || 'Service Staff'}
                </p>
              </div>
              <button
                onClick={() => setSeatingModalTable(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSeatParty} className="space-y-3.5 text-xs">
              {/* Optional: Link with today's reservations */}
              {reservations.filter(r => r.status === 'confirmed').length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link Confirmed Reservation (Optional)
                  </label>
                  <select
                    value={selectedReservationId}
                    onChange={(e) => {
                      const resId = e.target.value;
                      setSelectedReservationId(resId);
                      const found = reservations.find(r => r.id === resId);
                      if (found) {
                        setSeatingPartyName(found.name);
                        setSeatingGuests(found.guests);
                        setSeatingNotes(`Reservation #${found.reservationNumber} (${found.time})`);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  >
                    <option value="">-- Walk-in Guest (No pre-booking) --</option>
                    {reservations
                      .filter(r => r.status === 'confirmed')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          #{r.reservationNumber} - {r.name} ({r.guests} guests, {r.time})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest / Party Name</label>
                <input
                  type="text"
                  required
                  value={seatingPartyName}
                  onChange={(e) => setSeatingPartyName(e.target.value)}
                  placeholder="e.g. Verma Family / Walk-in"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Count of People Joining Dinner
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setSeatingGuests(Math.max(1, seatingGuests - 1))}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-l-xl border border-r-0 border-slate-300 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={seatingModalTable.capacity + 4}
                      required
                      value={seatingGuests}
                      onChange={(e) => setSeatingGuests(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border-y border-slate-300 py-2 text-center text-slate-900 font-bold focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSeatingGuests(seatingGuests + 1)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-r-xl border border-l-0 border-slate-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Table max fits ~{seatingModalTable.capacity} people
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Duration</label>
                  <select
                    value={seatingDuration}
                    onChange={(e) => setSeatingDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  >
                    <option value={45}>45 Minutes (Quick Lunch)</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours (Standard Dinner)</option>
                    <option value={120}>2 Hours (Banquet / Party)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Server</label>
                  <select
                    value={seatingServer}
                    onChange={(e) => setSeatingServer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  >
                    <option value="Rohit K.">Rohit K. (Senior Captain)</option>
                    <option value="Anita S.">Anita S. (Main Floor)</option>
                    <option value="Vikram M.">Vikram M. (Terrace & Floor)</option>
                    <option value="Sunil R.">Sunil R. (VIP Booths)</option>
                    <option value="Deepak T.">Deepak T. (Garden Terrace)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Notes</label>
                  <input
                    type="text"
                    value={seatingNotes}
                    onChange={(e) => setSeatingNotes(e.target.value)}
                    placeholder="e.g. Extra high-chair, birthday"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSeatingModalTable(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-md"
                >
                  Start Dining Session (Start Timer)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT TABLE CONFIG MODAL */}
      {isAddEditModalOpen && editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-amber-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingTable.id ? 'Edit Table Configuration' : 'Add New Dining Table'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTableConfig} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Table Number</label>
                  <input
                    type="text"
                    required
                    value={editingTable.tableNumber || ''}
                    onChange={(e) => setEditingTable({ ...editingTable, tableNumber: e.target.value })}
                    placeholder="e.g. T-11, T-12, T-13"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Table Capacity (Number of People)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={editingTable.capacity || 4}
                    onChange={(e) => setEditingTable({ ...editingTable, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Server / Staff Name</label>
                <input
                  type="text"
                  value={editingTable.assignedServer || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, assignedServer: e.target.value })}
                  placeholder="e.g. Rohit K."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={editingTable.notes || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, notes: e.target.value })}
                  placeholder="e.g. Window-side table, booth seating"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                {editingTable.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTableToDelete({ id: editingTable.id!, tableNumber: editingTable.tableNumber || 'Table' });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Table</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md"
                  >
                    Save Table
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TABLE MODAL */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white border border-red-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-serif">Remove {tableToDelete.tableNumber}?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete {tableToDelete.tableNumber} from the restaurant dining floor?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingTable}
                onClick={() => setTableToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTable}
                onClick={() => handleDeleteTable(tableToDelete.id)}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingTable ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Delete Table</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
