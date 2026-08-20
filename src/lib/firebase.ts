import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { User, NotificationPreferences, Reservation, TableStatusSummary } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider configured for account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Check if an email address belongs to an admin
 */
export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === 'admin@indochinese.com' ||
    clean === 'admin@restaurant.com' ||
    clean === 'dikshithavarma2006@gmail.com' ||
    clean.startsWith('admin@') ||
    clean === 'admin'
  );
}

/**
 * Format Firebase User into App's User type with Firestore sync
 */
export async function getAppUserFromFirebase(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  let userData: Partial<User> = {};
  const isAdmin = checkIsAdminEmail(firebaseUser.email);

  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      userData = docSnap.data() as Partial<User>;
      // If user has admin email but Firestore has customer, elevate them
      if (isAdmin && userData.role !== 'admin') {
        userData.role = 'admin';
        await updateDoc(userRef, { role: 'admin' });
      }
    } else {
      const initialProfile: Partial<User> = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || (isAdmin ? 'Restaurant Admin Manager' : 'Valued Customer'),
        role: isAdmin ? 'admin' : 'customer',
        city: 'Hounslow',
        notificationPreferences: {
          enabled: true,
          orderStatus: true,
          offers: true,
          reservations: true
        }
      };

      await setDoc(userRef, {
        ...initialProfile,
        createdAt: serverTimestamp()
      }, { merge: true });

      userData = initialProfile;
    }
  } catch (err) {
    console.warn('Could not read from Firestore users collection, using auth fallback:', err);
    userData = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || (isAdmin ? 'Restaurant Admin Manager' : 'Valued Customer'),
      role: isAdmin ? 'admin' : 'customer'
    };
  }

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: userData.name || firebaseUser.displayName || (isAdmin ? 'Restaurant Admin Manager' : 'Valued Customer'),
    role: (userData.role as 'admin' | 'staff' | 'customer') || (isAdmin ? 'admin' : 'customer'),
    phone: userData.phone || '',
    street: userData.street || '',
    city: userData.city || 'Hounslow',
    postcode: userData.postcode || '',
    notificationPreferences: userData.notificationPreferences || {
      enabled: true,
      orderStatus: true,
      offers: true,
      reservations: true
    }
  };
}

/**
 * Save new Table Reservation to Cloud Firestore
 */
export async function saveReservationToFirestore(reservation: Reservation): Promise<void> {
  try {
    const resRef = doc(db, 'reservations', reservation.id || `res_${Date.now()}`);
    await setDoc(resRef, {
      ...reservation,
      createdAtTimestamp: serverTimestamp()
    }, { merge: true });

    // Dispatch global in-app event for immediate real-time alert trigger
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('table_reservation_created', {
        detail: reservation
      }));
    }
  } catch (err) {
    console.warn('Could not persist reservation to Firestore:', err);
  }
}

/**
 * Real-time listener for all reservations (used by Admin Dashboard and Table Occupancy Counter)
 */
export function subscribeToFirestoreReservations(
  onUpdate: (reservations: Reservation[]) => void
): () => void {
  try {
    const reservationsCol = collection(db, 'reservations');
    const q = query(reservationsCol, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const items: Reservation[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Reservation;
        items.push({
          ...data,
          id: docSnap.id
        });
      });
      onUpdate(items);
    }, (error) => {
      console.warn('Firestore reservations subscription warning:', error);
    });
  } catch (err) {
    console.warn('Could not initialize Firestore snapshot listener:', err);
    return () => {};
  }
}

/**
 * Calculate Real-Time Table Status Summary from reservations
 */
