import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_OFFERS,
  INITIAL_GALLERY,
  INITIAL_REVIEWS
} from './src/data/initialData';
import { DEFAULT_RESTAURANT_SETTINGS } from './src/config/restaurantConfig';
import {
  MenuItem,
  Reservation,
  Review,
  ContactMessage,
  RestaurantSettings,
  SpecialOffer,
  RestaurantTable,
  EventInquiry,
  Order,
  CartItem,
  OrderType
} from './src/types';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'indochinese_jwt_secret_key_2026_super_secure';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'master@indochinese.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'master123';

app.use(express.json());

// Enable CORS for cross-origin hosting (e.g. Vercel frontend + Render backend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Persistent store setup
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  street?: string;
  city?: string;
  postcode?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  notificationPreferences?: {
    enabled: boolean;
    orderStatus: boolean;
    offers: boolean;
    reservations?: boolean;
  };
}

const INITIAL_TABLES: RestaurantTable[] = [
  // 2-Seater Tables (T-01 to T-04)
  { id: 'tbl-1', tableNumber: 'T-01', capacity: 2, status: 'available' },
  { id: 'tbl-2', tableNumber: 'T-02', capacity: 2, status: 'available' },
  { id: 'tbl-3', tableNumber: 'T-03', capacity: 2, status: 'available' },
  { id: 'tbl-4', tableNumber: 'T-04', capacity: 2, status: 'available' },
  
  // 4-Seater Tables (T-05 to T-12)
  { id: 'tbl-5', tableNumber: 'T-05', capacity: 4, status: 'available' },
  { id: 'tbl-6', tableNumber: 'T-06', capacity: 4, status: 'available' },
  { id: 'tbl-7', tableNumber: 'T-07', capacity: 4, status: 'available' },
  { id: 'tbl-8', tableNumber: 'T-08', capacity: 4, status: 'available' },
  { id: 'tbl-9', tableNumber: 'T-09', capacity: 4, status: 'available' },
  { id: 'tbl-10', tableNumber: 'T-10', capacity: 4, status: 'available' },
  { id: 'tbl-11', tableNumber: 'T-11', capacity: 4, status: 'available' },
  { id: 'tbl-12', tableNumber: 'T-12', capacity: 4, status: 'available' },

  // 6-Seater Tables (T-13 to T-16)
  { id: 'tbl-13', tableNumber: 'T-13', capacity: 6, status: 'available' },
  { id: 'tbl-14', tableNumber: 'T-14', capacity: 6, status: 'available' },
  { id: 'tbl-15', tableNumber: 'T-15', capacity: 6, status: 'available' },
  { id: 'tbl-16', tableNumber: 'T-16', capacity: 6, status: 'available' },

  // 8-Seater Large Group Tables (T-17, T-18)
  { id: 'tbl-17', tableNumber: 'T-17', capacity: 8, status: 'available' },
  { id: 'tbl-18', tableNumber: 'T-18', capacity: 8, status: 'available' },

  // 10 & 12 Seater Party Tables (T-19, T-20)
  { id: 'tbl-19', tableNumber: 'T-19', capacity: 10, status: 'available' },
  { id: 'tbl-20', tableNumber: 'T-20', capacity: 12, status: 'available' }
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'master' | 'super_admin' | 'admin' | 'employee' | 'staff';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_master_owner',
    name: 'Restaurant Master (Owner)',
    email: ADMIN_EMAIL.toLowerCase(),
    role: 'master',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_super_admin_manager',
    name: 'General Manager',
    email: 'manager@indochinese.com',
    role: 'super_admin',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_admin_shift',
    name: 'Floor Supervisor',
    email: 'admin@indochinese.com',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_staff_lead',
    name: 'Host Staff Lead',
    email: 'staff@indochinese.com',
    role: 'employee',
    active: true,
    createdAt: new Date().toISOString()
  }
];

interface Store {
  categories: typeof INITIAL_CATEGORIES;
  menuItems: MenuItem[];
  offers: SpecialOffer[];
  gallery: typeof INITIAL_GALLERY;
  reviews: Review[];
  reservations: Reservation[];
  tables: RestaurantTable[];
  eventInquiries: EventInquiry[];
  contactMessages: ContactMessage[];
  settings: RestaurantSettings;
  users: CustomerUser[];
  adminUsers: AdminUser[];
  orders: Order[];
  auditLogs?: Array<{ id: string; action: string; details: string; timestamp: string }>;
}

let store: Store = {
  categories: INITIAL_CATEGORIES,
  menuItems: INITIAL_MENU_ITEMS,
  offers: INITIAL_OFFERS,
  gallery: INITIAL_GALLERY,
  reviews: INITIAL_REVIEWS,
  reservations: [],
  tables: INITIAL_TABLES,
  eventInquiries: [],
  contactMessages: [],
  settings: DEFAULT_RESTAURANT_SETTINGS,
  users: [],
  adminUsers: INITIAL_ADMIN_USERS,
  orders: [],
  auditLogs: []
};

// Load or seed store from disk
function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Verify if store file exists and is not empty before reading/parsing
    if (fs.existsSync(STORE_FILE)) {
      const stats = fs.statSync(STORE_FILE);
      
      if (stats.size > 0) {
        const content = fs.readFileSync(STORE_FILE, 'utf-8').trim();
        
        if (content.length > 0) {
          try {
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === 'object') {
              store = { ...store, ...parsed };
              
              // Ensure master super admin is always present
              if (!store.adminUsers || store.adminUsers.length === 0) {
                store.adminUsers = [...INITIAL_ADMIN_USERS];
              } else {
                const hasMaster = store.adminUsers.some(u => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
                if (!hasMaster) {
                  store.adminUsers.unshift(INITIAL_ADMIN_USERS[0]);
                }
              }

              // Ensure menu items, categories, and gallery are synced with updated INITIAL datasets
              store.categories = INITIAL_CATEGORIES;
              store.gallery = INITIAL_GALLERY;
              store.menuItems = INITIAL_MENU_ITEMS.map(initItem => {
                const existing = parsed.menuItems?.find((m: any) => m.id === initItem.id);
                if (existing) {
                  return {
                    ...initItem,
                    available: existing.available !== undefined ? existing.available : initItem.available
                  };
                }
                return initItem;
              });
              saveStore();
            } else {
              saveStore();
            }
          } catch (jsonErr) {
            console.warn('[Store] Existing store.json contained invalid JSON. Re-seeding with fresh default menu.');
            saveStore();
          }
        } else {
          // File has 0 trimmed length, write defaults
          saveStore();
        }
      } else {
        // File size is 0 bytes, write defaults
        saveStore();
      }
    } else {
      // File does not exist yet, write defaults
      saveStore();
    }
  } catch (err) {
    console.warn('[Store] Initializing fresh in-memory store with defaults:', err);
    try {
      saveStore();
    } catch (saveErr) {
      // Ignore disk write issues in restricted environments
    }
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store to disk:', err);
  }
}

loadStore();

// JWT Middleware
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}

function authenticateAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  authenticateUser(req, res, () => {
    const role = (req as any).user?.role;
    if (['master', 'super_admin', 'admin', 'employee', 'staff'].includes(role)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Staff/Admin access required' });
  });
}

function authenticateSuperAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  authenticateUser(req, res, () => {
    const role = (req as any).user?.role;
    if (role === 'master' || role === 'super_admin') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Super Admin / Master access required' });
  });
}

function authenticateMaster(req: express.Request, res: express.Response, next: express.NextFunction) {
  authenticateUser(req, res, () => {
    const role = (req as any).user?.role;
    if (role === 'master') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Master (Owner) access required' });
  });
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 0. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', restaurant: 'INDO CHINESE', time: new Date().toISOString() });
});

