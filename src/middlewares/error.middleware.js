import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
    if (env.isDevelopment) {
        console.error("❌ Error:", err);
    }

    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = "Invalid JSON format. Pastikan JSON body valid dan karakter special sudah di-escape dengan benar.";
    }

    if (err.code === "P2002") {
        statusCode = 400;
        message = "Data sudah ada (duplicate)";
    }

    if (err.code === "P2025") {
        statusCode = 404;
        message = "Data tidak ditemukan";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(env.isDevelopment && { stack: err.stack })
    });
};

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
    });
};
