"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const errorHandler_1 = require("./middlewares/errorHandler");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const searchRoutes_1 = __importDefault(require("./routes/searchRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const cutoffRoutes_1 = __importDefault(require("./routes/cutoffRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '4000');
// ─── Ensure uploads directory exists ─────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ─── Middleware ───────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Render health checks)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(path_1.default.resolve(uploadDir)));
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/students', studentRoutes_1.default);
app.use('/api/search', searchRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/cutoff', cutoffRoutes_1.default);
app.use('/api/documents', documentRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
// ─── 404 Handler ─────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// ─── Global Error Handler ────────────────────────────
app.use(errorHandler_1.errorHandler);
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
exports.default = app;
//# sourceMappingURL=app.js.map