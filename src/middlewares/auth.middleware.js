import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Cek dari header Authorization ATAU cookie
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      data: decoded,
      userId: decoded.id,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    next(error);
  }
};

/**
 * Optional auth - tidak error jika tidak ada token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Cek dari header Authorization ATAU cookie
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = {
      userId: decoded.id,
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};
