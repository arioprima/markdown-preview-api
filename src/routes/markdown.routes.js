import { Router } from "express";
import * as markdownController from "../controllers/markdown.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * ===========================================
 * MARKDOWN ROUTES
 * ===========================================
 * 
 * Semua routes butuh authentication.
 * 
 * GET    /api/files        - Get all files (with pagination & search)
 * GET    /api/files/count  - Get file count
 * GET    /api/files/:id    - Get single file
 * POST   /api/files        - Create new file
 * PUT    /api/files/:id    - Update file
 * DELETE /api/files/:id    - Delete file
 */

// Semua route butuh auth
router.use(authenticate);

// Routes
router.get("/", markdownController.getFiles);
router.get("/count", markdownController.getFileCount);
router.get("/:id", markdownController.getFileById);
router.post("/", markdownController.createFile);
router.put("/:id", markdownController.updateFile);
router.delete("/:id", markdownController.deleteFile);

export default router;
