import { callLLM } from "./aiProvider.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";

export const generateQuizQuestion = async (knowledgeUnit) => {
  const userPrompt = `
Create one exam-style multiple choice question from the concept below.

Concept:
${knowledgeUnit.concept_title}

Explanation:
${knowledgeUnit.explanation}

Rules:
- One correct answer
- 3 or more plausible distractors
- Each wrong option must target a common misconception
- Return JSON ONLY

Format:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
    "correct_answer": "Option text",
    "explanation_correct": "Explain why this is correct in a helpful, encouraging way.",
    "explanation_wrong": {
      "Option text B": "Explain the specific misconception why this is incorrect.",
      "Option text C": "Explain why this might be a common mistake but is wrong.",
      "Option text D": "Explain the factual error in this choice."
    }
}
Note: The keys in explanation_wrong must EXACTLY match the text in the options array.
`;

  const response = await callLLM({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  });

  return JSON.parse(response);
};
