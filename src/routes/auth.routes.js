import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * ===========================================
 * AUTH ROUTES
 * ===========================================
 * 
 * Public routes (tanpa auth):
 * POST /api/auth/register - Register user baru
 * POST /api/auth/login    - Login user
 * 
 * Protected routes (perlu auth):
 * GET    /api/auth/profile         - Get current user profile
 * PUT    /api/auth/profile         - Update profile
 * PUT    /api/auth/change-password - Change password
 * DELETE /api/auth/account         - Delete account
 */

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.delete("/account", authenticate, authController.deleteAccount);

export default router;
