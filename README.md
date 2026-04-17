# 🔥 Ember & Oak — Multi-Channel Restaurant Ordering System

A full-stack, production-ready restaurant ordering platform with five distinct interfaces, real-time updates, and role-based access control.

---

## 🖥️ Interfaces

| Interface         | URL Path          | Role              | Description                          |
|-------------------|-------------------|-------------------|--------------------------------------|
| Customer App      | `/`               | Public / Customer | Browse menu, order, track delivery   |
| QR Table Ordering | `/qr/:tableId`    | Public            | Scan-to-order at a table             |
| Admin Dashboard   | `/admin`          | ADMIN             | Orders, menu, analytics, staff       |
| POS Terminal      | `/pos`            | CASHIER / ADMIN   | Walk-in / drive-through orders       |
| Kitchen Display   | `/kds`            | KITCHEN / ADMIN   | Real-time order queue for kitchen    |

---

## 🧱 Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Real-time**: Socket.io
- **Validation**: express-validator

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (custom warm brown/cream theme)
- **State**: Zustand (auth + cart stores)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Real-time**: socket.io-client
- **Notifications**: react-hot-toast
- **Dates**: date-fns

---

## 📁 Project Structure

```
restaurant-system/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # Full DB schema
│   │   └── seed.js                # Sample data seeder
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── reviewController.js
│   │   │   ├── branchController.js
│   │   │   └── notificationController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── menuRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── branchRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   └── notificationRoutes.js
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT + RBAC middleware
│   │   ├── utils/
│   │   │   └── prisma.js           # Prisma client singleton
│   │   ├── app.js                  # Express app setup
│   │   └── server.js               # HTTP + Socket.io server
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── customer/
    │   │   │   ├── HomePage.jsx
    │   │   │   ├── MenuPage.jsx
    │   │   │   ├── CartPage.jsx
    │   │   │   ├── CheckoutPage.jsx
    │   │   │   ├── OrderTrackingPage.jsx
    │   │   │   ├── OrderHistoryPage.jsx
    │   │   │   ├── LoginPage.jsx
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── QROrderPage.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminOrders.jsx
    │   │   │   ├── AdminMenu.jsx
    │   │   │   ├── AdminInventory.jsx
    │   │   │   ├── AdminAnalytics.jsx
    │   │   │   ├── AdminBranches.jsx
    │   │   │   └── AdminStaff.jsx
    │   │   ├── pos/
    │   │   │   └── POSPage.jsx
    │   │   └── kds/
    │   │       └── KDSPage.jsx
    │   ├── layouts/
    │   │   ├── CustomerLayout.jsx
    │   │   ├── AdminLayout.jsx
    │   │   └── POSLayout.jsx
    │   ├── components/
    │   │   └── shared/
    │   │       ├── ProtectedRoute.jsx
    │   │       ├── Spinner.jsx
    │   │       ├── StatusBadge.jsx
    │   │       ├── ConfirmModal.jsx
    │   │       └── EmptyState.jsx
    │   ├── context/
    │   │   ├── authStore.js        # Zustand auth state
    │   │   └── cartStore.js        # Zustand cart state
    │   ├── hooks/
    │   │   ├── useSocket.js
    │   │   ├── useOrders.js
    │   │   └── useMenu.js
    │   ├── services/
    │   │   ├── api.js              # Axios + all API calls
    │   │   └── socket.js           # Socket.io singleton
    │   ├── App.jsx                 # Main router
    │   ├── main.jsx
    │   └── index.css               # Tailwind + design system
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18+ 
- **PostgreSQL** v14+
- **npm** v9+

---

### Step 1 — Clone & Install Dependencies

```bash
# Install all dependencies (both server & client)
cd restaurant-system
npm run install:all

# Or individually:
cd server && npm install
cd ../client && npm install
```

---

### Step 2 — Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/restaurant_db"
JWT_SECRET="change-this-to-a-long-random-secret-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

### Step 3 — Set Up PostgreSQL Database

**Option A — Using psql CLI:**
```bash
psql -U postgres
CREATE DATABASE restaurant_db;
\q
```

**Option B — Using createdb:**
```bash
createdb -U postgres restaurant_db
```

---

### Step 4 — Run Prisma Migrations

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed the database with sample data
node prisma/seed.js
```

You should see:
```
✅ Database seeded successfully!

📋 Login credentials:
  Admin:    admin@restaurant.com    / admin123
  Cashier:  cashier@restaurant.com  / cashier123
  Kitchen:  kitchen@restaurant.com  / kitchen123
  Customer: customer@example.com    / customer123
```

---

### Step 5 — Start the Application

**Terminal 1 — Backend API Server:**
```bash
cd server
npm run dev
# → Server running on http://localhost:5000
# → WebSocket server ready
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd client
npm run dev
# → Running on http://localhost:5173
```

---

## 🔑 Login Credentials (Seeded)

| Role     | Email                      | Password    | Redirect       |
|----------|----------------------------|-------------|----------------|
| Admin    | admin@restaurant.com       | admin123    | `/admin`       |
| Cashier  | cashier@restaurant.com     | cashier123  | `/pos`         |
| Kitchen  | kitchen@restaurant.com     | kitchen123  | `/kds`         |
| Customer | customer@example.com       | customer123 | `/`            |

