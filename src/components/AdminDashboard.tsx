import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  Clock,
  Calendar,
  Utensils,
  Settings,
  Mail,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Layers,
  PartyPopper,
  AlertCircle
} from 'lucide-react';
import {
  Reservation,
  MenuItem,
  ContactMessage,
  RestaurantSettings,
  RestaurantTable,
  EventInquiry
} from '../types';
import { AdminTableMonitor } from './AdminTableMonitor';
import { getApiUrl } from '../utils/api';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  settings: RestaurantSettings;
  onUpdateSettings: (newSettings: RestaurantSettings) => void;
  onMenuUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLoginSuccess,
  onLogout,
  settings,
  onUpdateSettings,
  onMenuUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations' | 'events' | 'menu' | 'settings' | 'messages'>('tables');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<EventInquiry[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Menu Modal State
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<RestaurantSettings>(settings);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    if (isOpen && isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isOpen, isAdminLoggedIn, activeTab]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    setIsLoading(true);
    try {
      if (activeTab === 'tables') {
        const [tableRes, resRes] = await Promise.all([
          fetch(getApiUrl('/api/admin/tables'), { headers: { Authorization: `Bearer ${token}` } }),
          fetch(getApiUrl('/api/admin/reservations'), { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (tableRes.ok) setTables(await tableRes.json());
        if (resRes.ok) setReservations(await resRes.json());
      } else if (activeTab === 'reservations') {
        const res = await fetch(getApiUrl('/api/admin/reservations'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setReservations(await res.json());
      } else if (activeTab === 'events') {
        const res = await fetch(getApiUrl('/api/admin/events'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setEvents(await res.json());
      } else if (activeTab === 'menu') {
        const res = await fetch(getApiUrl('/api/menu'));
        if (res.ok) setMenuItems(await res.json());
      } else if (activeTab === 'messages') {
        const res = await fetch(getApiUrl('/api/admin/contact'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setMessages(await res.json());
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const role = (data.user?.role || '').toLowerCase();
      const isAllowedAdmin = ['admin', 'master', 'super_admin', 'manager', 'server', 'staff', 'employee'].includes(role);

      if (!isAllowedAdmin) {
        throw new Error('Access denied. Admin credentials required.');
      }

      localStorage.setItem('indochinese_admin_token', data.token);
      localStorage.setItem('indochinese_user_data', JSON.stringify(data.user));
      onLoginSuccess(data.token);
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpdateReservationStatus = async (id: string, status: Reservation['status']) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/reservations/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setReservations(reservations.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
    }
  };

  const handleUpdateEventStatus = async (id: string, status: EventInquiry['status']) => {
    const token = localStorage.getItem('indochinese_admin_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setEvents(events.map(ev => ev.id === id ? { ...ev, status } : ev));
      }
    } catch (err) {
      console.error('Error updating event status:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-amber-200 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-scaleUp">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-orange-50/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg text-slate-900">Staff & Floor Dashboard</h2>
              <p className="text-xs text-slate-500">Live dining tables, time monitoring & reservations</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {!isAdminLoggedIn ? (
          <div className="p-8 max-w-md mx-auto w-full space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-2 border border-red-200">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Admin Sign In</h3>
              <p className="text-xs text-slate-500">Enter your credentials to manage floor operations</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                {isLoggingIn ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs Header */}
            <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('tables')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'tables' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Live Tables</span>
                </button>
                <button
                  onClick={() => setActiveTab('reservations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'reservations' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'events' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Events</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'messages' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Messages</span>
                </button>
              </div>

              <button
                onClick={fetchAdminData}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'tables' && (
                <AdminTableMonitor
                  tables={tables}
                  reservations={reservations}
                  onRefresh={fetchAdminData}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'reservations' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reservations.map((res) => (
                      <div key={res.id} className="bg-white border rounded-2xl p-4 space-y-2 shadow-xs text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-red-600">#{res.reservationNumber}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100">{res.status}</span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{res.name}</div>
                        <div className="text-slate-500">{res.phone} • {res.guests} Guests</div>
                        <div className="text-slate-700 font-bold">{res.date} at {res.time}</div>
                        <div className="pt-2 border-t flex justify-end gap-1 font-bold">
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateReservationStatus(res.id, 'completed')}
                            className="px-2.5 py-1 bg-slate-900 text-white rounded-lg"
                          >
                            Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {events.map((ev) => (
                    <div key={ev.id} className="bg-white border rounded-2xl p-4 space-y-2 shadow-xs text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-700">{ev.eventType}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">{ev.status}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{ev.name} ({ev.guests} guests)</div>
                      <div className="text-slate-500">{ev.phone} • {ev.date} at {ev.time}</div>
                      {ev.specialRequests && <div className="text-slate-600 bg-slate-50 p-2 rounded italic">"{ev.specialRequests}"</div>}
                      <div className="pt-2 border-t flex justify-end gap-1 font-bold">
                        <button
                          onClick={() => handleUpdateEventStatus(ev.id, 'confirmed')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className="p-4 border rounded-2xl bg-white space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{m.name} ({m.phone})</span>
                        <span className="text-slate-400 font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="font-semibold text-red-600">{m.subject}</div>
                      <p className="text-slate-600">{m.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