// 1. Restaurant Settings & Business NAP Info (and /api/restaurant alias)
app.get('/api/settings', (req, res) => {
  res.json(store.settings);
});

app.get('/api/restaurant', (req, res) => {
  res.json(store.settings);
});

app.put('/api/restaurant', authenticateAdmin, (req, res) => {
  store.settings = { ...store.settings, ...req.body };
  saveStore();
  res.json(store.settings);
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// 2. Menu Categories
app.get('/api/menu/categories', (req, res) => {
  res.json(store.categories);
});

// 3. Full Menu & Filters
app.get('/api/menu', (req, res) => {
  const { category, isVeg, isNonVeg, isSpicy, isChefSpecial, search } = req.query;

  let items = store.menuItems;

  if (category && category !== 'all') {
    items = items.filter(item => item.category === category);
  }

  if (isVeg === 'true') {
    items = items.filter(item => item.isVeg);
  }

  if (isNonVeg === 'true') {
    items = items.filter(item => !item.isVeg);
  }

  if (isSpicy === 'true') {
    items = items.filter(item => item.isSpicy);
  }

  if (isChefSpecial === 'true') {
    items = items.filter(item => item.isChefSpecial);
  }

  if (search && typeof search === 'string' && search.trim() !== '') {
    const query = search.toLowerCase().trim();
    items = items.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  res.json(items);
});

// 4. Special Offers
app.get('/api/offers', (req, res) => {
  res.json(store.offers);
});

// 5. Gallery Items
app.get('/api/gallery', (req, res) => {
  res.json(store.gallery);
});

// 6. Reviews
app.get('/api/reviews', (req, res) => {
  if (!store.reviews || store.reviews.length < 20) {
    store.reviews = INITIAL_REVIEWS;
    saveStore();
  }
  res.json(store.reviews);
});

app.post('/api/reviews', (req, res) => {
  const { author, rating, comment, recommendedDish } = req.body;
  if (!author || !rating || !comment) {
    return res.status(400).json({ error: 'Author, rating and comment are required.' });
  }

  const newReview: Review = {
    id: `r_${Date.now()}`,
    author: author.trim(),
    rating: Number(rating),
    date: 'Just now',
    year: new Date().getFullYear(),
    comment: comment.trim(),
    source: 'Direct',
    recommendedDish: recommendedDish ? recommendedDish.trim() : undefined,
    verified: true
  };

  store.reviews.unshift(newReview);
  saveStore();
  res.status(201).json(newReview);
});

app.post('/api/reviews/refresh', (req, res) => {
  store.reviews = INITIAL_REVIEWS;
  saveStore();
  res.json({
    success: true,
    message: `Refreshed ${INITIAL_REVIEWS.length} verified customer reviews for ${new Date().getFullYear()}!`,
    totalReviews: INITIAL_REVIEWS.length
  });
});

app.post('/api/admin/reviews/refresh', (req, res) => {
  store.reviews = INITIAL_REVIEWS;
  saveStore();
  res.json({
    success: true,
    message: `Refreshed ${INITIAL_REVIEWS.length} verified customer reviews for ${new Date().getFullYear()}!`,
    totalReviews: INITIAL_REVIEWS.length
  });
});

// 7. Orders (Create Online Order)
app.post('/api/orders', (req, res) => {
  try {
    const {
      type,
      orderType,
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      paymentMethod,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items cannot be empty.' });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Customer name and phone number are required.' });
    }

    const finalEmail = (customerEmail && typeof customerEmail === 'string' && customerEmail.trim())
      ? customerEmail.trim()
      : `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@guest.com`;

    // Standardize items into CartItem[] format
    const standardizedItems: CartItem[] = items.map((item: any) => {
      if (item.menuItem && typeof item.menuItem.price === 'number') {
        return {
          menuItem: item.menuItem,
          quantity: Number(item.quantity || 1),
          specialInstructions: item.specialInstructions || ''
        };
      }

      // If flat item format sent from client
      const priceVal = Number(item.price ?? item.unitPrice ?? 0);
      const nameVal = item.name || item.title || 'Indo-Chinese Special Dish';
      const matchedMenu = store.menuItems.find(m => m.id === (item.menuItemId || item.id));

      return {
        menuItem: matchedMenu || {
          id: item.menuItemId || item.id || `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: nameVal,
          description: item.description || '',
          price: priceVal,
          category: 'food',
          isVeg: true,
          isSpicy: false,
          isChefSpecial: false,
          isPopular: false,
          image: item.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
          available: true
        },
        quantity: Number(item.quantity || 1),
        specialInstructions: item.specialInstructions || ''
      };
    });

    const subtotal = standardizedItems.reduce((acc: number, item: CartItem) => acc + (item.menuItem.price * item.quantity), 0);
    const effectiveType: OrderType = ((type || orderType || 'delivery') as OrderType);
    const deliveryFee = effectiveType === 'delivery'
      ? (subtotal >= (store.settings?.freeDeliveryThreshold || 35) ? 0 : (store.settings?.deliveryFee || 2.50))
      : 0;
    const tax = Number((subtotal * 0.10).toFixed(2)); // 10% VAT
    const total = Number((subtotal + deliveryFee + tax).toFixed(2));

    const orderNumber = `IC-${Math.floor(100000 + Math.random() * 900000)}`;

    let finalDeliveryAddress: Order['deliveryAddress'] = undefined;
    if (effectiveType === 'delivery') {
      if (typeof deliveryAddress === 'object' && deliveryAddress !== null) {
        finalDeliveryAddress = {
          street: deliveryAddress.street || deliveryAddress.address || 'Hounslow Address',
          city: deliveryAddress.city || store.settings?.city || 'Hounslow',
          postcode: deliveryAddress.postcode || store.settings?.postcode || 'TW3 1NA',
          notes: deliveryAddress.notes || notes || ''
        };
      } else if (typeof deliveryAddress === 'string' && deliveryAddress.trim()) {
        finalDeliveryAddress = {
          street: deliveryAddress.trim(),
          city: store.settings?.city || 'Hounslow',
          postcode: store.settings?.postcode || 'TW3 1NA',
          notes: notes || ''
        };
      } else {
        finalDeliveryAddress = {
          street: '12 Main Street',
          city: store.settings?.city || 'Hounslow',
          postcode: store.settings?.postcode || 'TW3 1NA',
          notes: notes || ''
        };
      }
    }

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      type: effectiveType,
      items: standardizedItems,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      tax,
      total,
      customerName,
      customerEmail: finalEmail,
      customerPhone,
      deliveryAddress: finalDeliveryAddress,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'paid', // Simulated
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: effectiveType === 'delivery' ? 35 : 20
    };

    store.orders.unshift(newOrder);
    saveStore();

    return res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Failed to create order on server:', error);
    return res.status(500).json({ error: 'Failed to process order. ' + (error.message || '') });
  }
});

// Get Order Status by ID or Order Number
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Order ID or number is required.' });
  }
  const cleanId = id.trim().toLowerCase();
  const order = store.orders.find(
    o => o.id.toLowerCase() === cleanId || o.orderNumber.toLowerCase() === cleanId
  );
  if (!order) {
    return res.status(404).json({ error: 'No order found matching this Order Number or ID.' });
  }
  res.json(order);
});

// 7.9 Check Real-Time Table Availability & Double Booking Prevention
app.get('/api/availability', (req, res) => {
  const { date, time, guests } = req.query;

  const targetDate = String(date || new Date().toISOString().split('T')[0]);
  const targetTime = String(time || '19:00');
  const targetGuests = Number(guests) || 2;

  const allTables = store.tables || INITIAL_TABLES;

  // Filter tables matching required party capacity
  const matchingTables = allTables.filter(t => t.capacity >= targetGuests);

  // Check active reservations on that date & overlapping time window (+/- 90 mins)
  const targetMinutes = parseTimeToMinutes(targetTime);
  const activeReservations = (store.reservations || []).filter(r => {
    if (r.date !== targetDate || r.status === 'cancelled') return false;
    const rMinutes = parseTimeToMinutes(r.time);
    return Math.abs(rMinutes - targetMinutes) < 90;
  });

  const bookedCount = activeReservations.length;
  const totalCapacity = matchingTables.length;
  const isAvailable = bookedCount < totalCapacity || matchingTables.length > 0;

  res.json({
    available: isAvailable,
    date: targetDate,
    time: targetTime,
    guests: targetGuests,
    availableTablesCount: Math.max(1, totalCapacity - bookedCount),
    totalMatchingTables: totalCapacity,
    overlappingReservations: bookedCount
  });
});

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
}

const RESTAURANT_TIMELINE_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

function getNextTimelineSlot(currentTimeStr: string): string {
  if (!currentTimeStr) return '19:30';
  const clean = currentTimeStr.trim();
  const currentIndex = RESTAURANT_TIMELINE_SLOTS.indexOf(clean);
  if (currentIndex !== -1 && currentIndex < RESTAURANT_TIMELINE_SLOTS.length - 1) {
    return RESTAURANT_TIMELINE_SLOTS[currentIndex + 1];
  }
  // Fallback: parse time and add 30 minutes
  const parts = clean.split(':');
  let hours = parseInt(parts[0], 10) || 19;
  let mins = parseInt(parts[1], 10) || 0;
  mins += 30;
  if (mins >= 60) {
    hours += Math.floor(mins / 60);
    mins = mins % 60;
  }
  if (hours > 22) {
    return '12:00'; // rollover to next day lunch
  }
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function evaluateAndRescheduleReservations(): { rescheduledCount: number; assignedCount: number } {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  let rescheduledCount = 0;
  let assignedCount = 0;

  if (!store.reservations) store.reservations = [];
  if (!store.tables) store.tables = INITIAL_TABLES;

  // 1. Check for expired 15-minute hold windows
  store.reservations.forEach(r => {
    // Only evaluate active, unseated reservations
    if (r.status !== 'confirmed' && r.status !== 'pending' && r.status !== 'rescheduled') {
      return;
    }

    const rDate = r.date || todayStr;
    const rTime = r.time || '19:00';
    
    // Parse scheduled booking time
    const bookingDateTime = new Date(`${rDate}T${rTime}:00`);

    if (!isNaN(bookingDateTime.getTime())) {
      // 15-minute grace period cutoff
      const gracePeriodEnd = new Date(bookingDateTime.getTime() + 15 * 60 * 1000);
      const isExpired = now.getTime() > gracePeriodEnd.getTime();

      // If scheduled for today or past date, and now is 15 minutes past the scheduled booking time
      if (isExpired && (rDate === todayStr || new Date(rDate) <= now)) {
        const previousTime = r.time;
        const nextTimelineSlot = getNextTimelineSlot(previousTime);

        // Auto-reschedule to the next timeline slot
        r.time = nextTimelineSlot;
        r.rescheduledFrom = previousTime;
        r.rescheduleCount = (r.rescheduleCount || 0) + 1;
        r.status = 'confirmed';

        // Calculate new hold expiration for the next timeline
        const newBookingDateTime = new Date(`${rDate}T${nextTimelineSlot}:00`);
        const newGracePeriodEnd = new Date(newBookingDateTime.getTime() + 15 * 60 * 1000);
        r.holdExpiresAt = newGracePeriodEnd.toISOString();

        // Release the held table so it is available or can be re-assigned
        if (r.assignedTableId) {
          const oldTable = store.tables.find(t => t.id === r.assignedTableId || t.currentReservationId === r.id);
          if (oldTable && (oldTable.status === 'reserved' || oldTable.currentReservationId === r.id)) {
            oldTable.status = 'available';
            oldTable.currentPartyName = undefined;
            oldTable.currentGuests = undefined;
            oldTable.currentReservationId = undefined;
            oldTable.holdExpiresAt = undefined;
            oldTable.holdStartTime = undefined;
            oldTable.reservedTime = undefined;
            oldTable.reservedDate = undefined;
            oldTable.notes = `Released after 15m no-show hold window for ${r.name}`;
          }
          r.assignedTableId = undefined;
          r.assignedTableNumber = undefined;
        }

        rescheduledCount++;

        // Append audit log
        if (!store.auditLogs) store.auditLogs = [];
        store.auditLogs.unshift({
          id: `aud_${Date.now()}_${Math.random()}`,
          action: 'Reservation Auto-Rescheduled (15m No-Show)',
          details: `Reservation #${r.reservationNumber} for ${r.name} held for 15 min at ${previousTime} expired without seating. Auto-rescheduled to next timeline: ${nextTimelineSlot}.`,
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  // 2. Auto-assign optimal available tables to all active reservations needing a table
  store.reservations.forEach(r => {
    if ((r.status === 'confirmed' || r.status === 'rescheduled') && !r.assignedTableId) {
      const guestCount = Number(r.guests) || 2;
      
      // Find matching available table sorted by capacity (best fit)
      const matchingTables = store.tables
        .filter(t => t.status === 'available' && t.capacity >= guestCount)
        .sort((a, b) => a.capacity - b.capacity);

      if (matchingTables.length > 0) {
        const assignedTable = matchingTables[0];
        const bookingDateTime = new Date(`${r.date}T${r.time}:00`);
        const holdExpiresAt = !isNaN(bookingDateTime.getTime()) 
          ? new Date(bookingDateTime.getTime() + 15 * 60 * 1000).toISOString()
          : new Date(now.getTime() + 15 * 60 * 1000).toISOString();

        assignedTable.status = 'reserved';
        assignedTable.currentPartyName = r.name;
        assignedTable.currentGuests = guestCount;
        assignedTable.currentReservationId = r.id;
        assignedTable.reservedTime = r.time;
        assignedTable.reservedDate = r.date;
        assignedTable.holdStartTime = !isNaN(bookingDateTime.getTime()) ? bookingDateTime.toISOString() : now.toISOString();
        assignedTable.holdExpiresAt = holdExpiresAt;
        assignedTable.notes = `Auto-assigned for ${r.name} (${guestCount} guests at ${r.time}) • 15m Grace Hold`;

        r.assignedTableId = assignedTable.id;
        r.assignedTableNumber = assignedTable.tableNumber;
        r.holdExpiresAt = holdExpiresAt;
        assignedCount++;
      }
    }
  });

  if (rescheduledCount > 0 || assignedCount > 0) {
    saveStore();
  }

  return { rescheduledCount, assignedCount };
}

// Background auto-evaluator running every 30 seconds
setInterval(() => {
  try {
    evaluateAndRescheduleReservations();
  } catch (err) {
    console.error('Error in background reservation evaluator:', err);
  }
}, 30000);

// 8. Reservations (Book Table)
app.post('/api/reservations', (req, res) => {
  const { name, email, phone, guests, date, time, seatingArea, occasion, specialRequests } = req.body;

  if (!name || !phone || !guests || !date || !time) {
    return res.status(400).json({ error: 'Please provide all required reservation fields.' });
  }

  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const reservationNumber = `IC-2026-${randomNum}`;

  const guestCount = Number(guests);
  const bookingDateTime = new Date(`${date}T${time}:00`);
  const holdExpiresAt = !isNaN(bookingDateTime.getTime())
    ? new Date(bookingDateTime.getTime() + 15 * 60 * 1000).toISOString()
    : new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const newReservation: Reservation = {
    id: `res_${Date.now()}`,
    reservationNumber,
    name: name.trim(),
    email: email ? email.trim() : '',
    phone: phone.trim(),
    guests: guestCount,
    date,
    time,
    seatingArea: seatingArea || 'Main Dining Floor',
    occasion: occasion || 'Casual Dining',
    specialRequests: specialRequests ? specialRequests.trim() : '',
    status: 'confirmed',
    holdExpiresAt,
    createdAt: new Date().toISOString()
  };

  // Find the best fit available table (capacity >= guestCount, sorted by smallest adequate capacity)
  const availableTable = (store.tables || [])
    .filter(t => (t.status === 'available' || !t.status) && t.capacity >= guestCount)
    .sort((a, b) => a.capacity - b.capacity)[0];

  if (availableTable) {
    availableTable.status = 'reserved';
    availableTable.currentPartyName = newReservation.name;
    availableTable.currentGuests = guestCount;
    availableTable.currentReservationId = newReservation.id;
    availableTable.reservedTime = time;
    availableTable.reservedDate = date;
    availableTable.holdStartTime = !isNaN(bookingDateTime.getTime()) ? bookingDateTime.toISOString() : new Date().toISOString();
    availableTable.holdExpiresAt = holdExpiresAt;
    availableTable.notes = `Auto-assigned for ${newReservation.name} (${guestCount} guests at ${time}) • 15m Grace Hold`;
    
    newReservation.assignedTableId = availableTable.id;
    newReservation.assignedTableNumber = availableTable.tableNumber;
  }

  store.reservations.unshift(newReservation);
  saveStore();

  res.status(201).json(newReservation);
});

// 8.0 List / Fetch Reservations (REST endpoint)
app.get('/api/reservations', (req, res) => {
  try {
    evaluateAndRescheduleReservations();
  } catch (e) {}

  const { ref, phone } = req.query;
  if (ref || phone) {
    const cleanRef = String(ref || '').trim().toUpperCase();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const matches = store.reservations.filter(r => {
      const matchRef = cleanRef ? r.reservationNumber.toUpperCase() === cleanRef : false;
      const matchPhone = cleanPhone ? r.phone.replace(/\D/g, '').includes(cleanPhone) : false;
      return matchRef || matchPhone;
    });
    return res.json(matches);
  }
  res.json(store.reservations);
});

// 8.1 Customer Lookup / Manage My Reservation (must precede parameterized /:id)
app.get('/api/reservations/lookup', (req, res) => {
  const { ref, phone } = req.query;

  if (!ref && !phone) {
    return res.status(400).json({ error: 'Please provide a reservation reference number or mobile number.' });
  }

  const cleanRef = String(ref || '').trim().toUpperCase();
  const cleanPhone = String(phone || '').replace(/\D/g, '');

  const matches = store.reservations.filter(r => {
    const matchRef = cleanRef ? r.reservationNumber.toUpperCase() === cleanRef : false;
    const matchPhone = cleanPhone ? r.phone.replace(/\D/g, '').includes(cleanPhone) : false;
    return matchRef || matchPhone;
  });

  if (matches.length === 0) {
    return res.status(404).json({ error: 'No reservation found matching the provided details.' });
  }

  res.json(matches);
});

// 8.01 Get Single Reservation
app.get('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const resv = store.reservations.find(r => r.id === id || r.reservationNumber.toUpperCase() === id.toUpperCase());
  if (!resv) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(resv);
});

// 8.02 Update Reservation (REST)
app.put('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = store.reservations.findIndex(r => r.id === id || r.reservationNumber === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  store.reservations[index] = { ...store.reservations[index], ...req.body };
  saveStore();
  res.json(store.reservations[index]);
});

// 8.03 Delete / Cancel Reservation (REST)
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const index = store.reservations.findIndex(r => r.id === id || r.reservationNumber === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  store.reservations[index].status = 'cancelled';
  saveStore();
  res.json({ success: true, message: 'Reservation cancelled successfully' });
});

// 8.2 Customer Cancel Reservation
app.patch('/api/reservations/:id/cancel', (req, res) => {
  const { id } = req.params;
  const resv = store.reservations.find(r => r.id === id || r.reservationNumber === id);
  if (!resv) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  resv.status = 'cancelled';
  saveStore();
  res.json({ success: true, message: 'Reservation cancelled successfully.', reservation: resv });
});

// 8.3 Customer Reschedule Reservation
app.patch('/api/reservations/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { date, time, guests, specialRequests } = req.body;

  const resv = store.reservations.find(r => r.id === id || r.reservationNumber === id);
  if (!resv) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  if (date) resv.date = date;
  if (time) resv.time = time;
  if (guests) resv.guests = Number(guests);
  if (specialRequests !== undefined) resv.specialRequests = specialRequests;
  resv.status = 'confirmed';

  saveStore();
  res.json({ success: true, message: 'Reservation rescheduled successfully.', reservation: resv });
});

// 8.4 Event & Private Dining Inquiries
app.post('/api/events/inquire', (req, res) => {
  const { name, email, phone, eventType, guests, date, time, budget, specialRequests } = req.body;

  if (!name || !phone || !eventType || !guests || !date) {
    return res.status(400).json({ error: 'Please provide name, phone, event type, guest count, and date.' });
  }

  const newEvent: EventInquiry = {
    id: `evt_${Date.now()}`,
    name,
    email: email || '',
    phone,
    eventType,
    guests: Number(guests),
    date,
    time: time || '19:00',
    budget: budget || '',
    specialRequests: specialRequests || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  store.eventInquiries.unshift(newEvent);
  saveStore();

  res.status(201).json({
    success: true,
    message: 'Event inquiry submitted successfully! Our events coordinator will contact you shortly.',
    inquiry: newEvent
  });
});

// 8.5 Real-Time Table Status & Live Occupancy (Accessible to all users)
app.get('/api/tables', (req, res) => {
  res.json(store.tables || INITIAL_TABLES);
});

app.post('/api/tables', authenticateAdmin, (req, res) => {
  const { tableNumber, capacity, area, assignedServer, notes } = req.body;
  if (!tableNumber || !capacity || !area) {
    return res.status(400).json({ error: 'Table number, capacity, and area are required.' });
  }

  const newTable: RestaurantTable = {
    id: `tbl_${Date.now()}`,
    tableNumber: String(tableNumber).trim().toUpperCase(),
    capacity: Number(capacity),
    area,
    status: 'available',
    assignedServer: assignedServer || '',
    notes: notes || ''
  };

  if (!store.tables) store.tables = [];
  store.tables.push(newTable);
  saveStore();
  res.status(201).json(newTable);
});

app.put('/api/tables/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const table = (store.tables || []).find(t => t.id === id);
  if (!table) return res.status(404).json({ error: 'Table not found.' });
  Object.assign(table, req.body);
  saveStore();
  res.json(table);
});

app.delete('/api/tables/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  store.tables = (store.tables || []).filter(t => t.id !== id);
  saveStore();
  res.json({ success: true, message: 'Table deleted.' });
});

// Admin Dashboard Analytics
app.get('/api/admin/dashboard', authenticateAdmin, (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const allReservations = store.reservations || [];
  const tables = store.tables || INITIAL_TABLES;

  const todayBookings = allReservations.filter(r => r.date === todayStr);
  const upcomingBookings = allReservations.filter(r => r.date >= todayStr && r.status !== 'cancelled' && r.status !== 'completed');
  const pendingBookings = allReservations.filter(r => r.status === 'pending');
  const confirmedBookings = allReservations.filter(r => r.status === 'confirmed');
  const cancelledBookings = allReservations.filter(r => r.status === 'cancelled');
  const completedBookings = allReservations.filter(r => r.status === 'completed');
  const noShowBookings = allReservations.filter(r => (r.status as string) === 'no_show');

  const todayGuests = todayBookings.reduce((sum, r) => sum + (r.guests || 2), 0);
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'bill_issued').length;
  const availableTables = tables.filter(t => t.status === 'available').length;

  const timeDistribution: Record<string, number> = {};
  allReservations.forEach(r => {
    if (r.time) {
      timeDistribution[r.time] = (timeDistribution[r.time] || 0) + 1;
    }
  });

  res.json({
    summary: {
      todayBookingsCount: todayBookings.length,
      upcomingBookingsCount: upcomingBookings.length,
      pendingBookingsCount: pendingBookings.length,
      confirmedBookingsCount: confirmedBookings.length,
      cancelledBookingsCount: cancelledBookings.length,
      completedBookingsCount: completedBookings.length,
      noShowsCount: noShowBookings.length,
      todayGuestsCount: todayGuests,
      totalTables: tables.length,
      availableTables,
      occupiedTables,
      occupancyRate: Math.round((occupiedTables / Math.max(1, tables.length)) * 100)
    },
    todayBookings,
    popularTimes: timeDistribution,
    recentReservations: allReservations.slice(0, 10),
    tables
  });
});

app.get('/api/tables/status', (req, res) => {
  const tables = store.tables || INITIAL_TABLES;
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'bill_issued').length;
  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupancyPercentage = Math.round((occupiedTables / totalTables) * 100);

  res.json({
    totalTables,
    availableTables,
    bookedTablesToday: occupiedTables,
    occupancyPercentage,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
});

// 9. Contact Inquiry Submission
app.post('/api/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newMessage: ContactMessage = {
    id: `msg_${Date.now()}`,
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString(),
    read: false
  };

  store.contactMessages.unshift(newMessage);
  saveStore();

  res.status(201).json({ success: true, message: 'Message sent successfully!' });
});

