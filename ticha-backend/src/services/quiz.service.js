import { callLLM, safeJSONParse } from "./aiProvider.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";

export const generateQuizQuestion = async (knowledgeUnit) => {
  const userPrompt = `
Create one exam-style multiple choice question from the concept below.

Concept:
${knowledgeUnit.concept_title}

Explanation:
${knowledgeUnit.explanation || knowledgeUnit.summary}

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
    systemPrompt: SYSTEM_PROMPT + " (IMPORTANT: Return ONLY valid JSON)",
    userPrompt,
  });

  const parsed = safeJSONParse(response);
  if (!parsed) {
    throw new Error("Failed to parse quiz question from AI response");
  }
  return parsed;
};

export const generateFullQuiz = async (material) => {
  const userPrompt = `
Generate a comprehensive digital quiz from the study material below.
Include 5-7 questions of varying types:
- Multiple Choice (MCQ) - type: "mcq"
- Short Answer (single word or phrase) - type: "short"
- Long Answer (explain a concept) - type: "long"

Material Title: ${material.title}
Content: ${material.raw_text}

Rules:
- Questions must be clear and test deep understanding.
- For mcq, include "options" (array) and "correct_answer".
- For short/long, include "ideal_answer".
- For all, include a "feedback_context" (helpful tips for this topic).
- Return strictly as a JSON object with a "questions" array.

Format:
{
  "title": "...",
  "questions": [
    {
      "type": "mcq",
      "question": "...",
      "options": ["...", "..."],
      "correct_answer": "...",
      "feedback_context": "..."
    },
    ...
  ]
}
`;

  const response = await callLLM({
    systemPrompt:
      "You are TICHA AI, a compassionate and expert tutor. Goal: active recall and mastery. (IMPORTANT: Return ONLY valid JSON)",
    userPrompt,
    preferredProvider: "gemini",
  });

  const parsed = safeJSONParse(response);
  if (!parsed || !parsed.questions) {
    throw new Error("Failed to generate a valid quiz structure.");
  }
  return parsed;
};

export const gradeQuizResponse = async (question, studentAnswer) => {
  const userPrompt = `
Question: ${question.question}
Expected/Ideal Answer: ${question.correct_answer || question.ideal_answer}
Student Answer: ${studentAnswer}

Grade this response. 
- For MCQ/Short: strict or near-strict match.
- For Long: verify key concepts are mentioned.

Return JSON ONLY:
{ "isCorrect": true/false, "score": 0-100, "feedback": "Compassionate, encouraging feedback..." }
`;

  const response = await callLLM({
    systemPrompt:
      "You are a kind teacher. Start with what they got right, then help them improve.",
    userPrompt,
  });

  return safeJSONParse(response);
};

export const generateFinalFeedback = async (results) => {
  const userPrompt = `
Review this student's quiz performance:
${JSON.stringify(results)}

Provide a compassionate mentor-style feedback.
Return JSON ONLY:
{
  "summary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "masteryLevel": "e.g. Apprentice / Master",
  "improvementTips": ["...", "..."]
}
`;

  const response = await callLLM({
    systemPrompt:
      "You are TICHA, the student's personal AI mentor. Be encouraging and specific.",
    userPrompt,
  });

  return safeJSONParse(response);
};
