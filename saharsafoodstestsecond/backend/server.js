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
import path from 'path';
import { fileURLToPath } from 'url';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import areaRoutes from './routes/areaRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import pincodeRoutes from './routes/pincodeRoutes.js'; // Preserving existing functionality
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

const app = express();
const httpServer = createServer(app);

// Use one unified allowedOrigins list
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://saharsafoods.vercel.app",
  // Allow all vercel.app for previews (CORS fix)
  /\.vercel\.app$/
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['polling', 'websocket'] // Added polling support for Vercel
});

// Security & Performance Middleware
app.use(helmet());
app.use(compression()); // Compress all responses

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Check against strings or regex
    const isAllowed = allowedOrigins.some(o => {
      if (o instanceof RegExp) return o.test(origin);
      return o === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));

app.use(express.json());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

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

// Socket.IO
io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);
  
    socket.on("updateEmployeeLocation", (data) => {
      // Broadcast location to all clients (admins/dashboards)
      io.emit("employeeLocationUpdate", data);
    });
  
    socket.on("disconnect", () => {
      // User disconnected
    });
});

// Explicitly handle Socket.IO polling requests for Serverless environment
app.all('/socket.io/*', (req, res) => {
    io.engine.handleRequest(req, res);
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use('/api/pincodes', pincodeRoutes); // Added back your pincode routes

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

if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
  connectDB().then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('Failed to connect to DB', err);
  });
}

export default app;
