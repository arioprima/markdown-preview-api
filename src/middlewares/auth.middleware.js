import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * ===========================================
 * AUTH MIDDLEWARE
 * ===========================================
 * Middleware untuk validasi JWT token.
 * Akan menambahkan req.user = { userId } jika token valid.
 */

export const authenticate = async (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ditemukan"
            });
        }

        const token = authHeader.split(" ")[1];

        // 2. Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // 3. Attach user info ke request
        req.user = {
            userId: decoded.userId
        };

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token tidak valid"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token sudah expired"
            });
        }

        next(error);
    }
};

/**
 * Optional auth - tidak error jika tidak ada token
 * Berguna untuk endpoint yang bisa diakses public tapi punya fitur tambahan jika login
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            req.user = null;
            return next();
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET);

        req.user = {
            userId: decoded.userId
        };

        next();
    } catch (error) {
        // Token invalid, tapi tidak error - anggap saja tidak login
        req.user = null;
        next();
    }
};
