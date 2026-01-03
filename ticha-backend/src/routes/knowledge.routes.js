import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getKnowledgeUnit, generateUnitExplanation } from "../controllers/knowledge.controller.js";

const router = express.Router();

router.get("/:id", protect, getKnowledgeUnit);
router.post("/:id/explain", protect, generateUnitExplanation);

export default router;