import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import contentRoutes from './routes/content.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [];
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for easy demo deployment
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GENRAGE Fashion API', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`⚡ GENRAGE Backend API running on port ${PORT}`);
});
