import { callLLM } from "./aiProvider.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import supabase from "../config/supabase.js";

export const generateFlashcards = async (knowledgeUnit) => {
  const userPrompt = `
From the concept below, generate 2–5 high-quality flashcards.

Concept:
${knowledgeUnit.concept_title}

Explanation:
${knowledgeUnit.explanation}

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
    systemPrompt: SYSTEM_PROMPT,
    userPrompt
  });

  return JSON.parse(response);
};

export const saveFlashcards = async (knowledgeUnitId, cards) => {
  const formatted = cards.map(c => ({
    knowledge_unit_id: knowledgeUnitId,
    question: c.question,
    answer: c.answer
  }));

  const { error } = await supabase
    .from("flashcards")
    .insert(formatted);

  if (error) throw error;
};