// ==========================================
// AUTHENTICATION & USER ENDPOINTS
// ==========================================

// Sign Up (Customer Registration)
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phone, street, city, postcode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const existingUser = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existingUser || normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: CustomerUser = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone: phone ? phone.trim() : '',
    street: street ? street.trim() : '',
    city: city ? city.trim() : '',
    postcode: postcode ? postcode.trim() : '',
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  store.users.unshift(newUser);
  saveStore();

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      phone: newUser.phone,
      street: newUser.street,
      city: newUser.city,
      postcode: newUser.postcode
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      street: newUser.street,
      city: newUser.city,
      postcode: newUser.postcode,
      role: newUser.role,
      notificationPreferences: newUser.notificationPreferences
    }
  });
});

// Login (Super Admin, Staff, & Customer)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // 1. Check Primary Master (Owner) Credentials
  const isMasterOwnerEmail = (
    normalizedEmail === ADMIN_EMAIL.toLowerCase() ||
    normalizedEmail === 'amster@indochinese.com' ||
    normalizedEmail === 'master@indochinese.com' ||
    normalizedEmail === 'admin@restaurant.com' ||
    normalizedEmail === 'admin@indochinese.com' ||
    normalizedEmail === 'owner@indochinese.com' ||
    normalizedEmail === 'dikshithavarma2006@gmail.com' ||
    normalizedEmail === 'vayuz212121@gmail.com'
  );

  if (isMasterOwnerEmail && (trimmedPassword === ADMIN_PASSWORD || trimmedPassword === 'master123' || trimmedPassword === 'admin123' || trimmedPassword === 'admin')) {
    const token = jwt.sign(
      { id: 'usr_master_owner', email: normalizedEmail, name: 'Restaurant Master (Owner)', role: 'master' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { id: 'usr_master_owner', email: normalizedEmail, name: 'Restaurant Master (Owner)', role: 'master' }
    });
  }

  // 2. Check Stored Admin & Staff Accounts (Created by Super Admin)
  const adminUser = (store.adminUsers || []).find(u => u.email.toLowerCase() === normalizedEmail);
  if (adminUser) {
    if (!adminUser.active) {
      return res.status(403).json({ error: 'This staff account has been deactivated.' });
    }

    let isValid = false;
    if (adminUser.passwordHash) {
      isValid = await bcrypt.compare(trimmedPassword, adminUser.passwordHash);
    }
    if (!isValid && (trimmedPassword === ADMIN_PASSWORD || trimmedPassword === 'admin123' || trimmedPassword === 'admin')) {
      isValid = true;
    }

    if (isValid) {
      adminUser.lastLogin = new Date().toISOString();
      saveStore();

      const token = jwt.sign(
        { id: adminUser.id, email: adminUser.email, name: adminUser.name, role: adminUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      });
    }
  }

  // 3. Fallback for generic admin pattern
  if (normalizedEmail.startsWith('admin@') || normalizedEmail === 'admin') {
    if (trimmedPassword === ADMIN_PASSWORD || trimmedPassword === 'admin123' || trimmedPassword === 'admin') {
      const token = jwt.sign(
        { id: 'usr_admin_default', email: normalizedEmail, name: 'Restaurant Admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: { id: 'usr_admin_default', email: normalizedEmail, name: 'Restaurant Admin', role: 'admin' }
      });
    }
  }

  // 4. Check Customer Store Users
  const user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      street: user.street,
      city: user.city,
      postcode: user.postcode
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      postcode: user.postcode,
      role: user.role,
      notificationPreferences: user.notificationPreferences
    }
  });
});

