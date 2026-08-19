import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  LogOut,
  Utensils,
  Flame,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Package,
  RotateCcw,
  X,
  Bell,
  BellRing,
  BellOff,
  Tag,
  Gift,
  Truck,
  Edit3,
  Save,
  Info,
  Calendar,
  Check,
  KeyRound
} from 'lucide-react';
import { User, Order, CartItem, NotificationPreferences } from '../types';
import {
  auth,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendResetEmail,
  signOutUser,
  updateUserFirestoreProfile
} from '../lib/firebase';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification
} from '../utils/notifications';

interface AuthPageProps {
  currentUser: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateOrder?: () => void;
  onNavigateBookTable: () => void;
  initialMode?: 'signin' | 'signup';
  onOpenOrderTracking?: (orderId?: string) => void;
  onQuickReorder?: (items: CartItem[]) => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export function AuthPage({
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
  onNavigateOrder,
  onNavigateBookTable,
  initialMode = 'signin',
  onOpenOrderTracking,
  onQuickReorder,
  onUpdateUser
}: AuthPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Social modal state
  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'apple' | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<'default' | 'custom'>('default');
  const [customSocialEmail, setCustomSocialEmail] = useState('');
  const [customSocialName, setCustomSocialName] = useState('');

  const handleOpenSocialModal = (provider: 'google' | 'apple') => {
    setSocialModalProvider(provider);
    setSelectedAccountType('default');
    setCustomSocialEmail('');
    setCustomSocialName('');
    setErrorMessage('');
  };

  const handleConfirmSocialLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      if (socialModalProvider === 'google') {
        const { user, firebaseUser } = await signInWithGoogle();
        const token = (await firebaseUser.getIdToken()) || 'firebase_token';
        onLoginSuccess(user, token);
        setSocialModalProvider(null);
      } else {
        // Apple / Custom social simulation
        const email =
          selectedAccountType === 'default'
            ? 'dikshithavarma2006@icloud.com'
            : customSocialEmail.trim() || 'guest@icloud.com';
        const name =
          selectedAccountType === 'default'
            ? 'Dikshitha Varma'
            : customSocialName.trim() || 'Apple User';

        const user: User = {
          id: `apple_${Date.now()}`,
          name,
          email,
          phone: '07277758691',
          street: '15 High Street',
          city: 'Hounslow',
          postcode: 'TW3 1AA',
          role: 'customer'
        };
        onLoginSuccess(user, 'apple_token');
        setSocialModalProvider(null);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // Popup was closed or cancelled without completing - clean state gracefully
        setErrorMessage('');
      } else {
        setErrorMessage(err.message || 'Social sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Sign In Form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sign Up Form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpStreet, setSignUpStreet] = useState('');
  const [signUpCity, setSignUpCity] = useState('Hounslow');
  const [signUpPostcode, setSignUpPostcode] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Logged-in Customer View state
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
  const [reorderSuccessOrderId, setReorderSuccessOrderId] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editStreet, setEditStreet] = useState(currentUser?.street || '');
  const [editCity, setEditCity] = useState(currentUser?.city || 'Hounslow');
  const [editPostcode, setEditPostcode] = useState(currentUser?.postcode || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Browser Notification Settings State
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    currentUser?.notificationPreferences?.enabled ?? false
  );
  const [notifyOrderStatus, setNotifyOrderStatus] = useState(
    currentUser?.notificationPreferences?.orderStatus ?? true
  );
  const [notifyOffers, setNotifyOffers] = useState(
    currentUser?.notificationPreferences?.offers ?? true
  );
  const [notifyReservations, setNotifyReservations] = useState(
    currentUser?.notificationPreferences?.reservations ?? true
  );
  const [notificationFeedback, setNotificationFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Sync state when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || '');
      setEditPhone(currentUser.phone || '');
      setEditStreet(currentUser.street || '');
      setEditCity(currentUser.city || 'Hounslow');
      setEditPostcode(currentUser.postcode || '');
      if (currentUser.notificationPreferences) {
        setNotificationsEnabled(currentUser.notificationPreferences.enabled);
        setNotifyOrderStatus(currentUser.notificationPreferences.orderStatus);
        setNotifyOffers(currentUser.notificationPreferences.offers);
        setNotifyReservations(currentUser.notificationPreferences.reservations ?? true);
      }
    }
  }, [currentUser]);

  // Check initial browser notification permission
  useEffect(() => {
    const perm = getNotificationPermission();
    setBrowserPermission(perm);
  }, []);

  // Handler to persist notification preferences to server and localStorage
  const saveNotificationPrefsToBackend = async (newPrefs: NotificationPreferences) => {
    try {
      if (currentUser) {
        await updateUserFirestoreProfile(currentUser.id, { notificationPreferences: newPrefs });
        const updated = { ...currentUser, notificationPreferences: newPrefs };
        localStorage.setItem('indochinese_user_data', JSON.stringify(updated));
        if (onUpdateUser) onUpdateUser(updated);
      }

      const token = localStorage.getItem('indochinese_user_token') || localStorage.getItem('indochinese_admin_token');
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            notificationPreferences: newPrefs
          })
        });
      }
    } catch (err) {
      console.warn('Failed to sync notification preferences:', err);
    }
  };

  // Master Notification Toggle Handler
  const handleToggleMasterNotifications = async () => {
    if (!isNotificationSupported()) {
      setNotificationFeedback({
        type: 'error',
        message: 'Browser notifications are not supported in this environment.'
      });
      return;
    }

    if (!notificationsEnabled) {
      // User wants to enable
      let perm = getNotificationPermission();
      if (perm !== 'granted') {
        perm = await requestNotificationPermission();
        setBrowserPermission(perm);
      }

      if (perm === 'granted') {
        setNotificationsEnabled(true);
        const newPrefs: NotificationPreferences = {
          enabled: true,
          orderStatus: notifyOrderStatus,
          offers: notifyOffers,
          reservations: notifyReservations
        };
        await saveNotificationPrefsToBackend(newPrefs);
        setNotificationFeedback({
          type: 'success',
          message: '🔔 Browser notifications enabled! You will receive live order updates & exclusive Bombay offers.'
        });
        setTimeout(() => setNotificationFeedback(null), 5000);
      } else if (perm === 'denied') {
        setNotificationsEnabled(false);
        setNotificationFeedback({
          type: 'error',
          message: 'Notifications are blocked in your browser settings. Click the lock/info icon in your browser URL bar to allow notifications.'
        });
      } else {
        setNotificationsEnabled(false);
      }
    } else {
      // User wants to disable
      setNotificationsEnabled(false);
      const newPrefs: NotificationPreferences = {
        enabled: false,
        orderStatus: notifyOrderStatus,
        offers: notifyOffers,
        reservations: notifyReservations
      };
      await saveNotificationPrefsToBackend(newPrefs);
      setNotificationFeedback({
        type: 'info',
        message: 'Browser notifications have been paused.'
      });
      setTimeout(() => setNotificationFeedback(null), 4000);
    }
  };

  // Sub-preference toggles
  const handleToggleSubPreference = async (key: 'orderStatus' | 'offers' | 'reservations', value: boolean) => {
    let newOrderStatus = notifyOrderStatus;
    let newOffers = notifyOffers;
    let newReservations = notifyReservations;

    if (key === 'orderStatus') {
      newOrderStatus = value;
      setNotifyOrderStatus(value);
    } else if (key === 'offers') {
      newOffers = value;
      setNotifyOffers(value);
    } else if (key === 'reservations') {
      newReservations = value;
      setNotifyReservations(value);
    }

    const newPrefs: NotificationPreferences = {
      enabled: notificationsEnabled,
      orderStatus: newOrderStatus,
      offers: newOffers,
      reservations: newReservations
    };

    await saveNotificationPrefsToBackend(newPrefs);
  };

  // Trigger test notification
  const handleSendTestNotification = async () => {
    setIsTestingNotification(true);
    let perm = getNotificationPermission();
    if (perm !== 'granted') {
      perm = await requestNotificationPermission();
      setBrowserPermission(perm);
    }

    if (perm === 'granted') {
      const dispatched = sendTestNotification();
      if (dispatched) {
        setNotificationFeedback({
          type: 'success',
          message: '🎉 Test notification sent! Check your desktop/mobile notifications.'
        });
      } else {
        setNotificationFeedback({
          type: 'info',
          message: 'Notification trigger was called. If you do not see it, check your OS notification center or focus mode settings.'
        });
      }
    } else {
      setNotificationFeedback({
        type: 'error',
        message: 'Please grant notification permission in your browser to receive alerts.'
      });
    }

    setTimeout(() => {
      setIsTestingNotification(false);
    }, 1500);
  };

  // Save profile personal info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    setIsSavingProfile(true);

    try {
      if (!currentUser) {
        setProfileFeedback({ type: 'error', message: 'You must be logged in to update your profile.' });
        setIsSavingProfile(false);
        return;
      }

      const updates: Partial<User> = {
        name: editName,
        phone: editPhone,
        street: editStreet,
        city: editCity,
        postcode: editPostcode,
        notificationPreferences: {
          enabled: notificationsEnabled,
          orderStatus: notifyOrderStatus,
          offers: notifyOffers,
          reservations: notifyReservations
        }
      };

      // Update in Firestore
      await updateUserFirestoreProfile(currentUser.id, updates);

      const updatedUser: User = {
        ...currentUser,
        ...updates
      };

      localStorage.setItem('indochinese_user_data', JSON.stringify(updatedUser));
      if (onUpdateUser) onUpdateUser(updatedUser);
      setIsEditingProfile(false);
      setProfileFeedback({ type: 'success', message: 'Profile details updated successfully!' });
      setTimeout(() => setProfileFeedback(null), 4000);
    } catch (err: any) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Load user orders if logged in
  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const token = localStorage.getItem('indochinese_user_token') || localStorage.getItem('indochinese_admin_token') || 'firebase_auth_active';
      const res = await fetch('/api/auth/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.warn('Failed to load user orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Unified Email Sign In (Handles both Customer and Admin credentials seamlessly)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Firebase Auth
      let authenticatedUser: User | null = null;
      let authToken = '';

      try {
        const { user, firebaseUser } = await signInWithEmail(signInEmail, signInPassword);
        authenticatedUser = user;
        authToken = await firebaseUser.getIdToken();
      } catch (fbErr: any) {
        // 2. If Firebase fails, try Server auth for specialized admin/staff credentials
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signInEmail, password: signInPassword })
        });

        if (res.ok) {
          const data = await res.json();
          authenticatedUser = data.user;
          authToken = data.token;
        } else {
          throw fbErr; // throw original Firebase error if both fail
        }
      }

      if (authenticatedUser) {
        const isAdmin = authenticatedUser.role === 'admin';
        setSuccessMessage(
          isAdmin
            ? 'Admin credentials verified! Loading Administrator Privileges & Table Alerts...'
            : 'Sign in successful! Welcome back to INDO CHINESE.'
        );
        
        localStorage.setItem('indochinese_user_data', JSON.stringify(authenticatedUser));
        if (isAdmin) {
          localStorage.setItem('indochinese_admin_token', authToken);
        } else {
          localStorage.setItem('indochinese_user_token', authToken);
        }

        setTimeout(() => {
          onLoginSuccess(authenticatedUser!, authToken);
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Email Sign Up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage('Full name, email address and password are required.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, firebaseUser } = await signUpWithEmail(
        signUpEmail,
        signUpPassword,
        signUpName,
        {
          phone: signUpPhone,
          street: signUpStreet,
          city: signUpCity,
          postcode: signUpPostcode
        }
      );

      const token = await firebaseUser.getIdToken();

      setSuccessMessage('Account created with Firebase! Welcome to INDO CHINESE.');
      localStorage.setItem('indochinese_user_data', JSON.stringify(user));
      localStorage.setItem('indochinese_user_token', token);

      setTimeout(() => {
        onLoginSuccess(user, token);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Direct Google Popup Sign In
  const handleDirectGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { user, firebaseUser } = await signInWithGoogle();
      const token = await firebaseUser.getIdToken();

      setSuccessMessage(`Signed in as ${user.email} with Google successfully!`);
      localStorage.setItem('indochinese_user_token', token);
      localStorage.setItem('indochinese_user_data', JSON.stringify(user));

      setTimeout(() => {
        onLoginSuccess(user, token);
      }, 500);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        // User closed or dismissed the popup window - silently reset loading state
        setErrorMessage('');
      } else {
        setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Send Password Reset Email
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setResetFeedback({ type: 'error', message: 'Please enter your account email address.' });
      return;
    }

    setIsSendingReset(true);
    setResetFeedback(null);

    try {
      await sendResetEmail(forgotEmail.trim());
      setResetFeedback({
        type: 'success',
        message: `Password reset link sent to ${forgotEmail.trim()}. Check your inbox or spam folder.`
      });
      setTimeout(() => {
        setShowForgotModal(false);
        setResetFeedback(null);
      }, 4000);
    } catch (err: any) {
      setResetFeedback({
        type: 'error',
        message: err.message || 'Failed to send password reset email.'
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  // Safe Logout with Firebase
  const handleLogoutAction = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    onLogout();
  };


  // IF USER IS ALREADY LOGGED IN: SHOW ACCOUNT DASHBOARD
  if (currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
              My Account
            </span>
          </div>

          {/* Profile Header Banner */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome back, {currentUser.name}!
                  </h1>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" /> {currentUser.email}
                    {currentUser.role === 'admin' && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                        Restaurant Admin
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onNavigateHome}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Utensils className="w-4 h-4" /> Explore Digital Menu
                </button>
                <button
                  onClick={handleLogoutAction}
                  className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 mt-8 gap-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> My Orders ({userOrders.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-4 h-4" /> Profile Details
              </button>
            </div>
          </div>

          {/* Tab Content: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900">Order History</h2>
                <button
                  onClick={fetchUserOrders}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {isOrdersLoading ? (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
                  <p className="text-sm font-semibold">Loading your order history...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No past orders found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                    Craving authentic Bombay street style Manchow soup, Chicken Lollipops or Triple Schezwan noodles?
                  </p>
                  <button
                    onClick={onNavigateHome}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
                  >
                    View Our Digital Menu <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-slate-900 text-base">
                              Order #{order.orderNumber}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                order.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'out_for_delivery'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-black text-red-600">
                            £{order.total.toFixed(2)}
                          </span>
                          <p className="text-xs text-slate-500 font-medium capitalize">
                            {order.type} • {order.paymentMethod.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm text-slate-700">
                            <span className="font-medium">
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span className="font-bold text-slate-900">
                              £{(item.menuItem.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.deliveryAddress && (
                        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900">Delivery Address: </span>
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.postcode}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {onQuickReorder && (
                          <button
                            onClick={() => {
                              onQuickReorder(order.items);
                              setReorderSuccessOrderId(order.id);
                              setTimeout(() => setReorderSuccessOrderId(null), 3000);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${reorderSuccessOrderId === order.id ? 'animate-spin' : ''}`} />
                            <span>{reorderSuccessOrderId === order.id ? 'Added to Cart!' : 'Quick Reorder'}</span>
                          </button>
                        )}

                        {onOpenOrderTracking && (
                          <button
                            onClick={() => onOpenOrderTracking(order.orderNumber)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
                          >
                            <Package className="w-3.5 h-3.5 text-red-600" />
                            <span>Track Live Status</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              {/* Feedback messages */}
              {notificationFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-3 shadow-xs ${
                    notificationFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : notificationFeedback.type === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {notificationFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : notificationFeedback.type === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <span>{notificationFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setNotificationFeedback(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* CARD 1: Browser Notifications & Alerts Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Browser Notifications & Alerts
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Receive instant push notifications for your food orders and exclusive Bombay deals
                      </p>
                    </div>
                  </div>

                  {/* Browser Permission Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${
                        browserPermission === 'granted' && notificationsEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : browserPermission === 'denied'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          browserPermission === 'granted' && notificationsEnabled
                            ? 'bg-emerald-500 animate-pulse'
                            : browserPermission === 'denied'
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      {browserPermission === 'granted' && notificationsEnabled
                        ? 'Notifications Active'
                        : browserPermission === 'denied'
                        ? 'Blocked in Browser'
                        : browserPermission === 'unsupported'
                        ? 'Not Supported'
                        : 'Permission Required'}
                    </span>
                  </div>
                </div>

                {/* Master Notification Toggle */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        Enable Browser Push Notifications
                      </span>
                      {notificationsEnabled && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md">
                          Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl">
                      Allows INDO CHINESE to send desktop or mobile web notifications directly to your device even when this tab is in the background.
                    </p>
                  </div>

                  {/* Custom Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notificationsEnabled}
                    onClick={handleToggleMasterNotifications}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
                      notificationsEnabled ? 'bg-red-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        notificationsEnabled ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Warning if blocked in browser */}
                {browserPermission === 'denied' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Notifications are blocked in your browser settings</span>
                    </div>
                    <p className="text-amber-800 pl-6">
                      To enable notifications: Click the <strong>lock / site settings icon (🔒)</strong> on the left side of your browser address bar, switch <strong>Notifications</strong> to <strong>Allow</strong>, and reload the page.
                    </p>
                  </div>
                )}

                {/* Granular Notification Categories */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Notification Types & Preferences
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Order Status Updates */}
                    <div
                      className={`border rounded-2xl p-4.5 transition-all ${
                        notificationsEnabled
                          ? notifyOrderStatus
                            ? 'bg-red-50/40 border-red-200'
                            : 'bg-white border-slate-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Truck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Live Order Status Updates
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Real-time alerts when your order is placed, sizzling in the wok, packed, or out for delivery.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          disabled={!notificationsEnabled}
                          checked={notifyOrderStatus}
                          onChange={(e) => handleToggleSubPreference('orderStatus', e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded-md border-slate-300 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed mt-1"
                        />
                      </div>
                    </div>

                    {/* Exclusive Offers & Deals */}
                    <div
                      className={`border rounded-2xl p-4.5 transition-all ${
                        notificationsEnabled
                          ? notifyOffers
                            ? 'bg-red-50/40 border-red-200'
                            : 'bg-white border-slate-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Gift className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Exclusive Deals & Promo Offers
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Get early access to weekend flash discounts, Bombay combo coupon codes, and new chef specials.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          disabled={!notificationsEnabled}
                          checked={notifyOffers}
                          onChange={(e) => handleToggleSubPreference('offers', e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded-md border-slate-300 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed mt-1"
                        />
                      </div>
                    </div>

                    {/* Table Reservations */}
                    <div
                      className={`border rounded-2xl p-4.5 transition-all md:col-span-2 ${
                        notificationsEnabled
                          ? notifyReservations
                            ? 'bg-red-50/40 border-red-200'
                            : 'bg-white border-slate-200'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Table Reservation Alerts
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Instant confirmation alerts when your dine-in table booking is verified by restaurant staff.
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          disabled={!notificationsEnabled}
                          checked={notifyReservations}
                          onChange={(e) => handleToggleSubPreference('reservations', e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded-md border-slate-300 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Notification Button */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Want to test how notifications appear on your device?
                  </div>
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    disabled={isTestingNotification}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isTestingNotification ? 'Sending Test...' : 'Send Test Notification'}
                  </button>
                </div>
              </div>

              {/* CARD 2: Saved Personal Details & Address */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        Saved Personal & Delivery Details
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        Manage your contact details and default delivery address for rapid checkout
                      </p>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Details
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditName(currentUser.name || '');
                        setEditPhone(currentUser.phone || '');
                        setEditStreet(currentUser.street || '');
                        setEditCity(currentUser.city || 'Hounslow');
                        setEditPostcode(currentUser.postcode || '');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {profileFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      profileFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {profileFeedback.message}
                  </div>
                )}

                {!isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Full Name
                      </label>
                      <p className="text-base font-bold text-slate-900">{currentUser.name}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Email Address
                      </label>
                      <p className="text-base font-bold text-slate-900">{currentUser.email}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Phone Number
                      </label>
                      <p className="text-base font-bold text-slate-900">{currentUser.phone || 'Not provided'}</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Default Delivery City
                      </label>
                      <p className="text-base font-bold text-slate-900">{currentUser.city || 'Hounslow'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Default Street Address
                      </label>
                      <p className="text-base font-bold text-slate-900">
                        {currentUser.street
                          ? `${currentUser.street}, ${currentUser.city || 'Hounslow'} ${currentUser.postcode || ''}`
                          : 'No default address saved yet.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 07123 456789"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block mb-1">Street Address</label>
                        <input
                          type="text"
                          placeholder="e.g. 42 High Street"
                          value={editStreet}
                          onChange={(e) => setEditStreet(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">City / Town</label>
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Postcode</label>
                        <input
                          type="text"
                          placeholder="e.g. TW3 1RH"
                          value={editPostcode}
                          onChange={(e) => setEditPostcode(e.target.value)}
                          className="w-full text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SIGN IN & SIGN UP FORM VIEW
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 mb-6 group transition-transform hover:scale-105"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-2xl shadow-md group-hover:bg-red-700">
              IC
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-slate-900 block leading-none tracking-tight">
                INDO CHINESE
              </span>
              <span className="text-[10px] font-bold text-amber-600 tracking-widest uppercase block mt-0.5">
                THE REAL TASTE OF BOMBAY
              </span>
            </div>
          </button>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your new account'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {mode === 'signin'
              ? 'Enjoy fast checkout, live order tracking, and exclusive Bombay deals'
              : 'Join Indo Chinese for quick food ordering in Hounslow'}
          </p>
        </div>

        {/* Firebase Security Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-slate-600 bg-white border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secured with Firebase Auth & Cloud Firestore</span>
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {mode === 'signin' ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(signInEmail);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Aarav Patel"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="07277758691"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={signUpStreet}
                    onChange={(e) => setSignUpStreet(e.target.value)}
                    placeholder="12 High Street"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={signUpPostcode}
                    onChange={(e) => setSignUpPostcode(e.target.value)}
                    placeholder="TW3 1AA"
                    className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password (min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Social Sign-In */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-center text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              Or continue with
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDirectGoogleSignIn}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
                title="Sign in with your Google Account"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenSocialModal('apple')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.98.04-2.18.66-2.88 1.48-.63.73-1.18 1.9-1.03 3.02 1.1.08 2.24-.58 2.92-1.4" />
                </svg>
                <span>Apple (Mac)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in or creating an account, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>

      {/* Social Account Selection Dialog */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            {/* Header Icon & Brand */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {socialModalProvider === 'google' ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                ) : (
                  <div className="w-6 h-6 bg-black text-white rounded-md flex items-center justify-center">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.98.04-2.18.66-2.88 1.48-.63.73-1.18 1.9-1.03 3.02 1.1.08 2.24-.58 2.92-1.4" />
                    </svg>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {socialModalProvider === 'google' ? 'Sign in with Google' : 'Sign in with Apple (Mac)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Choose an account to continue to Hakka Heritage</p>
                </div>
              </div>
              <button
                onClick={() => setSocialModalProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Account Options */}
            <div className="py-4 space-y-3">
              {/* Option 1: Saved User Account */}
              <label
                onClick={() => setSelectedAccountType('default')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedAccountType === 'default'
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600/30'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="socialAccount"
                  checked={selectedAccountType === 'default'}
                  onChange={() => setSelectedAccountType('default')}
                  className="mt-1 text-red-600 focus:ring-red-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Dikshitha Varma</span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Logged in
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    {socialModalProvider === 'google' ? 'dikshithavarma2006@gmail.com' : 'dikshithavarma2006@icloud.com'}
                  </p>
                </div>
              </label>

              {/* Option 2: Enter another account */}
              <label
                onClick={() => setSelectedAccountType('custom')}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedAccountType === 'custom'
                    ? 'border-red-600 bg-red-50/50 ring-1 ring-red-600/30'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="socialAccount"
                  checked={selectedAccountType === 'custom'}
                  onChange={() => setSelectedAccountType('custom')}
                  className="mt-1 text-red-600 focus:ring-red-600"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-900">
                    Use another {socialModalProvider === 'google' ? 'Google Account' : 'Apple ID'}
                  </span>
                  <p className="text-[11px] text-slate-500">Enter email and name to sign in</p>

                  {selectedAccountType === 'custom' && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          {socialModalProvider === 'google' ? 'Google Email *' : 'Apple ID Email *'}
                        </label>
                        <input
                          type="email"
                          value={customSocialEmail}
                          onChange={(e) => setCustomSocialEmail(e.target.value)}
                          placeholder={socialModalProvider === 'google' ? 'your.name@gmail.com' : 'your.id@icloud.com'}
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Full Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={customSocialName}
                          onChange={(e) => setCustomSocialName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Error in modal if any */}
            {errorMessage && (
              <p className="text-xs text-red-600 font-semibold mb-3">{errorMessage}</p>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSocialModalProvider(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSocialLogin}
                disabled={isLoading}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Signing In...
                  </>
                ) : (
                  <>
                    <span>Continue with {socialModalProvider === 'google' ? 'Google' : 'Apple'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Forgot Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Password</h3>
                  <p className="text-[11px] text-slate-500">We'll send a secure password reset link</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetFeedback(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendPasswordReset} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 tracking-wider">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                  />
                </div>
              </div>

              {resetFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    resetFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {resetFeedback.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  )}
                  <span>{resetFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetFeedback(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSendingReset ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending link...
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
