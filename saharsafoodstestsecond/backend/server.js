import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import pincodeRoutes from "./routes/pincodeRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Security & Performance Middleware
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// Database Connection with Optimization
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 100, // Maintain up to 100 socket connections
    serverSelectionTimeoutMs: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMs: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });

// Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/pincodes", pincodeRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

if (process.env.VERCEL !== "1") {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
