import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Security & Utility Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicRoutes from './routes/public.routes.js';
import { socketService } from './services/socket.service.js';

// Middleware to inject IO
app.use((req, res, next) => {
  const io = socketService.getIO();
  if (io) req.app.set('io', io);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
import { ZodError } from 'zod';

app.use((err, req, res, next) => {
  console.error('[Error]:', err.message);
  
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      issues: err.errors
    });
  }

  res.status(err.status || 500).json({ 
    success: false,
    error: err.message || 'Internal Server Error' 
  });
});

export default app;
