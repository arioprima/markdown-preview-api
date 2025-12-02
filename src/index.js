import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDB, disconnectDB, prisma } from "./config/database.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, message: "Server is healthy" });
    } catch (err) {
        res.status(500).json({ ok: false, message: "Database connection failed" });
    }
});

// API routes
app.use("/api", routes);

// ============================================
// ERROR HANDLERS
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
        console.log(`✅ API running on http://localhost:${env.PORT}`);
        console.log(`📝 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
}
