# Restaurant POS System

A modern Point of Sale system for restaurants with role-based access control, built with React, TypeScript, and Express.js.

## Features

### Role-Based Access
- **Waiter**: Manage tables, create orders, view menu
- **Kitchen**: View order queue, update order status (NEW → IN_PROGRESS → READY → SERVED)
- **Cashier**: Process payments, view bills, payment history with date filtering
- **Manager**: Full access to menu management, analytics (daily reports, top-selling items, completed orders)

### Key Features
- Real-time table status monitoring with auto-refresh
- Order management with kitchen queue
- Payment processing (Cash/Card)
- Payment history with date filtering
- Daily revenue reports with customers served
- Top-selling items analytics by category
- Completed orders report with filtering
- JWT authentication with role-based routing
- Responsive UI with Ant Design
- Comprehensive unit test coverage (54 tests)

## Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 5 + Ant Design 5
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Backend**: Express.js 4 + Node.js
- **Database**: MongoDB Atlas with Mongoose 8 ODM
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas
- **Testing**: Vitest + MongoDB Memory Server + React Testing Library

## Project Structure

```
restaurant-pos/
├── backend/                      # Express.js backend server
│   ├── server.js                # Express app entry point
│   ├── seed.ts                  # Database seeding script
│   ├── package.json             # Backend dependencies
│   │
│   ├── lib/
│   │   ├── db.ts                # MongoDB connection
│   │   └── responses-express.js # Standardized API responses
│   │
│   ├── models/                  # Mongoose schemas (6 models)
│   │   ├── User.ts              # User model (username, password, role)
│   │   ├── Table.ts             # Table model (number, status, session)
│   │   ├── MenuItem.ts          # Menu item model (name, price, category)
│   │   ├── Session.ts           # Session model (table, status, timestamps)
│   │   ├── Order.ts             # Order model (session, items, status)
│   │   └── Payment.ts           # Payment model (session, amount, method)
│   │
│   ├── middleware/
│   │   ├── auth-express.js      # JWT authentication middleware
│   │   └── role.ts              # Role-based authorization
│   │
│   ├── validators/              # Zod validation schemas (4 sets)
│   │   ├── auth.ts              # Login validation
│   │   ├── menu.ts              # Menu item validation
│   │   ├── order.ts             # Order validation
│   │   └── session.ts           # Session/payment validation
│   │
│   ├── routes/                  # Express route handlers (8 routers)
│   │   ├── auth.js              # POST /login - Authentication
│   │   ├── users.js             # GET /users - User management
│   │   ├── tables.js            # GET /tables - Table listing
│   │   ├── menu.js              # CRUD /menu/items - Menu management
│   │   ├── sessions.js          # /sessions - Session management
│   │   ├── orders.js            # /orders - Order management
│   │   ├── payments.js          # /payments - Payment history
│   │   └── reports.js           # /reports - Analytics endpoints
│   │
│   └── tests/                   # Backend unit tests (36 tests)
│       ├── models.test.ts       # Mongoose model tests (15 tests)
│       ├── validators.test.ts   # Zod schema tests (21 tests)
│       └── setup.ts             # Test configuration
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── api/                 # API client modules
│   │   │   ├── http.ts          # Axios instance with interceptors
│   │   │   ├── authApi.ts       # Auth endpoints
│   │   │   ├── menuApi.ts       # Menu endpoints
│   │   │   ├── tablesApi.ts     # Tables endpoints
│   │   │   ├── sessionsApi.ts   # Sessions endpoints
│   │   │   ├── ordersApi.ts     # Orders endpoints (9 files)
│   │   │   ├── http.ts          # Axios instance with JWT interceptors
│   │   │   ├── client.ts        # API client utilities
│   │   │   ├── authApi.ts       # Auth endpoints
│   │   │   ├── menuApi.ts       # Menu endpoints
│   │   │   ├── tablesApi.ts     # Tables endpoints
│   │   │   ├── sessionsApi.ts   # Sessions endpoints
│   │   │   ├── ordersApi.ts     # Orders endpoints
│   │   │   ├── paymentsApi.ts   # Payments endpoints
│   │   │   └── reportsApi.ts    # Reports endpoints
│   │   │
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppShell.tsx # Main layout with header
│   │   │       └── RoleNav.tsx  # Role-based navigation menu
│   │   │
│   │   ├── pages/               # Page components by role
│   │   │   ├── LoginPage.tsx    # Login with validation
│   │   │   ├── waiter/
│   │   │   │   ├── TablesPage.tsx    # Table management + open sessions
│   │   │   │   └── OrderPage.tsx     # Create orders with cart
│   │   │   ├── kitchen/
│   │   │   │   └── KitchenPage.tsx   # Order queue with status updates
│   │   │   ├── cashier/
│   │   │   │   └── CashierPage.tsx   # Bill details, payments & history
│   │   │   └── manager/
│   │   │       ├── MenuPage.tsx      # Menu CRUD operations
│   │   │       └── ReportsPage.tsx   # Daily/Top Items/Completed Orders
│   │   │
│   │   ├── routes/
│   │   │   ├── index.tsx        # Route definitions with guards
│   │   │   └── guards.tsx       # Auth & role-based route guards
│   │   │
│   │   ├── stores/              # Zustand state management
│   │   │   ├── authStore.ts     # Auth state (token, user)
│   │   │   └── cartStore.ts     # Shopping cart state
│   │   │
│   │   ├── utils/
│   │   │   ├── types.ts         # Shared TypeScript types
│   │   │   ├── money.ts         # Money formatting ($X.XX)
│   │   │   └── dates.ts         # Date formatting utilities
│   │   │
│   │   ├── tests/               # Frontend unit tests (18 tests)
│   │   │   ├── cartStore.test.ts      # Cart store tests (9 tests)
│   │   │   ├── Guards.test.tsx        # Route guard tests (5 tests)
│   │   │   ├── LoginPage.test.tsx     # Login page tests (3 tests)
│   │   │   ├── TablesPage.test.tsx    # Tables page test (1 test)
│   │   │   └── setup.ts               # Test configuration
│   │   │
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   │
│   ├── package.json             # Frontend dependencies
│   ├── tsconfig.json
│   └── vite.config.ts
│
├─Server port
PORT=3000
```

