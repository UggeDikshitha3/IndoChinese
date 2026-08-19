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

## 🚀 Running Locally & Testing

```bash
# Install dependencies
npm install

# Run TypeScript type check
npm run lint

# Start development server
npm run dev

# Run automated end-to-end audit test suite
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## 🚢 Production Deployment Options

### Option 1: Docker (Single-Container Fullstack)
```bash
# Build Docker image
docker build -t indochinese-restaurant .

# Run container in production
docker run -d -p 3000:3000 --name indochinese -e NODE_ENV=production indochinese-restaurant
```

### Option 2: Render / Railway / Cloud VPS
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Port:** Uses dynamic `PORT` environment variable automatically (defaults to `3000`).
- **Blueprint:** Included in [`render.yaml`](render.yaml) for 1-click Render deployment.

### Option 3: Vercel (Frontend & Serverless API)
- Includes [`vercel.json`](vercel.json) configuration with rewrites for `/api` serverless handler in [`api/index.ts`](api/index.ts).

### Option 4: Linux VPS with PM2
```bash
npm install
npm run build
npm install -g pm2
pm2 start dist/server.cjs --name "indochinese-restaurant"
pm2 save
pm2 startup
```

