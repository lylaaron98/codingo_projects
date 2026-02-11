# Restaurant POS System

A modern Point of Sale system for restaurants with role-based access control, built with React, TypeScript, and Vercel Serverless Functions.

## Features

### Role-Based Access
- **Waiter**: Manage tables, create orders, view menu
- **Kitchen**: View order queue, update order status (NEW → IN_PROGRESS → READY)
- **Cashier**: Process payments, view bills, payment history with date filtering
- **Manager**: Full access to menu management, daily reports, top-selling items

### Key Features
- Real-time table status monitoring
- Order management with kitchen queue
- Payment processing (Cash/Card)
- Payment history with date filtering
- Daily revenue reports
- Top-selling items analytics
- JWT authentication with role-based routing
- Responsive UI with Ant Design

## Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 5 + Ant Design 5
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Backend**: Vercel Serverless Functions + Node.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Validation**: Zod schemas

## Project Structure

```
restaurant-pos/
├── api/                          # Vercel serverless endpoints (14 total)
│   ├── auth/
│   │   ├── login.ts             # POST - User authentication
│   │   └── seed.ts              # POST - Database seeding (dev only)
│   ├── menu/
│   │   └── items/
│   │       ├── index.ts         # GET/POST - List/create menu items
│   │       └── [id].ts          # PATCH/DELETE - Update/delete menu item
│   ├── tables/
│   │   └── index.ts             # GET - List all tables with status
│   ├── sessions/
│   │   ├── open.ts              # POST - Open table session
│   │   └── [id]/
│   │       ├── bill.ts          # GET - View bill
│   │       ├── pay.ts           # POST - Process payment
│   │       ├── orders.ts        # POST - Add order to session
│   │       └── close.ts         # POST - Close session without payment
│   ├── orders/
│   │   ├── kitchen.ts           # GET - Kitchen order queue
│   │   └── [id]/
│   │       └── status.ts        # PATCH - Update order status
│   ├── payments/
│   │   └── history.ts           # GET - Payment history with date filter
│   ├── reports/
│   │   ├── daily.ts             # GET - Daily revenue report
│   │   └── top-items.ts         # GET - Top selling items
│   └── health.ts                # GET - Health check endpoint
│
├── backend/                      # Shared backend code
│   ├── lib/
│   │   ├── db.ts                # MongoDB connection with caching
│   │   └── responses.ts         # Standardized API responses
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts              # User model (username, password, role)
│   │   ├── Table.ts             # Table model (number, status, session)
│   │   ├── MenuItem.ts          # Menu item model (name, price, category)
│   │   ├── Session.ts           # Session model (table, status, timestamps)
│   │   ├── Order.ts             # Order model (session, items, status)
│   │   └── Payment.ts           # Payment model (session, amount, method)
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── role.ts              # Role-based authorization
│   └── validators/
│       ├── auth.ts              # Login validation (Zod)
│       ├── menu.ts              # Menu item validation
│       ├── order.ts             # Order validation
│       └── session.ts           # Session/payment validation
│
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── api/                 # API client modules
│   │   │   ├── http.ts          # Axios instance with interceptors
│   │   │   ├── authApi.ts       # Auth endpoints
│   │   │   ├── menuApi.ts       # Menu endpoints
│   │   │   ├── tablesApi.ts     # Tables endpoints
│   │   │   ├── sessionsApi.ts   # Sessions endpoints
│   │   │   ├── ordersApi.ts     # Orders endpoints
│   │   │   ├── paymentsApi.ts   # Payments endpoints
│   │   │   └── reportsApi.ts    # Reports endpoints
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppShell.tsx # Main layout with header
│   │   │       └── RoleNav.tsx  # Role-based navigation menu
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx    # Login with validation
│   │   │   ├── waiter/
│   │   │   │   ├── TablesPage.tsx    # Table management
│   │   │   │   └── OrderPage.tsx     # Create orders
│   │   │   ├── kitchen/
│   │   │   │   └── KitchenPage.tsx   # Order queue
│   │   │   ├── cashier/
│   │   │   │   └── CashierPage.tsx   # Payments & history
│   │   │   └── manager/
│   │   │       ├── MenuPage.tsx      # Menu management
│   │   │       └── ReportsPage.tsx   # Reports & analytics
│   │   ├── routes/
│   │   │   ├── index.tsx        # Route definitions
│   │   │   └── guards.tsx       # Auth & role guards
│   │   ├── stores/
│   │   │   ├── authStore.ts     # Auth state (Zustand)
│   │   │   └── cartStore.ts     # Cart state (Zustand)
│   │   ├── utils/
│   │   │   ├── types.ts         # TypeScript types
│   │   │   ├── money.ts         # Money formatting
│   │   │   └── dates.ts         # Date formatting
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── .env                     # Frontend env variables
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .env                          # Backend env variables
├── .gitignore
├── package.json
├── vercel.json                   # Vercel configuration
└── README.md
```

## Environment Variables

### Backend Environment Variables
Create a `.env` file in the project root:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/restaurant-pos?retryWrites=true&w=majority

# JWT secret key (use a strong random string in production)
JWT_SECRET=your-secure-jwt-secret-key-here