**MongoDB URI Format:**
- Replace `your-username` and `your-password` with your MongoDB Atlas credentials
- Replace `cluster0.xxxxx` with your actual cluster address
- Database name: `restaurant-pos# Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:

```env
# API base URL (localhost for development)
VITE_API_URL=http://localhost:3000/api
```

For production, change to your Vercel deployment URL:
```env
VITE_API_URL=https://your-app.vercel.app/api
```

## Installation

> 📋 **New to the project?** Check out [SETUP.md](SETUP.md) for detailed step-by-step instructions with troubleshooting tips!

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up free](https://www.mongodb.com/cloud/atlas))
- **npm** (comes with Node.js)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-pos
   ```

2. **Install root dependencies**
   ```bash
   npm instalbackend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   Create `.env` in project root:
   ```bash
   # Windows PowerShell
   New-Item -Path .env -ItemType File
   
   # macOS/Linux
   touch .env
   ```
   
   Then add:
   ```env
   MONGODB_URI=mongodb+srv://dbUser:dbUserPassword@cluster0.xxxxx.mongodb.net/restaurant-pos
   JWT_SECRET=dev-secret-key-replace-in-production
   PORT=3000
   ```

5. **Set up MongoDB Atlas**
   
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user (Database Access)
   - Whitelist your IP address (Network Access → Add IP Address → Allow Access from Anywhere for development)
   - Get connection string (Connect → Connect your application → Copy connection string)
   - Update `MONGODB_URI` in `.env` with your connection string

6. **Seed the database**
   ```bash
   cd backend
   npm run seed
   ```
   
   This creates:
   - **4 test users** (waiter, kitchen, cashier, manager)
   - **10 tables** (Table 1-10)
   - **15 menu items** (Burger, Pizza, Pasta, Steak, Salad, etc.)
   - **3 test sessions with orders** (Tables 1-3 with active orders)
   
   Example output:
   ```
   ✓ Created 4 users
   ✓ Created 10 tables
   ✓ Created 15 menu items
   ✓ Created 3 test sessions with orders
     - Table 1: 2 orders (Burger, Fries, Coke, Cake, Coffee) - Total: $46.94
     - Table 2: 1 order (Pizza, Salad, Water x2) - Total: $27.96
     - Table 3: 1 order (Steak, Rice, Tea) - Total: $31.97
   ✅ Database seeded successfully!
   ```

### Development Mode

You need to run **two servers** simultaneously:

#### 1. Start Backend Server (Terminal 1)

```bash
# From project root
cd backend
npm run dev
```

✅ Backend API will run on **http://localhost:3000**

Expected output:
```
✔ Connected to MongoDB
Server running on http://localhost:3000
API available at http://localhost:3000/api
```

#### 2. Start Frontend Server (Terminal 2)

```bash
# Open a new terminal
cd frontend
npm run dev
```

✅ Frontend will run on **http://localhost:5177**

Expected output:
```
VITE v5.0.x  ready in xxx ms

