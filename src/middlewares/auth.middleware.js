import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token not found"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, env.JWT_SECRET);

        req.user = {
            userId: decoded.id
        };

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token invalid"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired"
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
            userId: decoded.id
        };

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
