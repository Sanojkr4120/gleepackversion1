import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import pincodeRoutes from './routes/pincodeRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import passport from 'passport';
import './config/passport.js';

const app = express();
app.set("trust proxy", 1); // Trust first proxy (Vercel Load Balancer)
const httpServer = createServer(app);

// Dynamic CORS - Allow all Vercel domains
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow requests with no origin (mobile apps, Postman)
  
  const allowedList = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000"
  ];
  
  // Check exact matches
  if (allowedList.includes(origin)) return true;
  
  // Allow ALL Vercel preview domains
  if (origin.endsWith('.vercel.app')) return true;
  
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['polling'], // Only use polling for Vercel compatibility
});

import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Security & Performance Middleware
app.use(helmet());
app.use(compression()); // Compress all responses

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// XSS Protection is handled by Helmet via Content-Security-Policy headers

// Prevent Parameter Pollution
app.use(hpp());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Strict Rate Limiting for Auth (Brute Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register attempts per 15 mins
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

// Database Connection is handled in api/index.js for Vercel
// and in the startup block below for local development

// Socket.IO
io.on("connection", (socket) => {
  socket.on("updateEmployeeLocation", (data) => {
    // Broadcast location to all clients (admins/dashboards)
    io.emit("employeeLocationUpdate", data);
  });

  socket.on("disconnect", () => {
    // User disconnected
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/pincodes', pincodeRoutes);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get('*', (req, res) =>
      res.sendFile(path.resolve(frontendPath, 'index.html'))
    );
  } else {
    app.get('/', (req, res) => {
      res.send('API is running....');
    });
  }
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to connect to DB', err);
  });
}

export default app;
