import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import supabase from "../config/supabase.js";
import { generateQuizQuestion } from "../services/quiz.service.js";
import { getWeakestKnowledgeUnits } from "../services/weaknessMapping.service.js";

const router = express.Router();

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
    res.status(500).json({ error: "Failed to generate practice question" });
  }
});

export default router;
