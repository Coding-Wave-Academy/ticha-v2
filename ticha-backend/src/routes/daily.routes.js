import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getTodayTasks,
  completeTask,
  generateAITasks,
  getDailyTip,
} from "../controllers/daily.controller.js";

const router = express.Router();

router.get("/today", protect, getTodayTasks);
router.get("/tip", protect, getDailyTip);
router.post("/generate-ai", protect, generateAITasks);
router.post("/:taskId/complete", protect, completeTask);

export default router;
