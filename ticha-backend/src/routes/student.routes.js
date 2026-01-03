import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { updateAvatar } from "../controllers/student.controller.js";

const router = express.Router();

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Authenticated ✔️",
    user: req.user,
  });
});

router.patch("/avatar", protect, updateAvatar);

export default router;
