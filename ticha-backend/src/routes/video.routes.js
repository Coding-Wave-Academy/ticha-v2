import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getRecommendations } from "../controllers/video.controller.js";

const router = express.Router();

router.get("/recommendations", protect, getRecommendations);

export default router;