➜  Local:   http://localhost:5177/
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5177
```

You'll see the login page. Use the credentials below.

### Test Data

The seed script creates 3 active sessions with orders for testing:
- **Table 1**: 2 orders (Burger ×2, Fries ×2, Coke ×2, Cake, Coffee ×2) - $46.94
- **Table 2**: 1 order (Pizza, Salad, Water ×2) - $27.96
- **Table 3**: 1 order (Steak, Rice, Tea) - $31.97
## Login Credentials

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `waiter` | `waiter123` | WAITER | Tables, Orders |
| `kitchen` | `kitchen123` | KITCHEN | Kitchen Queue |
| `cashier` | `cashier123` | CASHIER | Payments, History |
| `manager` | `manager123` | MANAGER | Menu, Reports |

⚠️ **Security Note**: Change these passwords before deploying to production!

## Usage Workflow

### Complete Order Flow

1. **Waiter - Open Table Session**
   - Login as `waiter` / `waiter123`
   - Click "Open Session" on a free table
   - Navigate to Orders page
   - Add items to cart
   - Submit order to kitchen

2. **Kitchen - Prepare Food**
   - Login as `kitchen` / `kitchen123`
   - View order in queue (status: NEW)
   - Update status: NEW → IN_PROGRESS → READY → SERVED

3. **Cashier - Process Payment**
   - Login as `cashier` / `cashier123`
   - Click "View Bill & Pay" on occupied table
   - Review bill details with itemized list
   - Select payment method (Cash/Card)
   - Click "Process Payment"
   - Table automatically becomes free
   - View payment history with date filtering

4. **Manager - View Reports**
   - Login as `manager` / `manager123`
   - View daily revenue dashboard with statistics
   - Analyze top-selling items by category
   - Review completed orders with filtering
   - Manage menu items (add/edit/delete)

## API Endpoints

### Authentication
```
POST /api/auth/login
Request: { "username": "waiter", "password": "waiter123" }
Response: { "token": "jwt...", "user": { "username": "waiter", "role": "WAITER" } }
```

### Users
```
GET /api/users                      # List all users (MANAGER)
```

### Menu Items
```
GET    /api/menu/items              # List all items
POST   /api/menu/items              # Create item (MANAGER)
PATCH  /api/menu/items/:id          # Update item (MANAGER)
DELETE /api/menu/items/:id          # Delete item (MANAGER)
```

### Tables
```
GET /api/tables                     # List all tables with status
```

### Sessions
```
POST /api/sessions/open             # Open table session (WAITER, MANAGER)
GET  /api/sessions/:id/bill         # View bill (CASHIER, MANAGER)
POST /api/sessions/:id/pay          # Process payment (CASHIER, MANAGER)
POST /api/sessions/:id/orders       # Add order (WAITER, MANAGER)
POST /api/sessions/:id/close        # Close session (WAITER, CASHIER, MANAGER)
```

### Orders
```
GET   /api/orders/kitchen           # Kitchen queue (KITCHEN)
PATCH /api/orders/:id/status        # Update status (KITCHEN)
```

### Payments
```
GET /api/payments/history?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
# Payment history with date filtering (CASHIER, MANAGER)
```

### Reports (Manager Only)
```
GET /api/reports/daily?date=YYYY-MM-DD
# Daily revenue, orders, customers served

GET /api/reports/top-items?from=YYYY-MM-DD&to=YYYY-MM-DD
# Top-selling items by category with quantity and revenue

GET /api/reports/completed-orders?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
# Completed orders with bill details

### Reports
```
GET /api/reports/daily?date=YYYY-MM-DD          # Daily report (MANAGER)
GET /api/reports/top-items?from=YYYY-MM-DD&to=YYYY-MM-DD  # Top items (MANAGER)
```
esting

### Run Backend Tests
```bash
cd backend
npm test
```

Runs 36 tests:
- **models.test.ts** - 15 tests (Mongoose model validation)
- **validators.test.ts** - 21 tests (Zod schema validation)

### Run Frontend Tests
```bash
cd frontend
npm test
```

Runs 18 tests:
- **cartStore.test.ts** - 9 tests (Cart state management)
- **Guards.test.tsx** - 5 tests (Route guards)
- **LoginPage.test.tsx** - 3 tests (Login functionality)
- **TablesPage.test.tsx** - 1 test (Tables page rendering)

