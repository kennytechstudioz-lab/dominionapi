import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
import { initSocket } from "./utils/socket";
import { connectDatabase } from "./config/db";
import userRoutes from "./routes/userRoutes";
import planRoutes from "./routes/planRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import currencyRoutes from "./routes/currencyRoutes";
import settingRoutes from "./routes/settingRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import adminNotificationTemplateRoutes from "./routes/adminNotificationTemplateRoutes";
import adminEmailTemplateRoutes from "./routes/adminEmailTemplateRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import staffRoutes from "./routes/staffRoutes";
import faqRoutes from "./routes/faqRoutes";
import blogRoutes from "./routes/blogRoutes";
import termRoutes from "./routes/termRoutes";
import contactRoutes from "./routes/contactRoutes";
import { startActiveDepositScheduler } from "./utils/scheduler";


// Load configuration variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Set up server middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure local uploads folder exists on startup
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Premium request logger middleware (Registered first to capture all paths)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Register API Routes
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/notification-templates", adminNotificationTemplateRoutes);
app.use("/api/admin/email-templates", adminEmailTemplateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/contact", contactRoutes);

// Database connection initialization
connectDatabase();

// API Health Check Endpoint
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatusStr = "unknown";
  
  switch (dbState) {
    case 0:
      dbStatusStr = "disconnected";
      break;
    case 1:
      dbStatusStr = "connected";
      break;
    case 2:
      dbStatusStr = "connecting";
      break;
    case 3:
      dbStatusStr = "disconnecting";
      break;
  }

  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    database: {
      state: dbState,
      status: dbStatusStr,
    },
    timestamp: new Date().toISOString(),
  });
});

// Global Express Error-handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "Uploaded file is too large. Maximum allowed size is 50MB.",
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.type === "entity.too.large" || err.status === 413) {
    return res.status(413).json({
      success: false,
      error: "Payload request is too large. Maximum allowed size is 50MB.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "An unexpected server error occurred.",
  });
});

// Create standard Node HTTP Server
const server = createServer(app);

// Initialize Socket.io Singleton
initSocket(server);

// App Listener
server.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` Dominion Group Ltd Backend API initialized!`);
  console.log(` Status: ACTIVE`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: development`);
  console.log(` Health Gateway: http://localhost:${PORT}/api/health`);
  console.log(`========================================`);
  
  // Start the Active Deposit scheduler after database and server are live
  startActiveDepositScheduler();


});
