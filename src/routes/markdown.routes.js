import { Router } from "express";
import express from "express";
import * as markdownController from "../controllers/markdown.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware untuk raw text body
const rawTextParser = express.text({ type: '*/*', limit: '10mb' });

/**
 * ===========================================
 * MARKDOWN ROUTES
 * ===========================================
 * 
 * Semua routes butuh authentication.
 * 
 * FILES:
 * GET    /api/files              - Get all files (with pagination & search)
 * GET    /api/files/count        - Get file count
 * GET    /api/files/recent       - Get recent files
 * GET    /api/files/:id          - Get single file
 * POST   /api/files?title=X      - Create new file (raw text body)
 * PUT    /api/files/:id?title=X  - Update file (raw text body, title optional)
 * DELETE /api/files/:id          - Soft delete file
 * DELETE /api/files              - Bulk soft delete files
 * 
 * TRASH:
 * GET    /api/files/trash        - Get deleted files
 * GET    /api/files/trash/count  - Get deleted file count
 * POST   /api/files/trash/:id/restore    - Restore deleted file
 * POST   /api/files/trash/restore-all    - Restore all deleted files
 * DELETE /api/files/trash/:id    - Permanently delete file
 * DELETE /api/files/trash        - Empty trash
 */

// Semua route butuh auth
router.use(authenticate);

// Trash routes (harus di atas :id agar tidak tertangkap)
router.get("/trash", markdownController.getDeletedFiles);
router.get("/trash/count", markdownController.getDeletedFileCount);
router.post("/trash/restore-all", markdownController.restoreAllFiles);
router.post("/trash/:id/restore", markdownController.restoreFile);
router.delete("/trash/:id", markdownController.permanentDeleteFile);
router.delete("/trash", markdownController.emptyTrash);

// File routes
router.get("/", markdownController.getFiles);
router.get("/count", markdownController.getFileCount);
router.get("/recent", markdownController.getRecentFiles);
router.get("/:id", markdownController.getFileById);

// Create & Update - pakai raw text body (konsisten!)
router.post("/", rawTextParser, markdownController.createFile);
router.put("/:id", rawTextParser, markdownController.updateFile);

router.delete("/:id", markdownController.deleteFile);
router.delete("/", markdownController.bulkDeleteFiles);

export default router;
