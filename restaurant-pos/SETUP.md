# Restaurant POS - Complete Setup Guide

This guide provides explicit step-by-step instructions to set up and run the Restaurant POS system on localhost for development.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [MongoDB Atlas Configuration](#mongodb-atlas-configuration)
4. [Environment Configuration](#environment-configuration)
5. [Database Seeding](#database-seeding)
6. [Running the Application](#running-the-application)
7. [Accessing the Application](#accessing-the-application)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. Node.js (Version 18 or higher)

**Check if installed:**
```bash
node --version
```

**If not installed:**
- Download from [nodejs.org](https://nodejs.org/)
- Choose the LTS (Long Term Support) version
- Run the installer and follow the prompts
- Restart your terminal after installation

### 2. npm (comes with Node.js)

**Check if installed:**
```bash
npm --version
```

### 3. Git (for cloning the repository)

**Check if installed:**
```bash
git --version
```

**If not installed:**
- Download from [git-scm.com](https://git-scm.com/)

### 4. MongoDB Atlas Account (Free)

You'll need a free MongoDB Atlas account for the database.
- Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## Initial Setup

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`
- Type `powershell` and press Enter

**Mac/Linux:**
- Press `Cmd + Space` and type `terminal`

### Step 2: Navigate to Your Projects Folder

```bash
# Windows
cd C:\Users\YourUsername\Documents

# Mac/Linux
cd ~/Documents
```

### Step 3: Clone the Repository (if needed)

```bash
git clone <repository-url>
cd restaurant-pos
```

**Or if you already have the project:**
```bash
cd path\to\restaurant-pos
```

### Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

**Wait for installation to complete.** You should see:
```
added XXX packages in XXs
```

**Expected warnings are OK:**
- Funding messages
- Peer dependency warnings
- Vulnerability warnings (we'll address these later)

### Step 5: Install Frontend Dependencies

```bash
cd ..
cd frontend
npm install
```

**Wait for installation to complete.**

### Step 6: Return to Project Root

```bash
cd ..
```

You should now be in the `restaurant-pos` folder.

---

## MongoDB Atlas Configuration

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Create your account with email or Google

### Step 2: Create a Cluster

1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (no credit card required)
3. Choose your cloud provider (AWS recommended)
4. Choose a region **closest to your location**
5. Name your cluster (or keep default: `Cluster0`)
6. Click **"Create Cluster"**
7. **Wait 3-5 minutes** for cluster creation

### Step 3: Create Database User

1. In the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `dbUser` (or your choice)
5. Click **"Autogenerate Secure Password"** and **COPY IT** immediately
6. Or create your own password and **SAVE IT**
7. Set privileges to **"Read and write to any database"**
8. Click **"Add User"**

**⚠️ IMPORTANT:** Save your username and password! You'll need them in the next step.

### Step 4: Whitelist Your IP Address

1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development only)
   - This adds `0.0.0.0/0`
   - ⚠️ For production, use specific IP addresses
4. Click **"Confirm"**
5. **Wait 1-2 minutes** for changes to take effect

### Step 5: Get Connection String

1. Go back to **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Ensure **"Driver"** is set to **"Node.js"**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://dbUser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual database password
7. **Add database name** after `.net/` like this:
   ```
   mongodb+srv://dbUser:yourpassword@cluster0.xxxxx.mongodb.net/restaurant-pos?retryWrites=true&w=majority
   ```

**Example complete connection string:**
```
mongodb+srv://dbUser:MyPass123@cluster0.9chao4o.mongodb.net/restaurant-pos?retryWrites=true&w=majority
```

---

## Environment Configuration

### Step 1: Create Backend Environment File

1. Make sure you're in the project root folder: `restaurant-pos`
2. Check if `.env` file exists:

**Windows PowerShell:**
```powershell
Test-Path .env
```

**Mac/Linux:**
```bash
ls -la .env
```

### Step 2: Edit or Create .env File

If the file exists, open it. If not, create it.

**Create new file (Windows PowerShell):**
```powershell
New-Item -Path .env -ItemType File
notepad .env
```

**Create new file (Mac/Linux):**
```bash
touch .env
nano .env
```

### Step 3: Add Environment Variables

Paste the following into the `.env` file:

```env
MONGODB_URI=mongodb+srv://dbUser:yourpassword@cluster0.xxxxx.mongodb.net/restaurant-pos?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

**Replace the values:**
- `MONGODB_URI`: Paste your complete connection string from Step 5 above
- `JWT_SECRET`: Use any long random string (for development, anything works)
- `PORT`: Keep as 3000
- `NODE_ENV`: Keep as development

**Example:**
```env
MONGODB_URI=mongodb+srv://dbUser:MyPass123@cluster0.9chao4o.mongodb.net/restaurant-pos?retryWrites=true&w=majority
JWT_SECRET=my-dev-secret-key-12345
PORT=3000
NODE_ENV=development
```

### Step 4: Save the File

**In Notepad (Windows):**
- Click File → Save
- Close Notepad

**In nano (Mac/Linux):**
- Press `Ctrl + O` to save
- Press `Enter` to confirm
- Press `Ctrl + X` to exit

### Step 5: Verify Configuration

**Windows:**
```powershell
Get-Content .env
```

**Mac/Linux:**
```bash
cat .env
```

You should see your configuration printed.

---

## Database Seeding

This step creates initial data: users, tables, menu items, and sample orders.

### Step 1: Navigate to Backend Folder

```bash
cd backend
```

### Step 2: Run Seed Script

```bash
npm run seed
```

### Step 3: Verify Success

You should see output like:

```
Connecting to database...
✓ Connected to MongoDB

Clearing existing data...
✓ Existing data cleared

Seeding users...
✓ Created 4 users
  - waiter (password: waiter123)
  - kitchen (password: kitchen123)
  - cashier (password: cashier123)
  - manager (password: manager123)

Seeding tables...
✓ Created 10 tables

Seeding menu items...
✓ Created 15 menu items

Seeding test sessions and orders...
✓ Created 3 test sessions with orders
  - Table 1: 2 orders - Total: $46.94
  - Table 2: 1 order - Total: $27.96
  - Table 3: 1 order - Total: $31.97

✅ Database seeded successfully!
```

### Step 4: Save Login Credentials

**Important:** Write down these login credentials:

| Username | Password | Role |
|----------|----------|------|
| waiter | waiter123 | WAITER |
| kitchen | kitchen123 | KITCHEN |
| cashier | cashier123 | CASHIER |
| manager | manager123 | MANAGER |

---

## Running the Application

You need to run **TWO SERVERS** simultaneously: Backend and Frontend.

### Terminal 1: Start Backend Server

#### Step 1: Open First Terminal

**Windows:**
- Press `Win + R`, type `powershell`, press Enter

**Mac/Linux:**
- Press `Cmd + Space`, type `terminal`, press Enter

#### Step 2: Navigate to Backend

```bash
cd path\to\restaurant-pos\backend
```

**Example:**
```bash
# Windows
cd C:\Users\YourName\Documents\restaurant-pos\backend

# Mac/Linux
cd ~/Documents/restaurant-pos/backend
```

#### Step 3: Start Backend Server

```bash
npm run dev
```

#### Step 4: Verify Backend is Running

You should see:

```
✓ Connected to MongoDB
✓ Server running on http://localhost:3000
✓ API available at http://localhost:3000/api
```

**⚠️ DO NOT CLOSE THIS TERMINAL!** Leave it running.

### Terminal 2: Start Frontend Server

#### Step 1: Open Second Terminal

**Windows:**
- Press `Win + R`, type `powershell`, press Enter (again)

**Mac/Linux:**
- Press `Cmd + T` for new tab in existing terminal
- Or open a new terminal window

#### Step 2: Navigate to Frontend

```bash
cd path\to\restaurant-pos\frontend
```

**Example:**
```bash
# Windows
cd C:\Users\YourName\Documents\restaurant-pos\frontend

# Mac/Linux
cd ~/Documents/restaurant-pos/frontend
```

#### Step 3: Start Frontend Server

```bash
npm run dev
```

#### Step 4: Verify Frontend is Running

You should see:

```
VITE v5.4.21  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**⚠️ DO NOT CLOSE THIS TERMINAL!** Leave it running.

---

## Accessing the Application

### Step 1: Open Web Browser

Open your preferred browser:
- Chrome (recommended)
- Firefox
- Edge
- Safari

### Step 2: Navigate to Application

Type or paste this URL in the address bar:

```
http://localhost:5173
```

Press Enter.

### Step 3: You Should See the Login Page

The page displays:
- **Restaurant POS** title
- Username input field
- Password input field
- **Log in** button

### Step 4: Test Login

Let's test with the **Cashier** account:

1. Username field: Type `cashier`
2. Password field: Type `cashier123`
3. Click **Log in** button

### Step 5: Successful Login

After successful login, you should be redirected to the **Cashier Dashboard**.

You'll see:
- Tables with their status (FREE/OCCUPIED)
- Ability to view bills and process payments

---

## Testing All User Roles

### 1. Waiter Account

**Login:**
- Username: `waiter`
- Password: `waiter123`

**You can:**
- View all tables and their status
- Open new sessions for tables
- Create orders for tables
- View the menu

**To test:**
1. Click "Open Session" on a FREE table
2. Navigate to create an order
3. Add items from the menu
4. Submit the order

### 2. Kitchen Account

**Login:**
- Username: `kitchen`
- Password: `kitchen123`

**You can:**
- View all pending orders in the kitchen queue
- Update order status (NEW → IN_PROGRESS → READY → SERVED)

**To test:**
1. You'll see orders from Table 1, 2, and 3
2. Click on an order to change its status
3. Progress through: IN_PROGRESS → READY → SERVED

### 3. Cashier Account

**Login:**
- Username: `cashier`
- Password: `cashier123`

**You can:**
- View all tables
- View bills for occupied tables
- Process payments (Cash/Card)
- View payment history with date filters

**To test:**
1. Click "View Bill & Pay" on Table 1, 2, or 3
2. Review the itemized bill
3. Select payment method (Cash or Card)
4. Click "Process Payment"
5. Table becomes FREE again

### 4. Manager Account

**Login:**
- Username: `manager`
- Password: `manager123`

**You can:**
- Full access to all features
- Manage menu items (Create/Edit/Delete)
- View analytics and reports:
  - Daily revenue
  - Top-selling items
  - Completed orders
- Manage users
- All waiter, kitchen, and cashier functions

**To test:**
1. Navigate to Menu Management
2. Add a new menu item
3. Edit an existing item
4. View Reports
5. Check daily revenue statistics

---

## Common Issues & Solutions

### Issue 1: Backend won't start - MongoDB connection error

**Error message:**
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

**Solutions:**

1. **Check MongoDB URI in .env file**
   - Open `.env` file
   - Verify `MONGODB_URI` is correct
   - Ensure password is correct (no < > brackets)
   - Ensure database name is added: `/restaurant-pos?`

2. **Check IP Whitelist**
   - Go to MongoDB Atlas → Network Access
   - Ensure `0.0.0.0/0` is listed
   - Wait 1-2 minutes after adding

3. **Test connection string**
   - Copy your connection string
   - Use MongoDB Compass to test it
   - Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)

### Issue 2: Backend won't start - Port already in use

**Error message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Option A - Kill the process using port 3000:**

**Windows:**
```powershell
# Find process
netstat -ano | findstr :3000

# Kill process (replace PID with the number from above)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Option B - Change the port:**
1. Open `.env` file
2. Change `PORT=3000` to `PORT=3001`
3. Save and restart backend

### Issue 3: Frontend won't start - Port already in use

**Error message:**
```
Port 5173 is already in use
```

**Solutions:**

1. **Kill the other Vite process:**
   - Find the other terminal running Vite
   - Press `Ctrl + C` to stop it

2. **Or use a different port:**
   - Vite will automatically ask: "Port 5173 is in use, use 5174 instead?"
   - Type `y` and press Enter

### Issue 4: Page keeps redirecting between /login and /cashier

**Symptoms:**
- Page flickers and switches routes constantly
- Works in Incognito mode but not regular browser

**Cause:**
- Old cached authentication data in browser localStorage

**Solutions:**

**Option 1 - Hard Refresh:**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Option 2 - Clear localStorage manually:**
1. Open the application
2. Press `F12` to open Developer Tools
3. Click "Application" tab (Chrome) or "Storage" (Firefox)
4. Expand "Local Storage" in left sidebar
5. Click on `http://localhost:5173`
6. Right-click → "Clear"
7. Refresh the page (`F5`)

**Option 3 - Clear browser cache:**
```
Windows/Linux: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
```
- Select "Cached images and files"
- Click "Clear data"

### Issue 5: Login fails - "Invalid credentials"

**Symptoms:**
- Correct password, but login fails
- Error message: "Invalid credentials"

**Solutions:**

1. **Verify the password is correct:**
   - waiter: `waiter123`
   - kitchen: `kitchen123`
   - cashier: `cashier123`
   - manager: `manager123`

2. **Check if database was seeded:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Check backend is running and connected to MongoDB**

### Issue 6: "Cannot GET /api/..." errors

**Symptoms:**
- Frontend loads but API calls fail
- Network tab shows 404 errors

**Solutions:**

1. **Verify backend is running:**
   - Check Terminal 1 (backend terminal)
   - Should show "Server running on http://localhost:3000"

2. **Test backend directly:**
   - Open browser
   - Go to: `http://localhost:3000/api/health`
   - Should show: `{"status":"ok","timestamp":"..."}`

3. **Check frontend .env configuration:**
   ```bash
   cd frontend
   ```
   - Create `.env` file if it doesn't exist
   - Add: `VITE_API_URL=http://localhost:3000/api`
   - Restart frontend server

### Issue 7: npm install fails

**Symptoms:**
- Errors during `npm install`
- Missing packages

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   # In backend folder
   rm -rf node_modules package-lock.json
   npm install

   # In frontend folder
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 18.x or higher

4. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

### Issue 8: Changes not reflecting in browser

**Symptoms:**
- You edit code but don't see changes
- Old version still showing

**Solutions:**

1. **Hard refresh browser:**
   ```
   Windows/Linux: Ctrl + Shift + R
   Mac: Cmd + Shift + R
   ```

2. **Check if Vite detected the change:**
   - Look at Terminal 2 (frontend terminal)
   - Should show: "[vite] hmr update /src/..."

3. **Restart Vite dev server:**
   - Terminal 2: Press `Ctrl + C`
   - Run: `npm run dev`

4. **Check you're editing the right file:**
   - Verify file path matches project structure

### Issue 9: Module not found errors

**Error message:**
```
Cannot find module '@/api/authApi'
```

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   npm install
   ```

2. **Check file path:**
   - Verify the file exists at the expected location
   - Check import statement syntax

3. **Restart TypeScript server (in VS Code):**
   - Press `Ctrl + Shift + P`
   - Type: "TypeScript: Restart TS Server"
   - Press Enter

---

## Stopping the Application

### To Stop Servers:

1. **Stop Backend Server:**
   - Go to Terminal 1 (backend)
   - Press `Ctrl + C`
   - Confirm if prompted

2. **Stop Frontend Server:**
   - Go to Terminal 2 (frontend)
   - Press `Ctrl + C`
   - Confirm if prompted

### To Restart Later:

Simply repeat the steps in [Running the Application](#running-the-application).

---

## Next Steps

### Explore Features:

1. **Create a complete order flow:**
   - Login as Waiter → Open session → Create order
   - Login as Kitchen → Update order status
   - Login as Cashier → Process payment

2. **Test Manager features:**
   - Add/edit menu items
   - View analytics
   - Check reports

3. **Learn the codebase:**
   - Backend: `backend/routes/` - API endpoints
   - Frontend: `frontend/src/pages/` - UI pages
   - Read: `README.md` - Full documentation

### Development Resources:

- **Backend API docs:** See `README.md` → API Endpoints section
- **Test the app:** Both frontend and backend have test suites
  ```bash
  # Backend tests
  cd backend
  npm test

  # Frontend tests
  cd frontend
  npm test
  ```

---

## Quick Reference

### Useful Commands

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Install dependencies
npm install

# Start backend server
cd backend && npm run dev

# Start frontend server
cd frontend && npm run dev

# Seed database
cd backend && npm run seed

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

### Important URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **Backend Health:** http://localhost:3000/api/health
- **MongoDB Atlas:** https://cloud.mongodb.com

### Default Login Credentials

| Username | Password |
|----------|----------|
| waiter | waiter123 |
| kitchen | kitchen123 |
| cashier | cashier123 |
| manager | manager123 |

---

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the main README.md** for architecture details
2. **Check browser console** (F12 → Console tab) for errors
3. **Check terminal output** for error messages
4. **Review MongoDB Atlas** connection status
5. **Verify both servers are running** (backend + frontend)

---

**Congratulations!** You've successfully set up the Restaurant POS system. 🎉

For production deployment, security considerations, and advanced features, refer to the main `README.md` file.
