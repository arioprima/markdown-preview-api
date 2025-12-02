import { Router } from "express";
import authRoutes from "./auth.routes.js";
import markdownRoutes from "./markdown.routes.js";

const router = Router();

/**
 * ===========================================
 * MAIN ROUTER
 * ===========================================
 * Menggabungkan semua routes.
 * 
 * /api/auth/*  - Authentication routes
 * /api/files/* - Markdown files routes
 */

router.use("/auth", authRoutes);
router.use("/files", markdownRoutes);

export default router;
