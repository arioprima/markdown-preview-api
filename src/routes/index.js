import { Router } from "express";
import authRoutes from "./auth.routes.js";
import markdownRoutes from "./markdown.routes.js";
import groupRoutes from "./group.routes.js";
import sharedRoutes from "./shared.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/files", markdownRoutes);
router.use("/groups", groupRoutes);
router.use("/shared", sharedRoutes);

export default router;
