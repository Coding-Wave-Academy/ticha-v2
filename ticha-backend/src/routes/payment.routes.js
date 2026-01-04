import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { collectPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/collect", protect, collectPayment);

export default router;
