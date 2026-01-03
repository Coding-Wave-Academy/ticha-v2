import { callLLM } from "../services/aiProvider.service.js";
import { TICHA_SYSTEM_PROMPT } from "../prompts/ticha.system.prompt.js";
import {
  buildAIContext,
  buildTutorContext,
} from "../services/aiContext.service.js";
import { generateTutorResponse } from "../services/tutorEngine.service.js";
import {
  getSessions,
  createSession as createNewSession,
  getSessionMessages,
} from "../services/chatSession.service.js";

import supabase from "../config/supabase.js";

export const listSessions = async (req, res) => {
  try {
    const sessions = await getSessions(req.user.userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const startNewSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await createNewSession(req.user.userId, title);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await getSessionMessages(sessionId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const tutor = async (req, res) => {
  const { message } = req.body;

  const { data: user } = await supabase
    .from("students")
    .select("*")
    .eq("id", req.user.userId)
    .single();

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", req.user.userId)
    .single();

  const context = buildAIContext(user, profile);

  const userPrompt = `
Student context:
${JSON.stringify(context, null, 2)}

Student says:
"${message}"

Respond as TICHA AI.
`;

  const reply = await callLLM({
    systemPrompt: TICHA_SYSTEM_PROMPT,
    userPrompt,
  });

  res.json({ reply });
};

export const tutorChat = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.userId;

  const context = await buildTutorContext(userId);
  const reply = await generateTutorResponse(message, context);

  res.json({ reply });
};

export async function chatWithTutor(req, res) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Load rich context for tutor
    const context = await buildTutorContext(userId);
    const response = await generateTutorResponse(message, context, sessionId);

    res.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: `Tutor engine failed: ${error.message}` });
  }
}
