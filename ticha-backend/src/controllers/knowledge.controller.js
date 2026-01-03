import supabase from "../config/supabase.js";
import { callLLM } from "../services/aiProvider.service.js";

export const getKnowledgeUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("knowledge_units")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) return res.status(404).json({ error: "Knowledge unit not found" });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const generateUnitExplanation = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: unit } = await supabase
      .from("knowledge_units")
      .select("*")
      .eq("id", id)
      .single();

    if (!unit) {
      return res.status(404).json({ error: "Knowledge unit not found" });
    }

    // Get user context for personalized explanation
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", req.user.userId)
      .single();

    const userPrompt = `
Generate a clear, engaging explanation for a student at level: ${profile?.level || "intermediate"}.

Topic: ${unit.concept_title}
Current explanation: ${unit.explanation || ""}
Difficulty level: ${unit.difficulty || "medium"}

Provide:
1. A simple, clear explanation (2-3 sentences)
2. A real-world example or analogy
3. One key takeaway

Format as JSON with keys: explanation, example, keyTakeaway
`;

    const response = await callLLM({
      systemPrompt: "You are an expert educator who creates clear, concise explanations for students.",
      userPrompt
    });

    // Try to parse JSON response, fallback to plain text
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = { explanation: response, example: "", keyTakeaway: "" };
    }

    res.json(parsed);
  } catch (err) {
    console.error("Error generating explanation:", err);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
};