**Staff Login Page:** `http://localhost:5173/staff/login`

---

## 🌐 API Reference

### Auth
| Method | Path              | Auth      | Description          |
|--------|-------------------|-----------|----------------------|
| POST   | /api/auth/login   | None      | Login                |
| POST   | /api/auth/register| None      | Register customer    |
| GET    | /api/auth/me      | Bearer    | Get current user     |
| GET    | /api/auth/staff   | Admin     | List staff           |
| POST   | /api/auth/staff   | Admin     | Create staff member  |

### Menu
| Method | Path                   | Auth      | Description        |
|--------|------------------------|-----------|--------------------|
| GET    | /api/menu              | Optional  | List menu items    |
| GET    | /api/menu/:id          | None      | Get single item    |
| POST   | /api/menu              | Admin     | Create item        |
| PUT    | /api/menu/:id          | Admin     | Update item        |
| DELETE | /api/menu/:id          | Admin     | Deactivate item    |
| GET    | /api/menu/categories   | None      | List categories    |
| POST   | /api/menu/categories   | Admin     | Create category    |
| PUT    | /api/menu/categories/:id | Admin   | Update category    |

### Orders
| Method | Path                    | Auth             | Description           |
|--------|-------------------------|------------------|-----------------------|
| GET    | /api/orders             | Staff            | List all orders       |
| GET    | /api/orders/my          | Customer         | My orders             |
| GET    | /api/orders/kitchen     | Kitchen/Cashier  | Active kitchen queue  |
| GET    | /api/orders/:id         | Optional         | Get single order      |
| POST   | /api/orders             | Optional         | Create order          |
| PATCH  | /api/orders/:id/status  | Staff            | Update order status   |
| PATCH  | /api/orders/:id/cancel  | Optional         | Cancel order          |
| PATCH  | /api/orders/:id/payment | Cashier/Admin    | Update payment        |

### Inventory
| Method | Path                          | Auth          | Description       |
|--------|-------------------------------|---------------|-------------------|
| GET    | /api/inventory                | Staff         | List inventory    |
| PUT    | /api/inventory/:menuItemId    | Cashier/Admin | Update stock      |
| PATCH  | /api/inventory/:menuItemId/toggle | Cashier/Admin | Toggle in/out |

### Analytics
| Method | Path                   | Auth          | Description        |
|--------|------------------------|---------------|--------------------|
| GET    | /api/analytics/stats   | Staff         | Dashboard stats    |
| GET    | /api/analytics/revenue | Staff         | Revenue chart data |
| GET    | /api/analytics/best-sellers | Staff    | Top selling items  |
| GET    | /api/analytics/peak-hours   | Admin     | Peak hour stats    |
| GET    | /api/analytics/order-types  | Staff     | Orders by type     |

---

## 🔄 Real-Time Events (Socket.io)

### Client → Server (join rooms)
```js
socket.emit('join:branch', branchId)   // Join branch room
socket.emit('join:order', orderId)     // Join order room
socket.emit('join:role', role)         // Join role room (KITCHEN, ADMIN, etc.)
```

### Server → Client (events)
```js
socket.on('order:new', order)          // New order placed
socket.on('order:updated', order)      // Order changed
socket.on('order:statusChanged', order)// Status transition
socket.on('inventory:updated', data)   // Stock change
```

---

## 📱 QR Code Table Ordering

Each table has a QR code linking to:
```
http://localhost:5173/qr/{tableNumber}
```

Example: `http://localhost:5173/qr/5` → orders at Table 5

The `tableNumber` is automatically attached to the order. You can generate QR codes for each table using `qrcode.react` or any QR generator.

---

## 🗃️ Database Schema Summary

| Table              | Description                            |
|--------------------|----------------------------------------|
| `branches`         | Restaurant locations                   |
| `users`            | All users (customers + staff)          |
| `categories`       | Menu categories                        |
| `menu_items`       | Individual dishes                      |
| `inventory`        | Stock levels per item per branch       |
| `orders`           | Customer orders                        |
| `order_items`      | Line items within an order             |
| `payments`         | Payment records linked to orders       |
| `order_status_logs`| Full audit trail of status changes     |
| `notifications`    | User notification inbox                |
| `reviews`          | Post-order ratings and comments        |

---

## 🔧 Common Issues & Fixes

**Prisma migration error:**
```bash
cd server
npx prisma migrate reset --force
node prisma/seed.js
```

**Port already in use:**
```bash
# Change PORT in server/.env
# Change port in client/vite.config.js
```

**CORS error in browser:**
- Make sure `CLIENT_URL` in `server/.env` matches the Vite dev server URL exactly.

**Cannot connect to database:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format in `.env`

---

## 🏗️ Production Deployment

```bash
# Build frontend
cd client && npm run build

# Set NODE_ENV=production in server/.env
# Serve the client/dist folder via nginx or express static
# Use PM2 for the Node server:
npm install -g pm2
cd server && pm2 start src/server.js --name restaurant-api
```

---

## 📄 License
MIT — Free to use and modify.