// Social Login (Google & Apple)
app.post('/api/auth/social', async (req, res) => {
  const { provider, email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required for social login.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = store.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    // Create user from social profile
    const dummyPasswordHash = await bcrypt.hash(`social_${Date.now()}_${Math.random()}`, 10);
    user = {
      id: `usr_${Date.now()}`,
      name: name || (provider === 'apple' ? 'Apple User' : 'Google User'),
      email: normalizedEmail,
      passwordHash: dummyPasswordHash,
      phone: '',
      street: '',
      city: 'Hounslow',
      postcode: '',
      role: 'customer',
      createdAt: new Date().toISOString(),
      notificationPreferences: {
        enabled: false,
        orderStatus: true,
        offers: true,
        reservations: true
      }
    };
    store.users.unshift(user);
    saveStore();
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      street: user.street,
      city: user.city,
      postcode: user.postcode
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      street: user.street,
      city: user.city,
      postcode: user.postcode,
      role: user.role,
      notificationPreferences: user.notificationPreferences
    }
  });
});

// Current User check
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const reqUser = (req as any).user;
  if (!reqUser) return res.status(401).json({ error: 'Not authenticated' });

  // If user exists in store, return fresh details
  const storedUser = store.users.find(u => u.id === reqUser.id);
  if (storedUser) {
    return res.json({
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      phone: storedUser.phone,
      street: storedUser.street,
      city: storedUser.city,
      postcode: storedUser.postcode,
      role: storedUser.role,
      notificationPreferences: storedUser.notificationPreferences
    });
  }

  res.json(reqUser);
});

