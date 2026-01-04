import { protect } from "../middleware/auth.middleware.js";
import {
  tutorChat,
  chatWithTutor,
  listSessions,
  startNewSession,
  getSessionHistory,
} from "../controllers/ai.controller.js";
import express from "express";

const router = express.Router();

router.get("/sessions", protect, listSessions);
router.post("/sessions", protect, startNewSession);
router.get("/sessions/:sessionId", protect, getSessionHistory);
router.post("/tutor", protect, tutorChat);
router.post("/chat", protect, chatWithTutor);

export default router;
