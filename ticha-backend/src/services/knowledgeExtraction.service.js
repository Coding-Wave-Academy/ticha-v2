import { callLLM, safeJSONParse } from "./aiProvider.service.js";
import { SYSTEM_PROMPT } from "../prompts/system.prompt.js";

export const extractKnowledgeUnits = async (material) => {
  const userPrompt = `
Subject: ${material.subject}

From the notes below, extract structured knowledge units.

For each unit return:
- concept_title
- short explanation
- common misconceptions (Cameroon exam context)
- simple example
- difficulty (1–5)

Return strictly as JSON array.

Notes:
${material.raw_text}
`;

  const response = await callLLM({
    systemPrompt: SYSTEM_PROMPT + " (IMPORTANT: Return ONLY valid JSON)",
    userPrompt,
    preferredProvider: "grok",
  });

  const parsed = safeJSONParse(response);
  if (!parsed) {
    throw new Error("Failed to parse knowledge units from AI response");
  }
  return parsed;
};
