import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Trash2,
  Receipt,
  Phone,
  Search,
  Sparkles,
  RefreshCw,
  X,
  User as UserIcon,
  Flame,
  ChevronRight,
  TrendingUp,
  CreditCard,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Check
} from 'lucide-react';
import { RestaurantTable, MenuItem, TableOrder, ServerStat, SMSInvoice } from '../types';
import { getApiUrl } from '../utils/api';

interface ServerTaskMonitorProps {
  currentUserName?: string;
  isMaster?: boolean;
  onRefreshParent?: () => void;
}

export interface OrderHistoryItem {
  id: string;
  tableNumber: string;
  partyName: string;
  customerPhone?: string;
  serverName: string;
  status: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: string;
  invoiceNumber: string;
  createdAt: string;
  date: string;
  time: string;
  items: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    spiceLevel?: string;
    dietaryNotes?: string;
  }>;
}

export const ServerTaskMonitor: React.FC<ServerTaskMonitorProps> = ({
  currentUserName = 'Staff Server',
  isMaster = false,
  onRefreshParent
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tables' | 'history' | 'stats'>('tables');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [tableOrder, setTableOrder] = useState<TableOrder | null>(null);
  const [serverStats, setServerStats] = useState<ServerStat[]>([]);
  const [activeServerName, setActiveServerName] = useState<string>(currentUserName);
  const [nowTimestamp, setNowTimestamp] = useState<number>(Date.now());

  // 7-Day Order History State
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [historySearch, setHistorySearch] = useState<string>('');
  const [selectedHistoryReceipt, setSelectedHistoryReceipt] = useState<OrderHistoryItem | null>(null);

  // Menu Order Taking Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSpice, setSelectedSpice] = useState('Medium');
  const [dietaryNote, setDietaryNote] = useState('');
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // SMS Invoice State
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSentData, setSmsSentData] = useState<SMSInvoice | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Real-time timer ticker (every second) for live elapsed time & 5m cleaning countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNowTimestamp(currentNow);

      // Auto-turn cleaning tables to available once 5 minutes (300s) pass
      tables.forEach(tbl => {
        if (tbl.status === 'cleaning' && tbl.cleaningStartedAt) {
          const startTime = new Date(tbl.cleaningStartedAt).getTime();
          if (currentNow - startTime >= 5 * 60 * 1000) {
            handleCompleteTable(tbl.id, 'available');
          }
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [tables]);

  // Helper for 5-minute cleaning countdown
  const getCleaningCountdown = (cleaningStartedAt?: string) => {
    const start = cleaningStartedAt ? new Date(cleaningStartedAt).getTime() : nowTimestamp;
    const durationMs = 5 * 60 * 1000;
    const remainingMs = Math.max(0, (start + durationMs) - nowTimestamp);
    if (remainingMs <= 0) {
      return { isDone: true, formatted: '0m 00s (Cleaned)' };
    }
    const totalMinutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return {
      isDone: false,
      formatted: `${totalMinutes}m ${seconds.toString().padStart(2, '0')}s remaining`
    };
  };

  // Generate the last 7 dates array for the history tab
  const pastSevenDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
      dates.push({ dateStr: isoStr, label, dateObj: d });
    }
    return dates;
  }, []);

  // Fetch Tables, Menu, Server Stats & 7-Day History
  const fetchData = async () => {
    const token = localStorage.getItem('indochinese_admin_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      // 1. Fetch tables
      const tablesRes = await fetch(getApiUrl('/api/tables'), { headers });
      if (tablesRes.ok) {
        const tData = await tablesRes.json();
        setTables(tData);
      }

      // 2. Fetch menu
      const menuRes = await fetch(getApiUrl('/api/menu'));
      if (menuRes.ok) {
        const mData = await menuRes.json();
        setMenuItems(mData);
      }

      // 3. Fetch server stats
      const statsRes = await fetch(getApiUrl('/api/orders/server-stats'), { headers });
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setServerStats(Array.isArray(sData) ? sData : [sData]);
      }

      // 4. Fetch 7-Day Order History
      const histRes = await fetch(getApiUrl('/api/orders/history?days=7'), { headers });
      if (histRes.ok) {
        const hData = await histRes.json();
        setOrderHistory(hData);
      }
    } catch (err) {
      console.error('Error fetching server task data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch order for selected table
  const fetchTableOrder = async (table: RestaurantTable) => {
    setIsLoadingOrder(true);
    setSmsSentData(null);
    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${table.id}`));
      if (res.ok) {
        const orderData: TableOrder = await res.json();
        setTableOrder(orderData);
        if (orderData.customerPhone) {
          setSmsPhone(orderData.customerPhone);
        }
      }
    } catch (err) {
      console.error('Error fetching table order:', err);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleOpenTableOrder = (table: RestaurantTable) => {
    setSelectedTable(table);
    fetchTableOrder(table);
    setIsOrderModalOpen(true);
  };

  // Add Item to Table Order
  const handleAddItemToOrder = async (item: MenuItem) => {
    if (!selectedTable) return;
    setIsActionLoading(true);

    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${selectedTable.id}/items`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          spiceLevel: selectedSpice,
          dietaryNotes: dietaryNote
        })
      });

      if (res.ok) {
        await fetchTableOrder(selectedTable);
        setDietaryNote('');
        fetchData();
        setFeedbackMsg({ text: `Added ${item.name} (£${item.price.toFixed(2)}) to Table ${selectedTable.tableNumber}`, type: 'success' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error adding item:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Remove Item
  const handleRemoveItem = async (itemId: string) => {
    if (!selectedTable) return;
    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${selectedTable.id}/items/${itemId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchTableOrder(selectedTable);
        fetchData();
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  // Issue Bill -> Synchronizes table status to 'bill_issued'
  const handleIssueBill = async () => {
    if (!selectedTable || !tableOrder) return;
    setIsActionLoading(true);

    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${selectedTable.id}/issue-bill`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: smsPhone,
          partyName: selectedTable.notes || 'Dining Guest'
        })
      });

      if (res.ok) {
        const data = await res.json();
        await fetchTableOrder(selectedTable);
        fetchData();
        if (onRefreshParent) onRefreshParent();
        setFeedbackMsg({
          text: `Bill Issued! Amount to be paid: £${data.totalAmount.toFixed(2)} (Ref: ${data.invoiceNumber})`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error issuing bill:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Send SMS Invoice
  const handleSendSMSInvoice = async () => {
    if (!selectedTable || !smsPhone.trim()) {
      setFeedbackMsg({ text: 'Please enter a valid customer phone number', type: 'error' });
      return;
    }
    setIsActionLoading(true);

    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${selectedTable.id}/send-sms-invoice`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: smsPhone.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setSmsSentData(data);
        await fetchTableOrder(selectedTable);
        setFeedbackMsg({ text: `✓ Itemized SMS Invoice sent to ${smsPhone}!`, type: 'success' });
      } else {
        const errData = await res.json();
        setFeedbackMsg({ text: errData.detail || 'Failed to dispatch SMS invoice', type: 'error' });
      }
    } catch (err) {
      console.error('Error sending SMS:', err);
      setFeedbackMsg({ text: 'Network error sending SMS', type: 'error' });
    } finally {
      setIsActionLoading(false);
    }
  };

  // Complete Table -> Initiates 5-minute cleaning turnaround before marking clean
  const handleCompleteTable = async (tableIdParam?: string, targetStatus: 'cleaning' | 'available' = 'cleaning') => {
    const tId = tableIdParam || selectedTable?.id;
    if (!tId) return;

    setIsActionLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/orders/tables/${tId}/complete`), {
        method: 'POST'
      });

      if (res.ok) {
        setIsOrderModalOpen(false);
        setSelectedTable(null);
        setTableOrder(null);
        fetchData();
        if (onRefreshParent) onRefreshParent();
        setFeedbackMsg({
          text: targetStatus === 'cleaning' 
            ? `Table marked for 5-minute sanitization & cleaning turnover!` 
            : `Table cleaned and available for new guests!`,
          type: 'success'
        });
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error completing table:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Direct manual clean & ready button
  const handleMarkCleanNow = async (tableId: string) => {
    const token = localStorage.getItem('indochinese_admin_token');
    try {
      const res = await fetch(getApiUrl(`/api/admin/tables/${tableId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'available' })
      });
      if (res.ok) {
        fetchData();
        if (onRefreshParent) onRefreshParent();
        setFeedbackMsg({ text: 'Table marked cleaned & ready for new diners!', type: 'success' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Active Server Stats
  const activeStat = serverStats.find(s => s.serverName.toLowerCase() === activeServerName.toLowerCase()) || {
    serverName: activeServerName,
    activeTablesCount: tables.filter(t => t.status !== 'available').length,
    completedTablesToday: 0,
    totalTablesServedToday: 0,
    ordersTakenToday: 0,
    totalRevenueToday: 0.0,
    efficiencyScore: '98%',
    activeTables: []
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory ||
      (selectedCategory === 'starters' && (item.category.includes('starter') || item.category === 'dumplings')) ||
      (selectedCategory === 'mains' && (item.category.includes('rice') || item.category.includes('noodle') || item.category.includes('mains')));
    return matchesSearch && matchesCat;
  });

  // Filtered Order History
  const filteredHistory = useMemo(() => {
    return orderHistory.filter(ord => {
      const matchDate = !selectedHistoryDate || ord.date === selectedHistoryDate;
      const q = historySearch.toLowerCase().trim();
      const matchSearch = !q ||
        ord.tableNumber.toLowerCase().includes(q) ||
        ord.partyName.toLowerCase().includes(q) ||
        ord.invoiceNumber.toLowerCase().includes(q) ||
        (ord.customerPhone && ord.customerPhone.includes(q)) ||
        ord.items.some(i => i.itemName.toLowerCase().includes(q));
      return matchDate && matchSearch;
    });
  }, [orderHistory, selectedHistoryDate, historySearch]);

  const historyDailyRevenue = filteredHistory.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const historyOrdersCount = filteredHistory.length;
  const historyAvgSpend = historyOrdersCount > 0 ? (historyDailyRevenue / historyOrdersCount) : 0;

  return (
    <div className="space-y-6 text-white animate-fadeIn">
      {/* Top Banner & KPI Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center shadow-inner">
                <UtensilsCrossed className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black font-serif tracking-tight">Floor Server POS & Orders Console</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase rounded-full tracking-wider">
                    All Tables Live
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Logged in as: <span className="text-amber-300 font-bold">{activeServerName}</span> • All Waiters Have Full Floor Coverage
                </p>
              </div>
            </div>
          </div>

          {/* Sub-tab Navigation Switcher & Refresh */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-950/80 border border-slate-700 p-1 rounded-2xl">
              <button
                onClick={() => setActiveSubTab('tables')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'tables' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Floor Tables ({tables.length})</span>
              </button>
              <button
                onClick={() => setActiveSubTab('history')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'history' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>7-Day Order History</span>
              </button>
              <button
                onClick={() => setActiveSubTab('stats')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'stats' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Shift Stats</span>
              </button>
            </div>

            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="Refresh Tables"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time Server Performance KPI Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tables in Service</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-amber-400">
                {tables.filter(t => t.status === 'occupied' || t.status === 'bill_issued').length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">/ {tables.length} Total</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Bills Pending</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-yellow-400">
                {tables.filter(t => t.status === 'bill_issued').length}
              </span>
              <span className="text-[10px] text-yellow-500/80 font-mono">Awaiting Pay</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Cleaning Turnover</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-sky-400">
                {tables.filter(t => t.status === 'cleaning').length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">5m Timers</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Total Orders</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-emerald-400">
                {orderHistory.filter(o => o.date === new Date().toISOString().split('T')[0]).length}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Settled Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-xl border animate-fadeIn ${
          feedbackMsg.type === 'success' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' : 'bg-rose-950/90 border-rose-700 text-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LIVE FLOOR TABLES GRID (T-01 to T-20) */}
      {/* ========================================================================= */}
      {activeSubTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white font-serif">All Dining Tables (20 Tables)</h3>
              <p className="text-xs text-slate-400">Every waiter is assigned to all tables. Select any table to take orders or issue bills.</p>
            </div>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
              {tables.filter(t => t.status === 'available').length} Tables Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tables.map((table) => {
              const isOccupied = table.status === 'occupied';
              const isBillIssued = table.status === 'bill_issued';
              const isCleaning = table.status === 'cleaning';
              const isAvailable = table.status === 'available';

              return (
                <div
                  key={table.id}
                  className={`rounded-3xl border p-5 transition-all relative overflow-hidden group hover:shadow-2xl ${
                    isBillIssued
                      ? 'bg-amber-950/40 border-amber-500/70 shadow-amber-900/30 ring-1 ring-amber-500/50'
                      : isCleaning
                      ? 'bg-sky-950/40 border-sky-500/70 shadow-sky-900/30'
                      : isOccupied
                      ? 'bg-red-950/30 border-red-600/50 shadow-red-900/20'
                      : isAvailable
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-blue-950/30 border-blue-700/50'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-black font-mono tracking-tight text-white">{table.tableNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded-md text-slate-400">
                        {table.capacity} Guests
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      isBillIssued
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                        : isCleaning
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                        : isOccupied
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isAvailable
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {isBillIssued ? 'Bill Issued' : isCleaning ? 'Cleaning (5m)' : table.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5 text-xs text-slate-300 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Area:</span>
                      <span className="font-medium text-slate-300">{table.area || 'Main Dining'}</span>
                    </div>
                    {isCleaning && (
                      <div className="p-2 bg-sky-950/80 border border-sky-800 rounded-xl text-center">
                        <span className="text-[10px] text-sky-400 font-bold uppercase block">Cleaning Turnover</span>
                        <span className="font-mono text-xs font-bold text-sky-200">
                          {getCleaningCountdown(table.cleaningStartedAt)?.formatted}
                        </span>
                      </div>
                    )}
                    {table.notes && !isCleaning && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Party/Notes:</span>
                        <span className="font-mono text-slate-300 truncate max-w-[140px]">{table.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-1.5">
                    {isCleaning ? (
                      <button
                        onClick={() => handleMarkCleanNow(table.id)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>✨ Finish Cleaning (Mark Ready)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenTableOrder(table)}
                        className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 cursor-pointer ${
                          isBillIssued
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                            : isOccupied
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                        }`}
                      >
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>
                          {isBillIssued ? 'View Bill / Settle Table' : isOccupied ? 'Take Order / Settle' : 'Take Walk-in Order'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: 7-DAY CUSTOMER ORDER HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Date Selector Pills for Last 7 Days */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-base font-serif text-white">7-Day Customer Order History</h3>
                <p className="text-xs text-slate-400">Review all settled diner orders, itemized receipts, and daily sales across the past week.</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <input
                  type="date"
                  value={selectedHistoryDate}
                  onChange={(e) => setSelectedHistoryDate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 7 Days Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {pastSevenDates.map(item => (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedHistoryDate(item.dateStr)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedHistoryDate === item.dateStr
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    selectedHistoryDate === item.dateStr ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {orderHistory.filter(o => o.date === item.dateStr).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search orders by customer name, phone, table number, invoice # or dish item..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Daily Revenue KPI Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Sales ({selectedHistoryDate})</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">£{historyDailyRevenue.toFixed(2)}</div>
              </div>
              <DollarSign className="w-8 h-8 text-amber-500/30" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Total Customer Orders</span>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{historyOrdersCount}</div>
              </div>
              <Receipt className="w-8 h-8 text-emerald-500/30" />
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-400">Average Spend / Table</span>
                <div className="text-2xl font-black text-sky-400 font-mono mt-1">£{historyAvgSpend.toFixed(2)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-sky-500/30" />
            </div>
          </div>

          {/* Order Cards List */}
          {filteredHistory.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-2">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="font-bold text-sm text-slate-400">No orders recorded for {selectedHistoryDate}</p>
              <p className="text-xs text-slate-600">Select another day above or settle table dining sessions to view history receipts.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHistory.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all"
                >
                  <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm font-serif">Table {ord.tableNumber}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded">
                          {ord.invoiceNumber}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        Party: <strong className="text-slate-200">{ord.partyName}</strong> • Server: {ord.serverName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-amber-400 font-mono block">
                        £{ord.totalAmount.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-500">{ord.time}</span>
                    </div>
                  </div>

                  {/* Items list preview */}
                  <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl text-xs">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>
                          <strong className="text-amber-400 font-mono mr-1.5">{it.quantity}x</strong>
                          {it.itemName}
                        </span>
                        <span className="font-mono text-slate-400">£{it.totalPrice.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
                      <span>UK VAT (20%): £{ord.tax.toFixed(2)}</span>
                      <span className="text-emerald-400 font-bold uppercase">PAID & SETTLED</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => setSelectedHistoryReceipt(ord)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Full Tax Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: SHIFT ANALYTICS */}
      {/* ========================================================================= */}
      {activeSubTab === 'stats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-bold text-base font-serif text-white">Waiter Shift Performance & Floor Analytics</h3>
            <p className="text-xs text-slate-400">Real-time stats across all floor waitstaff and service efficiency.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serverStats.map((s, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-sm">{s.serverName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Score: {s.efficiencyScore}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tables Served Today:</span>
                    <span className="font-bold text-white">{s.totalTablesServedToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dishes Ordered:</span>
                    <span className="font-bold text-white">{s.ordersTakenToday} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sales Turnover:</span>
                    <span className="font-bold text-amber-400 font-mono">£{s.totalRevenueToday.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ITEMIZED TAX RECEIPT MODAL (7-DAY HISTORY) */}
      {/* ========================================================================= */}
      {selectedHistoryReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-serif font-black text-lg text-slate-950">INDO CHINESE BOMBAY</h4>
                <p className="text-xs text-slate-500">124 High Street, Hounslow TW3 1NA • 072777586916</p>
                <p className="text-xs text-slate-500 font-mono">Tax Invoice: {selectedHistoryReceipt.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedHistoryReceipt(null)}
                className="text-slate-400 hover:text-slate-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold">{selectedHistoryReceipt.date} at {selectedHistoryReceipt.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Table Number:</span>
                <span className="font-bold">{selectedHistoryReceipt.tableNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guest / Party:</span>
                <span className="font-bold">{selectedHistoryReceipt.partyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Server:</span>
                <span className="font-bold">{selectedHistoryReceipt.serverName}</span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs font-mono">
              {selectedHistoryReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.itemName}</span>
                  <span className="font-bold">£{it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Net Subtotal:</span>
                <span className="font-mono">£{selectedHistoryReceipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>UK VAT (20% Included):</span>
                <span className="font-mono">£{selectedHistoryReceipt.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>TOTAL PAID:</span>
                <span className="font-mono text-red-600">£{selectedHistoryReceipt.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedHistoryReceipt(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE TABLE ORDER TAKING & LIVE POS MODAL */}
      {/* ========================================================================= */}
      {isOrderModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn text-white">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black font-serif">Table {selectedTable.tableNumber} Order Console</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tableOrder?.status === 'bill_issued' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {tableOrder?.status === 'bill_issued' ? 'Bill Issued (Pending)' : tableOrder?.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Floor Service • Zone: {selectedTable.area || 'Main Dining'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Split View: Left = Menu Browser, Right = Active Cart & Billing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* LEFT COLUMN: Menu Browser & Dish Selector */}
              <div className="lg:col-span-7 p-4 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col overflow-y-auto max-h-[55vh] lg:max-h-[75vh]">
                {/* Search & Category Filter */}
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search menu items (e.g. Manchow, Hakka, Lollipop)..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    {[
                      { id: 'all', label: 'All Dishes' },
                      { id: 'soups', label: 'Soups' },
                      { id: 'momos', label: 'Dumplings / Momos' },
                      { id: 'veg_starters', label: 'Veg Starters' },
                      { id: 'nonveg_starters', label: 'Non-Veg Starters' },
                      { id: 'rice_noodles', label: 'Rice & Noodles' },
                      { id: 'combos', label: 'Combos' },
                      { id: 'chips', label: 'Special Chips' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all cursor-pointer ${
                          selectedCategory === cat.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Spice & Custom Note Bar */}
                  <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700/60 text-xs">
                    <div className="flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Spice:</span>
                    </div>
                    <select
                      value={selectedSpice}
                      onChange={(e) => setSelectedSpice(e.target.value)}
                      className="bg-slate-900 text-amber-300 font-bold text-[11px] rounded px-2 py-1 border border-slate-600"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Extra Spicy">Extra Spicy 🌶️</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Kitchen instruction (e.g. no onion/extra crispy)..."
                      value={dietaryNote}
                      onChange={(e) => setDietaryNote(e.target.value)}
                      className="flex-1 bg-slate-900 text-white text-[11px] rounded px-2 py-1 border border-slate-600 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dish Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                  {filteredMenuItems.map((dish) => (
                    <div
                      key={dish.id}
                      className="bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-2xl p-3 flex flex-col justify-between transition-all hover:border-amber-500/50 group"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            {dish.name}
                          </h4>
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            £{dish.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                          {dish.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddItemToOrder(dish)}
                        disabled={isActionLoading}
                        className="mt-2.5 w-full py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add to Table</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Active Cart, Bill Calculation & SMS Invoice */}
              <div className="lg:col-span-5 p-4 flex flex-col justify-between bg-slate-950/40 overflow-y-auto max-h-[55vh] lg:max-h-[75vh]">
                {/* Active Cart List */}
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Table Order</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {tableOrder?.items?.length || 0} Items
                    </span>
                  </div>

                  {isLoadingOrder ? (
                    <div className="py-8 text-center text-xs text-slate-500">Loading order items...</div>
                  ) : !tableOrder || tableOrder.items.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <UtensilsCrossed className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs">No items ordered yet.</p>
                      <p className="text-[10px] text-slate-600">Pick dishes from the left menu to add to this table.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[28vh] overflow-y-auto pr-1">
                      {tableOrder.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-amber-300 font-mono">{item.quantity}x</span>
                              <span className="font-semibold text-white truncate">{item.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                              <span>Spice: {item.spiceLevel || 'Medium'}</span>
                              {item.dietaryNotes && <span className="text-amber-400/80">({item.dietaryNotes})</span>}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-slate-200">£{item.totalPrice.toFixed(2)}</span>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bill Calculation & Summary Box */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal (Net):</span>
                      <span className="font-mono text-slate-200">£{(tableOrder?.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>UK VAT (20% Included):</span>
                      <span className="font-mono text-slate-200">£{(tableOrder?.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="font-extrabold text-sm text-white uppercase tracking-wider">Amount to be Paid:</span>
                      <span className="font-mono font-black text-xl text-amber-400">
                        £{(tableOrder?.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    {tableOrder?.invoiceNumber && (
                      <div className="text-[10px] text-amber-400 font-mono text-center pt-1">
                        Invoice Code: {tableOrder.invoiceNumber}
                      </div>
                    )}
                  </div>

                  {/* SMS Invoice Input & Dispatch */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Customer Phone for SMS Invoice
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          placeholder="e.g. 072777586916"
                          value={smsPhone}
                          onChange={(e) => setSmsPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        onClick={handleSendSMSInvoice}
                        disabled={isActionLoading || !(tableOrder?.totalAmount && tableOrder.totalAmount > 0)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send SMS</span>
                      </button>
                    </div>

                    {smsSentData && (
                      <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded-xl text-[11px] text-emerald-200">
                        <div className="flex items-center space-x-1 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>SMS Invoice Dispatched to {smsSentData.recipientPhone}</span>
                        </div>
                        <p className="font-mono text-[10px] text-emerald-300/80 mt-1 whitespace-pre-wrap">
                          {smsSentData.smsContent.slice(0, 120)}...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Primary Footer Actions: Issue Bill & Complete Table */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleIssueBill}
                      disabled={isActionLoading || !(tableOrder?.items?.length)}
                      className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Issue Table Bill</span>
                    </button>

                    <button
                      onClick={() => handleCompleteTable()}
                      disabled={isActionLoading}
                      className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg active:scale-98 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Clean (5m)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
