import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadMaterial,
  listMaterials,
  processMaterial,
  generateSummary,
  listSummaries,
} from "../controllers/material.controller.js";

import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadMaterial);
router.get("/", protect, listMaterials);
router.post(
  "/summary/generate",
  protect,
  upload.single("file"),
  generateSummary
);

router.post("/:materialId/process", protect, processMaterial);
router.get("/summaries/history", protect, listSummaries);

export default router;
