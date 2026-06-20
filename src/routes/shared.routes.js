import { Router } from "express";
import * as markdownController from "../controllers/markdown.controller.js";

const router = Router();

/**
 * ===========================================
 * SHARED ROUTES (PUBLIK - TANPA AUTH)
 * ===========================================
 * GET /api/shared/:token - Ambil dokumen yang dibagikan via token
 */
router.get("/:token", markdownController.getSharedFile);

export default router;
