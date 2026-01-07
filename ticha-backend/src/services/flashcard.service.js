import { callLLM, safeJSONParse } from "./aiProvider.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import supabase from "../config/supabase.js";

export const generateFlashcards = async (knowledgeUnit) => {
  const userPrompt = `
From the concept below, generate 2–5 high-quality flashcards.

Concept:
${knowledgeUnit.concept_title}

Explanation:
${knowledgeUnit.explanation || knowledgeUnit.summary}

Rules:
- Focus on understanding
- Avoid vague questions
- Return JSON only

Format:
[
  { "question": "...", "answer": "..." }
]
`;

  const response = await callLLM({
    systemPrompt: SYSTEM_PROMPT + " (IMPORTANT: Return ONLY valid JSON)",
    userPrompt,
  });

  const parsed = safeJSONParse(response);
  if (!parsed) {
    throw new Error("Failed to parse flashcards from AI response");
  }
  return parsed;
};

export const saveFlashcards = async (knowledgeUnitId, cards) => {
  const formatted = cards.map((c) => ({
    knowledge_unit_id: knowledgeUnitId,
    question: c.question,
    answer: c.answer,
  }));

  const { error } = await supabase.from("flashcards").insert(formatted);

  if (error) throw error;
};
