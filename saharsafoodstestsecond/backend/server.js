import "dotenv/config";
import fs from "fs";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

// Routes
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import areaRoutes from "./routes/areaRoutes.js";
import centerRoutes from "./routes/centerRoutes.js";
import pincodeRoutes from "./routes/pincodeRoutes.js";

// Error handler
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Local DB helper
import connectDB from "./config/db.js";

const app = express();
const httpServer = createServer(app);

// Directory helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------ CORS Setup ------------------------------ */
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"
  
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

/* ---------------------------- Security Middlewares ---------------------------- */
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

/* ---------------------------- Rate Limiting ---------------------------- */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

/* -------------------------- Socket.IO Initialization -------------------------- */
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("updateEmployeeLocation", (data) => {
    io.emit("employeeLocationUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Attach io to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ------------------------------- API Routes ------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/areas", areaRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/pincodes", pincodeRoutes);

/* -------------------------- Serve Frontend Build -------------------------- */
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get("*", (req, res) =>
      res.sendFile(path.join(frontendPath, "index.html"))
    );
  } else {
    app.get("/", (req, res) => res.send("API Running..."));
  }
} else {
  app.get("/", (req, res) => res.send("API Running..."));
}

/* -------------------------- Error Handler -------------------------- */
app.use(notFound);
app.use(errorHandler);

/* -------------------------- Start Server -------------------------- */
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  // Local development DB connection
  connectDB()
    .then(() => {
      httpServer.listen(PORT, () =>
        console.log(`Server running on port ${PORT}`)
      );
    })
    .catch((err) => console.error("DB Connection Failed:", err));
}

export default app;
