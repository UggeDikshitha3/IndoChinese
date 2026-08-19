# INDO CHINESE — Production-Ready Restaurant Website & Live Floor Reservation System

A restaurant showcase and table reservation platform with an **integrated Admin Floor Control Center** for live table monitoring, elapsed dining stopwatch timers, double-booking prevention, menu management, and private event bookings.

---

## 🌟 Key Features

### 1. Customer-Facing Restaurant Showcase (Table Reservations Only)
- **Zero Online Food Ordering**: Exclusively designed for dine-in table reservations.
- **Hero & Storytelling**: Highlighting authentic wok heritage, Indo-Chinese history, and chef signatures.
- **Full Digital Menu**: High-resolution dish photography, vegetarian/halal indicators, spice levels (1–4 peppers), and dietary badges.
- **Instant Table Booking Flow**:
  - Step 1: Party size, seating area preference (Main Dining Hall, Family Booths, Garden Terrace, VIP Private Dining), reservation date, and time slot.
  - Live table availability validation against floor capacity to prevent overbooking.
  - Step 2: Guest details (Full Name, Phone, Email, Occasion, Special Requests).
  - Step 3: Confirmation voucher with unique booking reference (`IC-2026-XXXXXX`).
- **Customer Manage Booking Portal**:
  - Enter Reservation ID + Phone Number to view booking status, request a reschedule, or cancel.
- **Mobile Fixed Action Bar**: Quick-tap sticky controls for **CALL**, **DIRECTIONS**, and **BOOK TABLE**.
- **Private Dining & Event Inquiries**: Dedicated banquet & celebration inquiry engine.

---

### 2. Admin Control Center (`/admin`)
- **Live Floor Monitor & Stopwatch**:
  - Real-time visual floor plan categorized by dining areas.
  - Live elapsed dining stopwatch for every seated party.
  - Overstay indicators (Green: `<45m`, Amber: `45–75m`, Red: `>75m`).
  - Single-click actions: Seat Walk-In / Reservation, Issue Bill, Complete / Clear Table, Extend Time (+15m, +30m), Change Server.
- **Reservation Management**:
  - Search by Name, Phone, or Booking Reference.
  - Date and status filters (`Pending`, `Confirmed`, `Seated`, `Completed`, `Cancelled`).
  - Instant status transitions and table assignments.
- **Menu Management**:
  - Full CRUD operations: Add dish, modify prices, toggle stock availability (`Available` / `Sold Out`), update spice levels.
- **Photo Gallery Management**:
  - Upload, categorize, and delete restaurant ambiance and dish photography.
- **Operational Analytics & Audit Logs**:
  - Peak dining hour distribution, area occupancy percentages, and timestamped activity logs.
- **Role-Based Access Control**:
  - Super Admin, Host, and Floor Staff roles.

---

## 🔐 Default Admin Credentials
- **URL**: `/admin` or `#admin`
- **Email**: `admin@indochinese.com`
- **Password**: `admin123`

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
