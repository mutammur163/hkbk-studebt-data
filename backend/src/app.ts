import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import searchRoutes from './routes/searchRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import cutoffRoutes from './routes/cutoffRoutes';
import documentRoutes from './routes/documentRoutes';
import reportRoutes from './routes/reportRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

// ─── Ensure uploads directory exists ─────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Middleware ───────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(uploadDir)));

// ─── Request logging (dev) ───────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} │ ${req.method} ${req.path}`);
    next();
  });
}

// ─── Health check ────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'HKBKCE Admission Intelligence API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cutoff', cutoffRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler ────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  HKBKCE Admission Intelligence API Server    ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log(`║  🚀  Running on http://localhost:${PORT}         ║`);
  console.log(`║  📋  Environment: ${(process.env.NODE_ENV || 'development').padEnd(25)}║`);
  console.log('║  🔗  Health: /health                         ║');
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
});

export default app;
