import { Router } from "express";
import authRoutes from "./auth.routes.js";
import markdownRoutes from "./markdown.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/files", markdownRoutes);

export default router;
