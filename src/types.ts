export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSpicy: boolean;
  spiceLevel?: number; // 1 to 3
  isChefSpecial: boolean;
  isPopular: boolean;
  isGlutenFree?: boolean;
  isVegetarian?: boolean;
  allergens?: string[];
  image: string;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

// Table Status & Real-Time Monitoring
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'bill_issued';
export type TableArea = string;

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  capacity: number;
  area?: string;
  status: TableStatus;
  currentPartyName?: string;
  currentGuests?: number;
  seatedAt?: string; // ISO string
  expectedVacateTime?: string; // ISO string
  assignedServer?: string;
  currentReservationId?: string;
  holdExpiresAt?: string; // ISO string for 15-minute reservation hold window
  holdStartTime?: string; // ISO string
  reservedTime?: string; // e.g. "19:30"
  reservedDate?: string; // e.g. "2026-08-18"
  notes?: string;
}

export type ReservationStatus = 'confirmed' | 'arrived' | 'seated' | 'completed' | 'cancelled' | 'rejected' | 'pending' | 'rescheduled';

export interface Reservation {
  id: string;
  reservationNumber: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  seatingArea?: string;
  occasion?: string;
  specialRequests?: string;
  status: ReservationStatus;
  assignedTableId?: string;
  assignedTableNumber?: string;
  holdExpiresAt?: string; // ISO string timestamp when 15 min grace window expires
  rescheduledFrom?: string; // Previous time slot if auto-rescheduled
  rescheduleCount?: number;
  createdAt: string;
}

export type EventStatus = 'pending' | 'contacted' | 'confirmed' | 'declined' | 'responded' | 'closed';

export interface EventInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: 'Birthday Party' | 'Anniversary' | 'Corporate Dinner' | 'Festival Celebration' | 'Private Dining' | 'Group Gathering';
  guests: number;
  date: string;
  time: string;
  budget?: string;
  specialRequests?: string;
  status: EventStatus;
  createdAt: string;
}

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  discountBadge: string;
  originalPrice?: number;
  offerPrice: number;
  image: string;
  validDays?: string;
  code?: string;
  linkedMenuItemId?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'food' | 'restaurant' | 'chef_specials' | 'ambience' | 'events';
  image: string;
  caption?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  source: 'Google' | 'Direct' | 'TripAdvisor';
  recommendedDish?: string;
  verified: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  read?: boolean;
  status?: string;
}

export interface RestaurantSettings {
  restaurantName?: string;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  whatsapp: string;
  latitude: number;
  longitude: number;
  priceRange: string;
  openingHours: {
    day?: string;
    open?: string;
    close?: string;
    closed?: boolean;
    weekday?: string;
    weekend?: string;
  }[] | any;
  googleMapsUrl: string;
  googleBusinessProfileUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  orderingEnabled: boolean;
  reservationsEnabled: boolean;
  minOrderDelivery: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

export interface TableAreaStatus {
  name: string;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
}

export interface TableStatusSummary {
  totalTables: number;
  availableTables: number;
  bookedTablesToday: number;
  occupancyPercentage: number;
  lastUpdated: string;
  areas: TableAreaStatus[];
}

export interface NotificationPreferences {
  enabled: boolean;
  orderStatus: boolean;
  offers: boolean;
  reservations?: boolean;
}

export type UserRole = 'master' | 'super_admin' | 'admin' | 'manager' | 'server' | 'employee' | 'staff' | 'customer';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'super_admin' | 'admin' | 'manager' | 'server' | 'employee' | 'staff';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'master' | 'super_admin' | 'admin' | 'manager' | 'server' | 'employee' | 'staff' | 'customer';
  name: string;
  phone?: string;
  street?: string;
  city?: string;
  postcode?: string;
  notificationPreferences?: NotificationPreferences;
}

export interface TableReservationAlert {
  id: string;
  reservation: Reservation;
  timestamp: string;
  isRead: boolean;
}

// Table Order & Live Server POS
export interface TableOrderItem {
  id: string;
  orderId: string;
  menuItemId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  spiceLevel?: string;
  dietaryNotes?: string;
}

export interface TableOrder {
  id: string;
  tableId: string;
  tableNumber: string;
  serverName: string;
  partyName: string;
  customerPhone?: string;
  status: 'active' | 'bill_issued' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid';
  invoiceNumber?: string;
  smsSent?: boolean;
  smsSentAt?: string;
  items: TableOrderItem[];
}

export interface ServerStat {
  serverName: string;
  activeTablesCount: number;
  completedTablesToday: number;
  totalTablesServedToday: number;
  ordersTakenToday: number;
  totalRevenueToday: number;
  efficiencyScore: string;
  activeTables: string[];
}

export interface SMSInvoice {
  invoiceNumber: string;
  recipientPhone: string;
  totalAmount: number;
  smsContent: string;
  timestamp: string;
}

// Order & Cart items (for backward compatibility)
export type OrderType = 'delivery' | 'collection' | 'dine-in';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: {
    street: string;
    city: string;
    postcode: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedTimeMinutes: number;
}
