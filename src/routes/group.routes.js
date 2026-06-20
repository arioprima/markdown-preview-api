import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import * as groupController from "../controllers/group.controller.js";

const router = Router();
router.use(authenticate);

router.get("/", groupController.getGroups);
router.post("/", groupController.createGroup);
router.get("/:id", groupController.getGroupById);
router.put("/:id", groupController.updateGroup);
router.delete("/:id", groupController.deleteGroup);

export default router;
