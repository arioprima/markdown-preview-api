import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.put("/change-password", authenticate, authController.changePassword);
router.delete("/account", authenticate, authController.deleteAccount);

export default router;
