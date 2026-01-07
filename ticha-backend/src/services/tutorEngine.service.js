import supabase from "../config/supabase.js";
import { callLLM, safeJSONParse } from "./aiProvider.service.js";
import { TICHA_SYSTEM_PROMPT } from "../prompts/ticha.system.prompt.js";

export const generateTutorResponse = async (
  message,
  context,
  sessionId = null
) => {
  try {
    // 1. Load recent conversation (with safety check)
    let history = [];
    try {
      let query = supabase
        .from("tutor_conversations")
        .select("role, content")
        .eq("user_id", context.userId);

      if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        // Fallback or general messages if no session
        query = query.is("session_id", null);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        history = data;
      }
    } catch (dbErr) {
      console.warn("Could not load conversation history:", dbErr.message);
    }

    // 2. Build SYSTEM PROMPT (non-negotiable rules)
    const systemPrompt = `
${TICHA_SYSTEM_PROMPT}

STUDENT CONTEXT:
- Name: ${context.name}
- Level: ${context.level}
- Weak topics: ${context.weakestTopics.join(", ")}
- Recent mistakes: ${context.recentMistakes.join(", ")}
- Language: ${context.language}

STRICT TEACHING RULES:
1. ADDRESS THE STUDENT BY NAME: Frequently use the student's name (${
      context.name
    }) to build rapport.
2. THINK STRAIGHT-FORWARD: Analyze logic efficiently.
3. BE CONCISE: Use minimal words for maximum impact.
4. Don't just give answers; guide with a single, sharp question if the student is stuck.
5. Correct thinking with logic, not just definitions.
`;

    // 3. Build conversation context
    let conversationContext = "";
    if (history && history.length > 0) {
      // Create a copy to reverse so we don't mutate the original
      const sortedHistory = [...history].reverse();
      conversationContext =
        "\n\nRecent conversation:\n" +
        sortedHistory
          .map(
            (h) => `${h.role === "student" ? "Student" : "Tutor"}: ${h.content}`
          )
          .join("\n");
    }

    // 4. Prepare user prompt
    const userPrompt = `${conversationContext}

Student's current question: "${message}"

Respond as TICHA AI tutor.`;

    // 5. Call AI
    const aiResponse = await callLLM({
      systemPrompt,
      userPrompt,
    });

    // 6. Parse response (try JSON first, fallback to plain text)
    const parsed = safeJSONParse(aiResponse);

    let responseData;
    if (parsed && parsed.message) {
      responseData = parsed;
    } else {
      // Fallback: treat whole response as message
      responseData = {
        type: "guide",
        message: aiResponse,
      };
    }

    // 7. Save conversation (with safety check)
    try {
      await supabase.from("tutor_conversations").insert([
        {
          user_id: context.userId,
          role: "student",
          content: message,
          session_id: sessionId,
        },
        {
          user_id: context.userId,
          role: "tutor",
          content: responseData.message,
          session_id: sessionId,
        },
      ]);
    } catch (saveErr) {
      console.warn("Could not save conversation:", saveErr.message);
    }

    // 8. Return response in expected format
    return {
      reply: responseData.message,
      type: responseData.type || "guide",
      follow_up: responseData.follow_up,
    };
  } catch (error) {
    console.error("Tutor engine error:", error);
    throw new Error(`Tutor engine failed: ${error.message}`);
  }
};
