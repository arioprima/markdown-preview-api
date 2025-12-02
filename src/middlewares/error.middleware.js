import { env } from "../config/env.js";

/**
 * ===========================================
 * ERROR HANDLER MIDDLEWARE
 * ===========================================
 * Global error handler untuk Express.
 * Semua error yang di-throw atau di-next(error) akan ditangkap di sini.
 */

export const errorHandler = (err, req, res, next) => {
    // Log error (di production bisa pakai logging service)
    if (env.isDevelopment) {
        console.error("❌ Error:", err);
    }

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Prisma errors
    if (err.code === "P2002") {
        statusCode = 400;
        message = "Data sudah ada (duplicate)";
    }

    if (err.code === "P2025") {
        statusCode = 404;
        message = "Data tidak ditemukan";
    }

    // Validation errors (jika pakai library seperti Joi/Zod)
    if (err.name === "ValidationError") {
        statusCode = 400;
    }

    // Response
    res.status(statusCode).json({
        success: false,
        message,
        ...(env.isDevelopment && { stack: err.stack })
    });
};

/**
 * Not Found Handler
 * Untuk route yang tidak ditemukan
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
    });
};
