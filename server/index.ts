import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import nutritionRoutes from './routes/nutrition.ts';
import surplusRoutes from './routes/surplus.ts';
import matchingRoutes from './routes/matching.ts';
import routesRoutes from './routes/routes.ts';
import deliveryRoutes from './routes/delivery.ts';
import impactRoutes from './routes/impact.ts';
import entityRoutes from './routes/entities.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logging in development
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health Checks
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'Sociothon Unified Nutrition & Food Redistribution Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Unified Core API',
    modules: ['nutrition_intelligence', 'food_surplus', 'nutrition_matching', 'route_optimization', 'delivery_tracking', 'impact_dashboard'],
    timestamp: new Date().toISOString()
  });
});

// Mount API Routers
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/surplus', surplusRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/hubs', routesRoutes);
app.use('/api/simulation', routesRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api', entityRoutes);

// ReRoute legacy compatibility aliases
app.post('/api/routes/optimize', (req, res, next) => {
  routesRoutes(req, res, next);
});

// Static assets in production
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// 404 Handler for API
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

// Central Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

export function startServer(port: number | string = PORT) {
  return app.listen(port, () => {
    console.log(`================================================================`);
    console.log(` Sociothon Unified Nutrition & Food Redistribution Platform`);
    console.log(` Running at http://localhost:${port}`);
    console.log(` API Health: http://localhost:${port}/api/health`);
    console.log(`================================================================`);
  });
}

// Auto-start when executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer(PORT);
}

export default app;
