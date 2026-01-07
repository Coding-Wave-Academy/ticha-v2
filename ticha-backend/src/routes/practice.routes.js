import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import supabase from "../config/supabase.js";
import {
  generateQuizQuestion,
  generateFullQuiz,
  gradeQuizResponse,
  generateFinalFeedback,
} from "../services/quiz.service.js";
import { getWeakestKnowledgeUnits } from "../services/weaknessMapping.service.js";

import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
const pdf = pdfModule.default || pdfModule;
import { callVisionLLM } from "../services/aiProvider.service.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/quiz/generate-from-file",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file was uploaded. Please select a PDF or Image.",
        });
      }

      const userId = req.user.userId;
      let content = "";
      const fileName = req.file.originalname;

      if (req.file.mimetype === "application/pdf") {
        try {
          const dataBuffer = req.file.buffer;
          const pdfData = await pdf(dataBuffer);
          content = pdfData.text;
        } catch (pdfErr) {
          console.error("PDF Parse Error:", pdfErr);
          throw new Error(
            "Failed to read PDF content. It might be corrupt or password protected."
          );
        }
      } else if (req.file.mimetype.startsWith("image/")) {
        try {
          const base64Image = req.file.buffer.toString("base64");
          content = await callVisionLLM({
            systemPrompt:
              "You are an expert OCR assistant. Extract ALL text from this question paper exactly as it appears. Include question numbers and options.",
            userPrompt:
              "Extract the text from this past question image so I can generate a quiz from it.",
            imageBase64: base64Image,
            preferredProvider: "grok",
          });
        } catch (visionErr) {
          console.error("Vision Error:", visionErr);
          throw new Error(
            "Vision AI failed to read your image. Try a clearer photo or a PDF."
          );
        }
      }

      if (!content || content.trim().length < 10) {
        return res
          .status(400)
          .json({
            error:
              "Could not extract enough text from file to generate a quiz.",
          });
      }

      // Truncate to avoid token limits (approx 8k chars)
      const truncatedContent = content.substring(0, 8000);

      // Now generate a quiz from this content
      const quiz = await generateFullQuiz({
        title: fileName,
        raw_text: truncatedContent,
      });
      res.json(quiz);
    } catch (err) {
      console.error("Quiz generation from file error:", err);
      res.status(500).json({
        error: "Failed to process file and generate quiz",
        details: err.message,
      });
    }
  }
);

router.post("/answer", protect, async (req, res) => {
  const { selectedOption, question } = req.body;
  const userId = req.user.userId;

  const isCorrect = selectedOption === question.correct_answer;
  let explanation;

  if (isCorrect) {
    explanation = question.explanation_correct;
  } else {
    explanation =
      question.explanation_wrong[selectedOption] ||
      "That's not quite right. Try again!";
  }

  // Record attempt in database
  try {
    await supabase.from("quiz_attempts").insert({
      user_id: userId,
      knowledge_unit_id: question.unit_id,
      is_correct: isCorrect,
      response_time: 10, // placeholder
      difficulty_level: 2, // placeholder
    });
  } catch (err) {
    console.error("Failed to record attempt:", err);
  }

  res.json({
    correct: isCorrect,
    explanation,
  });
});

router.get("/generate", protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get weakest topics to practice
    const weaknesses = await getWeakestKnowledgeUnits(userId, 3);

    let unit;
    if (weaknesses.length > 0) {
      // Pick a random weakness or the top one
      const unitId =
        weaknesses[Math.floor(Math.random() * weaknesses.length)].id;
      const { data } = await supabase
        .from("knowledge_units")
        .select("*")
        .eq("id", unitId)
        .single();
      unit = data;
    } else {
      // Fallback: pick a random knowledge unit
      const { data } = await supabase
        .from("knowledge_units")
        .select("*")
        .limit(1)
        .single();
      unit = data;
    }

    if (!unit) {
      // Fallback: Use a default unit if none exists in DB
      unit = {
        id: "default-unit",
        concept_title: "General Learning Skills",
        summary:
          "Effective learning involves active recall, spaced repetition, and connecting new information to existing knowledge.",
      };
    }

    const question = await generateQuizQuestion(unit);
    res.json({ ...question, unit_id: unit.id });
  } catch (err) {
    console.error("Practice generation error:", err);
    res.status(500).json({
      error: "Failed to generate practice question",
      details: err.message,
    });
  }
});

// Full Digital Quiz Endpoints
router.get("/quiz/:materialId/generate", protect, async (req, res) => {
  try {
    const { materialId } = req.params;

    // Fetch the material
    const { data: material, error } = await supabase
      .from("learning_materials")
      .select("*")
      .eq("id", materialId)
      .single();

    if (error || !material) {
      return res.status(404).json({ error: "Material not found" });
    }

    const quiz = await generateFullQuiz(material);
    res.json(quiz);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to generate quiz", details: err.message });
  }
});

router.post("/quiz/grade", protect, async (req, res) => {
  try {
    const { question, studentAnswer } = req.body;
    const result = await gradeQuizResponse(question, studentAnswer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Grading failed", details: err.message });
  }
});

router.post("/quiz/feedback", protect, async (req, res) => {
  try {
    const { results } = req.body;
    const feedback = await generateFinalFeedback(results);
    res.json(feedback);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Feedback generation failed", details: err.message });
  }
});

export default router;