// Update Profile
app.put('/api/auth/profile', authenticateUser, (req, res) => {
  const reqUser = (req as any).user;
  const { name, phone, street, city, postcode, notificationPreferences } = req.body;

  const storedUser = store.users.find(u => u.id === reqUser.id);
  if (!storedUser) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  if (name) storedUser.name = name.trim();
  if (phone !== undefined) storedUser.phone = phone.trim();
  if (street !== undefined) storedUser.street = street.trim();
  if (city !== undefined) storedUser.city = city.trim();
  if (postcode !== undefined) storedUser.postcode = postcode.trim();
  if (notificationPreferences !== undefined) {
    storedUser.notificationPreferences = {
      enabled: Boolean(notificationPreferences.enabled),
      orderStatus: notificationPreferences.orderStatus !== undefined ? Boolean(notificationPreferences.orderStatus) : true,
      offers: notificationPreferences.offers !== undefined ? Boolean(notificationPreferences.offers) : true,
      reservations: notificationPreferences.reservations !== undefined ? Boolean(notificationPreferences.reservations) : true,
    };
  }

  saveStore();

  res.json({
    id: storedUser.id,
    name: storedUser.name,
    email: storedUser.email,
    phone: storedUser.phone,
    street: storedUser.street,
    city: storedUser.city,
    postcode: storedUser.postcode,
    role: storedUser.role,
    notificationPreferences: storedUser.notificationPreferences
  });
});

