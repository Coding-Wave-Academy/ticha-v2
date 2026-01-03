import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getDashboard, seedDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", protect, getDashboard);
// Dev-only seed route to populate demo data
router.post("/seed", protect, seedDashboard);

export default router;