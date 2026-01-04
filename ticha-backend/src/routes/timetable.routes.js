import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { uploadTimetable, getTimetable } from "../controllers/timetable.controller.js";

const router = express.Router();

router.post("/", protect, uploadTimetable);  // Upload Form B / Courses
router.get("/", protect, getTimetable);      // Get personalized timetable

export default router;