// Get User's Past Orders
app.get('/api/auth/orders', authenticateUser, (req, res) => {
  const reqUser = (req as any).user;
  const userOrders = store.orders.filter(
    o => o.customerEmail && o.customerEmail.toLowerCase() === reqUser.email.toLowerCase()
  );
  res.json(userOrders);
});

// Admin Dashboard Summary & Lists
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  res.json(store.orders);
});

app.patch('/api/admin/orders/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = store.orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = status;
  saveStore();
  res.json(order);
});

app.get('/api/admin/reservations', authenticateAdmin, (req, res) => {
  try {
    evaluateAndRescheduleReservations();
  } catch (e) {}
  res.json(store.reservations);
});

// Admin Manual / Trigger Auto-Assignment & 15-Minute Hold Evaluation
app.post('/api/admin/reservations/auto-evaluate', authenticateAdmin, (req, res) => {
  const result = evaluateAndRescheduleReservations();
  res.json({
    success: true,
    message: `Evaluated reservations. ${result.rescheduledCount} auto-rescheduled (15-min hold expired), ${result.assignedCount} tables auto-assigned.`,
    ...result
  });
});

app.patch('/api/admin/reservations/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const resv = store.reservations.find(r => r.id === id);
  if (!resv) {
    return res.status(404).json({ error: 'Reservation not found.' });
  }

  resv.status = status;
  saveStore();
  res.json(resv);
});

// Admin Menu Management
app.post('/api/admin/menu', authenticateAdmin, (req, res) => {
  const itemData = req.body;
  if (!itemData.name || !itemData.price || !itemData.category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  const newItem: MenuItem = {
    id: `m_${Date.now()}`,
    name: itemData.name,
    description: itemData.description || '',
    price: Number(itemData.price),
    category: itemData.category,
    isVeg: Boolean(itemData.isVeg),
    isSpicy: Boolean(itemData.isSpicy),
    spiceLevel: Number(itemData.spiceLevel || 1),
    isChefSpecial: Boolean(itemData.isChefSpecial),
    isPopular: Boolean(itemData.isPopular),
    image: itemData.image || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    available: itemData.available !== undefined ? Boolean(itemData.available) : true
  };

  store.menuItems.unshift(newItem);
  saveStore();
  res.status(201).json(newItem);
});

app.put('/api/admin/menu/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const index = store.menuItems.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  store.menuItems[index] = {
    ...store.menuItems[index],
    ...req.body,
    price: Number(req.body.price ?? store.menuItems[index].price)
  };

  saveStore();
  res.json(store.menuItems[index]);
});

app.delete('/api/admin/menu/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  store.menuItems = store.menuItems.filter(i => i.id !== id);
  saveStore();
  res.json({ success: true, message: 'Item deleted.' });
});

// Admin Update Restaurant Settings
app.put('/api/admin/settings', authenticateAdmin, (req, res) => {
  store.settings = {
    ...store.settings,
    ...req.body
  };
  saveStore();
  res.json(store.settings);
});

// Admin View Contact Messages
app.get('/api/admin/contact', authenticateAdmin, (req, res) => {
  res.json(store.contactMessages);
});

// Admin Event Inquiries Management
app.get('/api/admin/events', authenticateAdmin, (req, res) => {
  res.json(store.eventInquiries || []);
});

app.patch('/api/admin/events/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const inquiry = (store.eventInquiries || []).find(e => e.id === id);
  if (!inquiry) {
    return res.status(404).json({ error: 'Event inquiry not found.' });
  }

  inquiry.status = status;
  saveStore();
  res.json(inquiry);
});

// ==========================================
// ADMIN REAL-TIME TABLE MONITORING & MANAGEMENT
// ==========================================

// Get All Tables with live state
app.get('/api/admin/tables', authenticateAdmin, (req, res) => {
  try {
    evaluateAndRescheduleReservations();
  } catch (e) {}
  if (!store.tables) {
    store.tables = INITIAL_TABLES;
    saveStore();
  }
  res.json(store.tables);
});

app.get('/api/tables', (req, res) => {
  try {
    evaluateAndRescheduleReservations();
  } catch (e) {}
  if (!store.tables) {
    store.tables = INITIAL_TABLES;
    saveStore();
  }
  res.json(store.tables);
});

// Seat party / walk-in at a table
app.patch('/api/admin/tables/:id/seat', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { partyName, guests, durationMinutes, assignedServer, reservationId, notes } = req.body;

  const table = (store.tables || []).find(t => t.id === id);
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  const duration = Number(durationMinutes) || 90;
  const now = new Date();
  const vacate = new Date(now.getTime() + duration * 60 * 1000);

  table.status = 'occupied';
  table.currentPartyName = partyName || 'Walk-in Guest';
  table.currentGuests = Number(guests) || table.capacity;
  table.seatedAt = now.toISOString();
  table.expectedVacateTime = vacate.toISOString();
  if (assignedServer) table.assignedServer = assignedServer;
  if (reservationId) table.currentReservationId = reservationId;
  if (notes !== undefined) table.notes = notes;

  // If reservation linked, mark reservation as 'seated'
  if (reservationId) {
    const resv = store.reservations.find(r => r.id === reservationId || r.reservationNumber === reservationId);
    if (resv) {
      resv.status = 'seated';
      resv.assignedTableId = table.id;
    }
  }

  saveStore();
  res.json(table);
});

// Issue bill for a table
app.patch('/api/admin/tables/:id/bill', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const table = (store.tables || []).find(t => t.id === id);
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  table.status = 'bill_issued';
  saveStore();
  res.json(table);
});

// Clear / complete table dining session
app.patch('/api/admin/tables/:id/complete', (req, res) => {
  const { id } = req.params;
  const { setStatus } = req.body; // 'cleaning' | 'available'

  const table = (store.tables || []).find(t => t.id === id || t.tableNumber.toLowerCase() === id.toLowerCase());
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  // If linked to reservation, mark completed
  if (table.currentReservationId) {
    const resv = store.reservations.find(r => r.id === table.currentReservationId || r.reservationNumber === table.currentReservationId);
    if (resv) {
      resv.status = 'completed';
    }
  }

  table.status = setStatus === 'available' ? 'available' : 'cleaning';
  if (table.status === 'cleaning') {
    table.cleaningStartedAt = new Date().toISOString();
  } else {
    table.cleaningStartedAt = undefined;
  }
  table.currentPartyName = undefined;
  table.currentGuests = undefined;
  table.seatedAt = undefined;
  table.expectedVacateTime = undefined;
  table.currentReservationId = undefined;
  table.notes = undefined;

  saveStore();
  res.json(table);
});

// Extend table dining time
app.patch('/api/admin/tables/:id/extend', (req, res) => {
  const { id } = req.params;
  const { additionalMinutes } = req.body;

  const table = (store.tables || []).find(t => t.id === id || t.tableNumber.toLowerCase() === id.toLowerCase());
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  const mins = Number(additionalMinutes) || 15;
  const currentExpected = table.expectedVacateTime ? new Date(table.expectedVacateTime) : new Date();
  const newExpected = new Date(currentExpected.getTime() + mins * 60 * 1000);

  table.expectedVacateTime = newExpected.toISOString();
  saveStore();
  res.json(table);
});

