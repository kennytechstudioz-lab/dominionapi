"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const socket_1 = require("./utils/socket");
const db_1 = require("./config/db");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const planRoutes_1 = __importDefault(require("./routes/planRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const currencyRoutes_1 = __importDefault(require("./routes/currencyRoutes"));
const settingRoutes_1 = __importDefault(require("./routes/settingRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const adminNotificationTemplateRoutes_1 = __importDefault(require("./routes/adminNotificationTemplateRoutes"));
const adminEmailTemplateRoutes_1 = __importDefault(require("./routes/adminEmailTemplateRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const faqRoutes_1 = __importDefault(require("./routes/faqRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const termRoutes_1 = __importDefault(require("./routes/termRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const scheduler_1 = require("./utils/scheduler");
// Load configuration variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5002;
// Set up server middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// Ensure local uploads folder exists on startup
const uploadDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express_1.default.static(uploadDir));
// Premium request logger middleware (Registered first to capture all paths)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
    next();
});
// Register API Routes
app.use("/api/users", userRoutes_1.default);
app.use("/api/plans", planRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
app.use("/api/currencies", currencyRoutes_1.default);
app.use("/api/settings", settingRoutes_1.default);
app.use("/api/reviews", reviewRoutes_1.default);
app.use("/api/admin/notification-templates", adminNotificationTemplateRoutes_1.default);
app.use("/api/admin/email-templates", adminEmailTemplateRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/staff", staffRoutes_1.default);
app.use("/api/faqs", faqRoutes_1.default);
app.use("/api/blogs", blogRoutes_1.default);
app.use("/api/terms", termRoutes_1.default);
app.use("/api/contact", contactRoutes_1.default);
// Database connection initialization
(0, db_1.connectDatabase)();
// API Health Check Endpoint
app.get("/api/health", (req, res) => {
    const dbState = mongoose_1.default.connection.readyState;
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
app.use((err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
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
const server = (0, http_1.createServer)(app);
// Initialize Socket.io Singleton
(0, socket_1.initSocket)(server);
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
    (0, scheduler_1.startActiveDepositScheduler)();
});
