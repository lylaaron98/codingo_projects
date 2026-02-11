# Restaurant POS Backend - Express Server

This backend has been converted from Vercel serverless functions to a standalone Express.js server. This provides more flexibility for deployment and easier local development.

## Changes from Vercel

### What Changed:
- **Vercel serverless functions** → **Express.js API routes**
- **VercelRequest/VercelResponse** → **Express req/res**
- **Individual API files** → **Organized route handlers**
- **Automatic deployment** → **Manual deployment to any host**

### Benefits:
✅ Works without Vercel
✅ Easier local development with hot reload
✅ Can deploy to any hosting service (Heroku, Railway, DigitalOcean, AWS, etc.)
✅ Traditional server architecture
✅ Better for WebSocket support (future)
✅ More control over middleware and configuration

## Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- `.env` file configured (see below)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (parent of `backend` folder):

```env
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-pos

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

### 3. Seed the Database

Create default users (waiter, kitchen, cashier, manager):

```bash
npm run seed
```

## Running the Server

### Development Mode (with hot reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/seed` - Seed default users

### Users (Manager only)
- `GET /api/users` - Get all users
- `POST /api/users/create` - Create new user

### Tables
- `GET /api/tables` - Get all tables

### Menu
- `GET /api/menu/items` - Get menu items
- `POST /api/menu/items` - Create menu item (Manager)
- `PATCH /api/menu/items/:id` - Update menu item (Manager)
- `DELETE /api/menu/items/:id` - Delete menu item (Manager)

### Sessions
- `POST /api/sessions/open` - Open table session
- `GET /api/sessions/:id/bill` - Get bill
- `POST /api/sessions/:id/orders` - Create order
- `POST /api/sessions/:id/pay` - Process payment
- `POST /api/sessions/:id/close` - Close session

### Orders
- `GET /api/orders/kitchen` - Get kitchen orders
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `GET /api/payments/history` - Get payment history

### Reports
- `GET /api/reports/daily` - Get daily report
- `GET /api/reports/top-items` - Get top selling items

## Project Structure

```
backend/
├── server.js              # Express server entry point
├── routes/               # API route handlers
│   ├── auth.js
│   ├── users.js
│   ├── tables.js
│   ├── menu.js
│   ├── sessions.js
│   ├── orders.js
│   ├── payments.js
│   └── reports.js
├── middleware/
│   └── auth-express.js   # Authentication middleware
├── lib/
│   ├── db.ts             # Database connection
│   └── responses-express.js  # Response helpers
├── models/               # Mongoose models (.ts files)
├── validators/           # Zod validation schemas (.ts files)
└── package.json
```

## Deployment Options

### 1. Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### 2. Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongo-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

### 3. DigitalOcean App Platform
- Connect your GitHub repo
- Set environment variables in the dashboard
- Deploy automatically on push

### 4. Traditional VPS (Ubuntu/Debian)
```bash
# Install Node.js and MongoDB
# Clone your repo
# Install PM2: npm install -g pm2
# Start: pm2 start backend/server.js --name restaurant-pos
# Setup nginx reverse proxy
```

## Frontend Configuration

Update your frontend's `.env` file to point to your backend:

```env
VITE_API_URL=http://localhost:3000/api
# Or in production:
# VITE_API_URL=https://your-domain.com/api
```

## Development Workflow

1. **Backend**: `cd backend && npm run dev`
2. **Frontend**: `cd frontend && npm run dev` (in another terminal)
3. Both will hot-reload on changes

## Testing

```bash
npm test          # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

## Troubleshooting

### "Cannot find module" errors
Make sure .js extensions are used in imports and models/validators are accessible.

### CORS errors
The server allows all origins by default. For production, update CORS settings in `server.js`.

### Database connection fails
- Check your MONGODB_URI
- Ensure MongoDB is running
- For Atlas, check IP whitelist

### Port already in use
Change PORT in `.env` or stop the process using port 3000.

## Migration Notes

If you were using Vercel:
1. The API routes remain the same (`/api/*`)
2. No frontend changes needed (update VITE_API_URL only)
3. Old Vercel deployment can be deleted
4. Run `npm run seed` on the new server to create users

## Need Help?

Check the logs when running `npm run dev` for detailed error messages.
