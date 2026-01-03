import { TICHA_SYSTEM_PROMPT } from "../prompts/ticha.system.prompt.js";
import { loadSyllabus } from "../utils/syllabusLoader.js";
import { callLLM } from "./aiProvider.service.js";

export async function generateTutorResponse({ message, studentContext }) {
  const syllabus = loadSyllabus(studentContext.level, studentContext.subject);

  const systemPrompt = `${TICHA_SYSTEM_PROMPT}\n\nCURRENT CONTEXT:\nStudent Level: ${
    studentContext.level
  }\nSubject: ${studentContext.subject}\nWeak Areas: ${
    studentContext.weakAreas?.join(", ") || "None"
  }${
    syllabus ? `\nRelevant Syllabus Topics: ${JSON.stringify(syllabus)}` : ""
  }`;

  try {
    const reply = await callLLM({
      systemPrompt: systemPrompt,
      userPrompt: message,
      preferredProvider: "openrouter", // Using openrouter for the free/fast models
    });

    return {
      reply,
      confidenceBoost: "Keep pushing, your progress is showing! 🚀",
    };
  } catch (err) {
    console.error("AI Tutor Error:", err);
    throw new Error(
      "I'm having a quick brain freeze. Try asking again in a moment!"
    );
  }
}
