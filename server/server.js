import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, getDBStatus } from './config/db.js';
import apiRoutes from './routes/index.js';
import { registerSocketHandlers } from './sockets/socketHandler.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import { logger } from './utils/logger.js';
import { assertJwtSecretConfigured } from './config/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust multi-path environment loading: check server/.env then root .env
if (fs.existsSync(path.join(__dirname, '.env'))) {
  dotenv.config({ path: path.join(__dirname, '.env') });
} else if (fs.existsSync(path.join(__dirname, '../.env'))) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
} else {
  dotenv.config();
}

assertJwtSecretConfigured();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL;

// Secure CORS configuration
const allowedOriginsList = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const cleanClientUrl = CLIENT_URL ? CLIENT_URL.replace(/\/$/, '') : null;
if (cleanClientUrl && cleanClientUrl !== '*') {
  allowedOriginsList.push(cleanClientUrl);
}

// Development origins (permitted only when not in production)
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
];

// Scope Vercel preview deploys strictly to this project rather than accepting all *.vercel.app origins
const getVercelProjectRegex = () => {
  const vercelProject =
    process.env.VERCEL_PROJECT_NAME ||
    (cleanClientUrl && cleanClientUrl.match(/^https:\/\/([a-z0-9-]+)\.vercel\.app$/i)?.[1]);
  if (vercelProject) {
    const escaped = vercelProject.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return new RegExp(`^https:\\/\\/${escaped}(-[a-z0-9-]+)?\\.vercel\\.app$`, 'i');
  }
  return null;
};
const vercelPreviewRegex = getVercelProjectRegex();

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // allow same-origin, curl, server-to-server
  const cleanOrigin = origin.replace(/\/$/, '');

  if (allowedOriginsList.includes(cleanOrigin)) return true;
  if (process.env.NODE_ENV !== 'production' && devOrigins.includes(cleanOrigin)) return true;
  if (vercelPreviewRegex && vercelPreviewRegex.test(cleanOrigin)) return true;

  return false;
};

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin not allowed: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach Socket.IO to requests if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health & database status probe
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'ChatSpace',
    database: getDBStatus(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// Socket.IO event registrations
registerSocketHandlers(io);

// Serve built frontend in production (Single-service deployment e.g. on Render)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}


// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      logger.success(`🚀 ChatSpace Server running on http://localhost:${PORT}`);
      logger.info(`📡 Socket.IO initialized and ready for real-time messaging`);
      logger.info(`✨ Demo accounts available: Soham, Rahul, Aman, Priya`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
