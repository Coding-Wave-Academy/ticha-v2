import "./config/env.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import materialRoutes from "./routes/material.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import dailyRoutes from "./routes/daily.routes.js";
import knowledgeRoutes from "./routes/knowledge.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import videoRoutes from "./routes/video.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TICHA AI Backend is alive 🧠🔥");
});
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/payments", paymentRoutes);

export default app;