### Watch Mode
```bash
npm run test:watch      # Backend watch mode
npm run test:coverage   # Backend with coverage report
```

## Troubleshooting

### Backend won't start
- **Build Backend
```bash
cd backend
npm start
```

Uses `tsx` to run TypeScript files directly in production.

### Deployment Considerations

1. **Environment Variables**
   - Set `MONGODB_URI` to production MongoDB cluster
   - Use strong `JWT_SECRET` (32+ random characters)
   - Set `PORT` if required by hosting platform
   
2. **Database**
   - Update MongoDB Atlas IP whitelist for production server
   - Enable connection pooling
   - Set up database backups

3. **Security**
   - Enable CORS restrictions (update `server.js`)
   - Add rate limiting middleware
   - Enable HTTPS only
   - Change default login passwords

4. **Hosting Options**
   - **Backend**: Railway, Render, (waiter123, kitchen123, cashier123, manager123)
- [ ] Use strong JWT_SECRET (32+ random characters, cryptographically random)
- [ ] Update CORS settings in `backend/server.js` (restrict allowed origins)
- [ ] Enable MongoDB IP whitelist (remove "Allow Access from Anywhere")
- [ ] Remove or protect seed script in production
- [ ] Enable HTTPS only (redirect HTTP to HTTPS)
- [ ] Add rate limiting middleware (express-rate-limit)
- [ ] Add input sanitization (express-mongo-sanitize)
- [ ] Review user permissions and roles
- [ ] Set up logging and monitoring
- [ ] Enable CSP (Content Security Policy) headers
- [ ] Add request validation middleware
- [ ] Set secure cookie flags for JWT

## Architecture Highlights

### Backend (Express.js)
- **RESTful API** with 8 route handlers
- **JWT Authentication** with role-based middleware
- **Mongoose ODM** for MongoDB with proper indexing
- **Zod Validation** for all incoming requests
- **Standardized Responses** for consistent API format
- **Error Handling** with proper HTTP status codes

### Frontend (React + TypeScript)
- **TanStack Query** for server state caching & auto-refresh
- **Zustand** for lightweight client state management
- **React Router** with role-based route guards
- **Ant Design** for professional UI components
- **Axios Interceptors** for JWT token injection
- **TypeScript** for type safety throughout

### Database (MongoDB)
- **6 Collections**: Users, Tables, MenuItems, Sessions, Orders, Payments
- **Referential Integrity** via Mongoose ObjectIds
- **Compound Indexes** for optimized queries
- **Enums** for status fields (order status, payment method, user roles)

## Project Status

✅ **Completed Features:**
- Full CRUD operations for menu items
- Table session management with status tracking
- Order creation and kitchen queue
- Payment processing with history
- Manager analytics (daily, top items, completed orders)
- JWT authentication with role-based access
- Auto-refresh on all data-heavy pages
- 54 passing unit tests (36 backend + 18 frontend)
- Database seeding with test data
### Page constantly switching between routes (redirect loop)
- **Cause**: Old cached authentication data in localStorage (usually after code updates)
- **Solution**: Hard refresh the browser with `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- **Alternative**: Open DevTools (F12) → Application → Local Storage → Right-click → Clear
- **Note**: Works in incognito mode but not regular browser = cached data issue
- The app now auto-migrates old data, but manual cache clear may be needed once

### Changes not reflecting
- **Hard refresh browser**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Restart frontend**: Stop the Vite server (Ctrl+C) and run `npm run dev` again
- **Restart backend**: Stop the server (Ctrl+C) in backend terminal and run `npm run dev` again
- **Clear browser cache**: Open DevTools → Application → Local Storage → Clear All

### Tests failing
- **MongoDB Memory Server**: First run may take time to download binary
- **Port conflicts**: Stop other Node processes or change ports in config
- **Cache issues**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Building for Production

### Build Frontend
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env`:
     - `MONGODB_URI` (production MongoDB URI)
     - `JWT_SECRET` (strong random string)
     - `NODE_ENV` = `production`

4. **Update Frontend .env**
   - Change `VITE_API_URL` to your Vercel deployment URL
   - Rebuild and redeploy frontend

## Security Considerations

### Before Production Deployment

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Update CORS settings in `backend/lib/responses.ts`
- [ ] Enable MongoDB IP whitelist (remove "Allow Access from Anywhere")
- [ ] Review and remove seed endpoint or add authentication
- [ ] Enable HTTPS only
- [ ] Add rate limiting to API endpoints
- [ ] Add input sanitization
- [ ] Review user permissions and roles

## License

MIT