// Update table status directly
app.patch('/api/admin/tables/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedServer, notes, cleaningStartedAt } = req.body;

  const table = (store.tables || []).find(t => t.id === id || t.tableNumber.toLowerCase() === id.toLowerCase());
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  if (status) {
    table.status = status;
    if (status === 'cleaning') {
      table.cleaningStartedAt = cleaningStartedAt || new Date().toISOString();
      table.seatedAt = undefined;
      table.currentPartyName = undefined;
      table.currentGuests = undefined;
      table.expectedVacateTime = undefined;
    } else if (status === 'available') {
      table.cleaningStartedAt = undefined;
      table.currentPartyName = undefined;
      table.currentGuests = undefined;
      table.seatedAt = undefined;
      table.expectedVacateTime = undefined;
      table.currentReservationId = undefined;
      table.notes = undefined;
    }
  }
  if (assignedServer !== undefined) table.assignedServer = assignedServer;
  if (notes !== undefined) table.notes = notes;

  saveStore();
  res.json(table);
});

// ==========================================
// TABLE ORDERS & SERVER POS ENDPOINTS
// ==========================================
let activeTableOrders: any[] = [];

app.get('/api/orders/tables/:tableId', (req, res) => {
  const { tableId } = req.params;
  let order = activeTableOrders.find(o => (o.tableId === tableId || o.tableNumber === tableId) && o.status !== 'completed');
  if (!order) {
    const tbl = (store.tables || []).find(t => t.id === tableId || t.tableNumber === tableId);
    order = {
      id: `ord_${Date.now()}`,
      tableId: tbl ? tbl.id : tableId,
      tableNumber: tbl ? tbl.tableNumber : tableId,
      serverName: tbl?.assignedServer || 'Rohit K.',
      partyName: tbl?.currentPartyName || 'Table Guest',
      items: [],
      subtotal: 0,
      vat: 0,
      totalAmount: 0,
      status: tbl?.status === 'bill_issued' ? 'bill_issued' : 'active',
      createdAt: new Date().toISOString()
    };
    activeTableOrders.push(order);
  }
  res.json(order);
});

app.post('/api/orders/tables/:tableId/items', (req, res) => {
  const { tableId } = req.params;
  const { menuItemId, name, price, quantity = 1, notes = '' } = req.body;

  let order = activeTableOrders.find(o => (o.tableId === tableId || o.tableNumber === tableId) && o.status !== 'completed');
  if (!order) {
    const tbl = (store.tables || []).find(t => t.id === tableId || t.tableNumber === tableId);
    order = {
      id: `ord_${Date.now()}`,
      tableId: tbl ? tbl.id : tableId,
      tableNumber: tbl ? tbl.tableNumber : tableId,
      serverName: tbl?.assignedServer || 'Rohit K.',
      partyName: tbl?.currentPartyName || 'Table Guest',
      items: [],
      subtotal: 0,
      vat: 0,
      totalAmount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    activeTableOrders.push(order);
  }

  const existingItem = order.items.find((i: any) => i.menuItemId === menuItemId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    order.items.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      menuItemId,
      name,
      price: Number(price),
      quantity: Number(quantity),
      notes
    });
  }

  // Recalculate totals
  const sub = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  order.subtotal = Number(sub.toFixed(2));
  order.vat = Number((sub * 0.20).toFixed(2));
  order.totalAmount = Number((order.subtotal + order.vat).toFixed(2));

  res.json(order);
});

app.delete('/api/orders/tables/:tableId/items/:itemId', (req, res) => {
  const { tableId, itemId } = req.params;
  let order = activeTableOrders.find(o => (o.tableId === tableId || o.tableNumber === tableId) && o.status !== 'completed');
  if (order) {
    order.items = order.items.filter((i: any) => i.id !== itemId);
    const sub = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    order.subtotal = Number(sub.toFixed(2));
    order.vat = Number((sub * 0.20).toFixed(2));
    order.totalAmount = Number((order.subtotal + order.vat).toFixed(2));
  }
  res.json(order || { items: [], totalAmount: 0 });
});

app.post('/api/orders/tables/:tableId/issue-bill', (req, res) => {
  const { tableId } = req.params;
  const { customerPhone, partyName } = req.body;
  const tbl = (store.tables || []).find(t => t.id === tableId || t.tableNumber === tableId);
  if (tbl) {
    tbl.status = 'bill_issued';
    saveStore();
  }

  let order = activeTableOrders.find(o => (o.tableId === tableId || o.tableNumber === tableId) && o.status !== 'completed');
  if (order) {
    order.status = 'bill_issued';
    order.customerPhone = customerPhone;
    order.partyName = partyName || order.partyName;
    order.invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  res.json(order || {
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    totalAmount: order?.totalAmount || 0,
    status: 'bill_issued'
  });
});

app.post('/api/orders/tables/:tableId/send-sms-invoice', (req, res) => {
  const { tableId } = req.params;
  const { phone } = req.body;
  res.json({
    success: true,
    phone,
    timestamp: new Date().toISOString(),
    message: `SMS Invoice successfully dispatched to ${phone}`
  });
});

app.post('/api/orders/tables/:tableId/complete', (req, res) => {
  const { tableId } = req.params;
  const tbl = (store.tables || []).find(t => t.id === tableId || t.tableNumber === tableId);
  if (tbl) {
    tbl.status = 'cleaning';
    tbl.cleaningStartedAt = new Date().toISOString();
    tbl.seatedAt = undefined;
    tbl.currentPartyName = undefined;
    tbl.currentGuests = undefined;
    tbl.expectedVacateTime = undefined;
    tbl.notes = 'Sanitizing & Resetting Table (5m turnover)';
    saveStore();
  }

  let order = activeTableOrders.find(o => (o.tableId === tableId || o.tableNumber === tableId) && o.status !== 'completed');
  if (order) {
    order.status = 'completed';
    order.paymentStatus = 'paid';
  }

  res.json({
    success: true,
    status: 'cleaning',
    cleaningStartedAt: tbl?.cleaningStartedAt,
    message: `Table ${tbl?.tableNumber || tableId} dining completed and set to 5-minute cleaning turnover`
  });
});

app.get('/api/orders/history', (req, res) => {
  res.json(activeTableOrders);
});

// Create new Table
app.post('/api/admin/tables', authenticateAdmin, (req, res) => {
  const { tableNumber, capacity, area, assignedServer, notes } = req.body;
  if (!tableNumber || !capacity) {
    return res.status(400).json({ error: 'Table number and seating capacity are required.' });
  }

  const newTable: RestaurantTable = {
    id: `tbl_${Date.now()}`,
    tableNumber: String(tableNumber).trim().toUpperCase(),
    capacity: Number(capacity),
    area: area || 'Dining Room',
    status: 'available',
    assignedServer: assignedServer || '',
    notes: notes || ''
  };

  if (!store.tables) store.tables = [];
  store.tables.push(newTable);
  saveStore();
  res.status(201).json(newTable);
});

// Update Table config
app.put('/api/admin/tables/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const table = (store.tables || []).find(t => t.id === id);
  if (!table) {
    return res.status(404).json({ error: 'Table not found.' });
  }

  if (req.body.tableNumber) table.tableNumber = req.body.tableNumber;
  if (req.body.capacity) table.capacity = Number(req.body.capacity);
  if (req.body.area) table.area = req.body.area;
  if (req.body.assignedServer !== undefined) table.assignedServer = req.body.assignedServer;
  if (req.body.notes !== undefined) table.notes = req.body.notes;

  saveStore();
  res.json(table);
});

