// Simple development server for API routes
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import and mount API routes
const apiRoutes = {
  // Auth routes
  '/api/auth/login': () => import('./api/auth/login.ts'),
  '/api/auth/logout': () => import('./api/auth/logout.ts'),
  '/api/auth/me': () => import('./api/auth/me.ts'),
  '/api/auth/seed': () => import('./api/auth/seed.ts'),
  
  // Menu routes
  '/api/menu': () => import('./api/menu/index.ts'),
  
  // Table routes
  '/api/tables': () => import('./api/tables/index.ts'),
  
  // Session routes
  '/api/sessions': () => import('./api/sessions/index.ts'),
  
  // Order routes
  '/api/orders': () => import('./api/orders/index.ts'),
  
  // Payment routes
  '/api/payments': () => import('./api/payments/index.ts'),
  
  // Report routes
  '/api/reports/daily': () => import('./api/reports/daily.ts'),
  '/api/reports/popular-items': () => import('./api/reports/popular-items.ts'),
  '/api/reports/revenue': () => import('./api/reports/revenue.ts'),
};

// Register routes
Object.entries(apiRoutes).forEach(([path, importFn]) => {
  app.all(path, async (req, res) => {
    try {
      const module = await importFn();
      const handler = module.default || module;
      
      // Create Vercel-like request object
      const vercelReq = {
        method: req.method,
        body: req.body,
        query: req.query,
        headers: req.headers,
        url: req.url,
      };
      
      // Create Vercel-like response object
      const vercelRes = {
        status: (code) => {
          res.status(code);
          return vercelRes;
        },
        json: (data) => {
          res.json(data);
        },
        send: (data) => {
          res.send(data);
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
        },
      };
      
      await handler(vercelReq, vercelRes);
    } catch (error) {
      console.error(`Error handling ${path}:`, error);
      res.status(500).json({ 
        error: 'Internal Server Error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Development server running on http://localhost:${PORT}`);
  console.log(`\nAvailable routes:`);
  Object.keys(apiRoutes).forEach(route => {
    console.log(`  - ${route}`);
  });
});