export function calculateTableStatus(reservations: Reservation[]): TableStatusSummary {
  const TOTAL_TABLES = 18;
  const todayStr = new Date().toISOString().split('T')[0];

  // Count active reservations for today that are not cancelled
  const todayReservations = reservations.filter(
    r => r.date === todayStr && r.status !== 'cancelled'
  );

  // Each reservation takes approx 1 table (or 2 tables if > 6 guests)
  const occupiedTables = Math.min(
    TOTAL_TABLES - 2, // keep at least 2 tables for walk-ins
    todayReservations.reduce((acc, r) => acc + (r.guests > 6 ? 2 : 1), 5) // base dynamic simulated baseline + reservations
  );

  const availableTables = Math.max(1, TOTAL_TABLES - occupiedTables);
  const occupancyPercentage = Math.round((occupiedTables / TOTAL_TABLES) * 100);

  return {
    totalTables: TOTAL_TABLES,
    availableTables,
    bookedTablesToday: occupiedTables,
    occupancyPercentage,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const appUser = await getAppUserFromFirebase(result.user);
    return { user: appUser, firebaseUser: result.user };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.info('Google Sign-In popup was closed or cancelled by user.');
    } else {
      console.warn('Firebase Google Sign-In notice:', error?.message || error);
    }
    throw translateFirebaseError(error);
  }
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const appUser = await getAppUserFromFirebase(result.user);
    return { user: appUser, firebaseUser: result.user };
  } catch (error: any) {
    console.warn('Firebase Email Sign-In notice:', error?.message || error);
    throw translateFirebaseError(error);
  }
}

/**
 * Register with Email & Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  name: string,
  extraData?: { phone?: string; street?: string; city?: string; postcode?: string }
): Promise<{ user: User; firebaseUser: FirebaseUser }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    
    // Update display name on Firebase Auth profile
    if (name.trim()) {
      await updateProfile(result.user, { displayName: name.trim() });
    }

    const isAdmin = email.trim().toLowerCase() === 'admin@indochinese.com';
    const newUserData: User = {
      id: result.user.uid,
      email: email.trim(),
      name: name.trim() || 'Valued Customer',
      role: isAdmin ? 'admin' : 'customer',
      phone: extraData?.phone || '',
      street: extraData?.street || '',
      city: extraData?.city || 'Hounslow',
      postcode: extraData?.postcode || '',
      notificationPreferences: {
        enabled: false,
        orderStatus: true,
        offers: true,
        reservations: true
      }
    };

    // Save to Firestore
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, {
      ...newUserData,
      createdAt: serverTimestamp()
    }, { merge: true });

    return { user: newUserData, firebaseUser: result.user };
  } catch (error: any) {
    console.error('Firebase Sign-Up Error:', error);
    throw translateFirebaseError(error);
  }
}

/**
 * Send Password Reset Email
 */
export async function sendResetEmail(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('Firebase Password Reset Error:', error);
    throw translateFirebaseError(error);
  }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Firebase Sign-Out Error:', error);
    throw translateFirebaseError(error);
  }
}

/**
 * Update Profile in Firestore
 */
export async function updateUserFirestoreProfile(uid: string, updates: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating profile in Firestore:', error);
    throw error;
  }
}

/**
 * Human friendly error message converter for Firebase errors
 */
function translateFirebaseError(error: any): Error {
  const code = error.code || '';
  let message = 'An unexpected authentication error occurred.';

  switch (code) {
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.';
      break;
    case 'auth/user-disabled':
      message = 'This user account has been disabled.';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email address.';
      break;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      message = 'Incorrect email or password. Please try again.';
      break;
    case 'auth/email-already-in-use':
      message = 'An account with this email address already exists. Please sign in instead.';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak. Please use at least 6 characters.';
      break;
    case 'auth/popup-closed-by-user':
      message = 'Google Sign-In popup was closed before completing. Please try again.';
      break;
    case 'auth/popup-blocked':
      message = 'Google Sign-In popup was blocked by your browser. Please allow popups for this site.';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Only one popup request is allowed at a time.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Please check your internet connection.';
      break;
    case 'auth/too-many-requests':
      message = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      break;
    default:
      message = error.message || message;
  }

  const errObj = new Error(message);
  (errObj as any).code = code;
  return errObj;
}