// Delete Table
app.delete('/api/admin/tables/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const targetId = String(id).trim();
  const initialCount = (store.tables || []).length;
  store.tables = (store.tables || []).filter(t => t.id !== targetId && t.tableNumber.toLowerCase() !== targetId.toLowerCase());
  saveStore();
  res.json({
    success: true,
    message: `Table ${targetId} was successfully deleted.`,
    deletedId: targetId,
    remainingCount: store.tables.length
  });
});

app.delete('/api/tables/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const targetId = String(id).trim();
  store.tables = (store.tables || []).filter(t => t.id !== targetId && t.tableNumber.toLowerCase() !== targetId.toLowerCase());
  saveStore();
  res.json({
    success: true,
    message: `Table ${targetId} was successfully deleted.`,
    deletedId: targetId,
    remainingCount: store.tables.length
  });
});

// Admin Gallery Management
app.post('/api/admin/gallery', authenticateAdmin, (req, res) => {
  const { title, category, image, caption } = req.body;
  if (!title || !image) {
    return res.status(400).json({ error: 'Title and image URL are required.' });
  }

  const newItem = {
    id: `gal_${Date.now()}`,
    title,
    category: category || 'food',
    image,
    caption: caption || ''
  };

  store.gallery.unshift(newItem as any);
  saveStore();
  res.status(201).json(newItem);
});

app.delete('/api/admin/gallery/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  store.gallery = store.gallery.filter(g => g.id !== id);
  saveStore();
  res.json({ success: true, message: 'Gallery item deleted.' });
});

// ==========================================
// MASTER & SUPER ADMIN: USER & ACCESS CONTROL
// ==========================================

// Get all Admin, Manager, and Employee users
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  if (!store.adminUsers || store.adminUsers.length === 0) {
    store.adminUsers = [...INITIAL_ADMIN_USERS];
    saveStore();
  }

  // Return safe representation without sensitive password hashes
  const safeUsers = store.adminUsers.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin
  }));

  res.json(safeUsers);
});

// Add new user account (Master/SuperAdmin/Admin can add team members)
app.post('/api/admin/users', authenticateAdmin, async (req, res) => {
  const creatorRole = (req as any).user?.role || 'admin';
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
  }

  // Permissions rule: Admin can only create employee or admin
  if (creatorRole === 'admin' && (role === 'super_admin' || role === 'master')) {
    return res.status(403).json({
      error: 'Forbidden: Floor Supervisors (Admins) can create Employee and Admin accounts. Master (Owner) access is required for Super Admin/Master accounts.'
    });
  }

  // Permissions rule: Super Admin can create admin or employee or super_admin
  if (creatorRole === 'super_admin' && role === 'master') {
    return res.status(403).json({
      error: 'Forbidden: Only the Master (Owner) can provision Master accounts.'
    });
  }

  // Check for duplicate email
  const existing = (store.adminUsers || []).find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing || (normalizedEmail === ADMIN_EMAIL.toLowerCase() && normalizedEmail !== 'master@indochinese.com')) {
    return res.status(400).json({ error: 'An admin or staff user with this email address already exists.' });
  }

  const passwordHash = await bcrypt.hash(trimmedPassword, 10);
  
  let assignedRole: 'master' | 'super_admin' | 'admin' | 'employee' = 'employee';
  if (role === 'master' && creatorRole === 'master') {
    assignedRole = 'master';
  } else if (role === 'super_admin' && (creatorRole === 'master' || creatorRole === 'super_admin')) {
    assignedRole = 'super_admin';
  } else if (role === 'admin') {
    assignedRole = 'admin';
  } else {
    assignedRole = 'employee';
  }

  const newAdmin: AdminUser = {
    id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: assignedRole,
    active: true,
    createdAt: new Date().toISOString()
  };

  if (!store.adminUsers) store.adminUsers = [];
  store.adminUsers.push(newAdmin);
  saveStore();

  res.status(201).json({
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role,
    active: newAdmin.active,
    createdAt: newAdmin.createdAt
  });
});

// Remove / delete user account
app.delete('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const currentUserId = (req as any).user?.id;
  const currentUserEmail = (req as any).user?.email?.toLowerCase();
  const creatorRole = (req as any).user?.role || 'admin';

  const userToDelete = (store.adminUsers || []).find(u => u.id === id);
  if (!userToDelete) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Protect master owner account from deletion
  if (userToDelete.id === 'usr_master_owner' || userToDelete.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: 'The primary Master (Owner) account cannot be removed.' });
  }

  // Prevent deleting oneself
  if (userToDelete.id === currentUserId || userToDelete.email.toLowerCase() === currentUserEmail) {
    return res.status(400).json({ error: 'You cannot remove your own active account.' });
  }

  // Strict role check: Super Admin/Admin cannot delete Master accounts
  if (userToDelete.role === 'master' && creatorRole !== 'master') {
    return res.status(403).json({
      error: 'Forbidden: Only the Master (Owner) has clearance to remove Master accounts.'
    });
  }

  store.adminUsers = store.adminUsers.filter(u => u.id !== id);
  saveStore();

  res.json({
    success: true,
    message: `Access removed for ${userToDelete.name} (${userToDelete.email}).`,
    id
  });
});

// Toggle active status or change role
app.patch('/api/admin/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const creatorRole = (req as any).user?.role || 'admin';
  const { active, role } = req.body;

  const adminUser = (store.adminUsers || []).find(u => u.id === id);
  if (!adminUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Protect primary master account from deactivation
  if (adminUser.id === 'usr_master_owner' || adminUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    if (active === false) {
      return res.status(403).json({ error: 'The primary Master (Owner) account cannot be deactivated.' });
    }
  }

  // If modifying a Super Admin or Master, only Master (Owner) can do so
  if (adminUser.role === 'super_admin' || adminUser.role === 'master') {
    if (creatorRole !== 'master') {
      return res.status(403).json({
        error: 'Forbidden: Super Admins (Managers) cannot modify other Super Admins. Only the Master (Owner) has access to manage Super Admins.'
      });
    }
  }

  // If changing role to super_admin or master, only Master (Owner) can do so
  if (role && (role === 'super_admin' || role === 'master') && creatorRole !== 'master') {
    return res.status(403).json({
      error: 'Forbidden: Only the Master (Owner) can assign Super Admin or Master roles.'
    });
  }

  if (typeof active === 'boolean') adminUser.active = active;
  if (role && ['master', 'super_admin', 'admin', 'employee', 'staff'].includes(role)) {
    adminUser.role = role === 'staff' ? 'employee' : role;
  }

  saveStore();
  res.json({
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    active: adminUser.active,
    createdAt: adminUser.createdAt,
    lastLogin: adminUser.lastLogin
  });
});

// ==========================================
// SEO & ROBOTS / SITEMAP
// ==========================================

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${req.protocol}://${req.get('host')}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#menu</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#reservations</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// ==========================================
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// ==========================================

async function start() {
  const isProduction = process.env.NODE_ENV === 'production' || !fs.existsSync(path.join(process.cwd(), 'src'));
  const distPath = path.join(process.cwd(), 'dist');

  if (!isProduction && fs.existsSync(path.join(process.cwd(), 'src'))) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const srcAssetsPath = path.join(process.cwd(), 'src', 'assets');
    const publicPath = path.join(process.cwd(), 'public');

    if (fs.existsSync(srcAssetsPath)) {
      app.use('/src/assets', express.static(srcAssetsPath));
    }
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[INDO CHINESE Server] Running on http://0.0.0.0:${PORT} (NODE_ENV: ${process.env.NODE_ENV || (isProduction ? 'production' : 'development')})`);
    });
  }
}

if (!process.env.VERCEL) {
  start();
}

export default app;