# Node environment
NODE_ENV=development
```

**MongoDB URI Format:**
- Replace `your-username` and `your-password` with your MongoDB Atlas credentials
- Replace `cluster0.xxxxx` with your actual cluster address
- Database name: `restaurant-pos`

### Frontend Environment Variables
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
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure environment variables**
   
   a. Create `.env` in project root:
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
   NODE_ENV=development
   ```
   
   b. Create `frontend/.env`:
   ```bash
   # Windows PowerShell
   New-Item -Path frontend/.env -ItemType File
   
   # macOS/Linux
   touch frontend/.env
   ```
   
   Then add:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

5. **Set up MongoDB Atlas**
   
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user (Database Access)
   - Whitelist your IP address (Network Access → Add IP Address → Allow Access from Anywhere for development)
   - Get connection string (Connect → Connect your application → Copy connection string)
   - Update `MONGODB_URI` in `.env` with your connection string

## Running the Application

### Development Mode

You need to run **two servers** simultaneously:

#### 1. Start Backend Server (Terminal 1)

```bash
# From project root
npx vercel dev
```

✅ Backend API will run on **http://localhost:3000**

Expected output:
```
Vercel CLI 28.x.x
Ready! Available at http://localhost:3000
```

#### 2. Start Frontend Server (Terminal 2)

```bash
# Open a new terminal
cd frontend
npm run dev
```

✅ Frontend will run on **http://localhost:5176**

Expected output:
```
VITE v5.0.x  ready in xxx ms

➜  Local:   http://localhost:5176/
```

### First-Time Setup: Seed the Database

After both servers are running, seed the database with test data:

```bash
# Windows PowerShell (Terminal 3)
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/seed" -Method Post -ContentType "application/json"

# macOS/Linux
curl -X POST http://localhost:3000/api/auth/seed
```

This creates:
- **4 test users** (see Login Credentials below)
- **10 tables** (Table 1-10)
- **15 menu items** (various categories: Mains, Desserts, Drinks)

**Note:** The seed endpoint can be run multiple times - it clears existing data each time.

### Access the Application

Open your browser and navigate to:
```
http://localhost:5176
```

You'll see the login page. Use the credentials below.

## Login Credentials

| Username | Password | Role | Access |
|----------|----------|------|--------|
| `waiter` | `password123` | WAITER | Tables, Orders |
| `kitchen` | `password123` | KITCHEN | Kitchen Queue |
| `cashier` | `password123` | CASHIER | Payments, History |
| `manager` | `password123` | MANAGER | Menu, Reports |

⚠️ **Security Note**: Change these passwords before deploying to production!

## Usage Workflow

### Complete Order Flow

1. **Waiter - Open Table & Create Order**
   - Login as `waiter`
   - Click "Open Session" on a free table
   - Add items to order
   - Submit order

2. **Kitchen - Prepare Food**
   - Login as `kitchen`
   - View order in queue (status: NEW)
   - Update status: NEW → IN_PROGRESS → READY

3. **Cashier - Process Payment**
   - Login as `cashier`
   - Click "View Bill & Pay" on occupied table
   - Select payment method (Cash/Card)
   - Click "Process Payment"
   - Table automatically becomes free

4. **Manager - View Reports**
   - Login as `manager`
   - View daily revenue dashboard
   - Check top-selling items
   - Manage menu items

## API Endpoints

### Authentication
```
POST /api/auth/login
Request: { "username": "waiter", "password": "password123" }
Response: { "token": "jwt...", "user": { "username": "waiter", "role": "WAITER" } }

POST /api/auth/seed (Development only)
Response: { "message": "Database seeded successfully", "data": {...} }
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
POST /api/sessions/open             # Open table session (WAITER)
GET  /api/sessions/:id/bill         # View bill (CASHIER, MANAGER)
POST /api/sessions/:id/pay          # Process payment (CASHIER, MANAGER)
POST /api/sessions/:id/orders       # Add order (WAITER)
POST /api/sessions/:id/close        # Close without payment (MANAGER)
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

### Reports
```
GET /api/reports/daily?date=YYYY-MM-DD          # Daily report (MANAGER)
GET /api/reports/top-items?from=YYYY-MM-DD&to=YYYY-MM-DD  # Top items (MANAGER)
```

## Troubleshooting

### Backend won't start
- **Check MongoDB connection**: Verify `MONGODB_URI` in `.env` is correct
- **Check port 3000**: Make sure no other process is using port 3000
  ```bash
  # Windows
  netstat -ano | findstr :3000
  
  # macOS/Linux
  lsof -i :3000
  ```

### Frontend won't start
- **Check port 5176**: Make sure no other process is using port 5176
- **Check API URL**: Verify `VITE_API_URL` in `frontend/.env` is `http://localhost:3000/api`

### Login not working
- **Check backend is running**: Visit http://localhost:3000/api/health
- **Run seed script**: Make sure you've seeded the database with users
- **Check browser console**: Look for network errors or CORS issues

### 500 errors on API calls
- **Check Vercel dev terminal**: Look for error messages
- **Common issues**:
  - Missing model imports for Mongoose populate
  - MongoDB connection timeout (check network access in Atlas)
  - Missing environment variables

### Changes not reflecting
- **Hard refresh browser**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Restart Vercel dev**: Stop and restart `npx vercel dev`
- **Clear localStorage**: Open DevTools → Application → Local Storage → Clear All

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
