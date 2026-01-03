import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createProfile,
  fetchProfile
} from "../controllers/profile.controller.js";

const router = express.Router();

router.post("/", protect, createProfile);
router.get("/", protect, fetchProfile);

export default router;
