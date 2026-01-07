import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy initialization of AI clients to ensure process.env is populated
let geminiGenAI;
const getGemini = () => {
  if (!geminiGenAI) {
    geminiGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");
  }
  return geminiGenAI;
};

let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });
  }
  return openai;
};

const createClient = (baseUrl, apiKey) =>
  new OpenAI({ baseURL: baseUrl, apiKey: apiKey || "dummy" });

const getDeepseek = () =>
  createClient("https://api.deepseek.com/v1", process.env.DEEPSEEK_API_KEY);

const getGrok = () =>
  createClient("https://api.x.ai/v1", process.env.GROK_API_KEY);

const getOpenRouter = () =>
  createClient("https://openrouter.ai/api/v1", process.env.OPENROUTER_API_KEY);

const SYSTEM_INSTRUCTION_SUFFIX =
  "\nIMPORTANT: Let's make this response POP! 💥 \n1. **BOLD** everything important: key terms, concepts, and big ideas.\n2. Use ### HEADERS to break your info into bite-sized chunks.\n3. Use Bullet points (use emojis naturally, e.g., 🚀, 💡, ✅) for lists.\n4. Use `code blocks` for formulas, definitions, or tech terms.\n5. Keep it snappy! Short paragraphs and lots of white space.\n6. No big walls of text—only clean, catchy, and fun vibes.\nREASONING: Briefly show your 'Think-Through' process so I can see your genius level logic!";

/**
 * Safely parse JSON from LLM response, handling markdown blocks and extra text.
 */
export const safeJSONParse = (text) => {
  if (!text) return null;
  try {
    // 1. Try to extract JSON from markdown code blocks
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/```\n([\s\S]*?)\n```/);

    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

    // 2. Try to find the first '{' or '[' and last '}' or ']'
    const firstBrace = jsonString.indexOf("{");
    const firstBracket = jsonString.indexOf("[");
    let start = -1;
    let end = -1;

    if (
      firstBrace !== -1 &&
      (firstBracket === -1 || firstBrace < firstBracket)
    ) {
      start = firstBrace;
      end = jsonString.lastIndexOf("}");
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = jsonString.lastIndexOf("]");
    }

    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(jsonString.substring(start, end + 1));
    }

    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON from LLM response:", e.message);
    return null;
  }
};

// Provider Configurations
const providers = [
  {
    name: "openrouter",
    run: async (system, user) =>
      callOpenAICompatible(
        getOpenRouter(),
        "google/gemini-2.0-flash-exp:free",
        system,
        user
      ),
    runVision: async (system, user, base64) =>
      callOpenAIVision(
        getOpenRouter(),
        "google/gemini-2.0-flash-exp:free",
        system,
        user,
        base64
      ),
  },
  {
    name: "gemini",
    run: async (system, user) => {
      const model = getGemini().getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const isJSON = system.includes("JSON") || user.includes("JSON");
      const suffix = isJSON ? "" : SYSTEM_INSTRUCTION_SUFFIX;
      const truncatedUser = (user || "").substring(0, 15000);
      const prompt = `${system} ${suffix}\n\nUser Question: ${truncatedUser}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    runVision: async (system, user, base64) => {
      const model = getGemini().getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const isJSON =
        system.includes("JSON") ||
        user.includes("JSON") ||
        system.includes("OCR") ||
        user.includes("OCR");
      const suffix = isJSON ? "" : SYSTEM_INSTRUCTION_SUFFIX;
      const prompt = `${system} ${suffix}\n\n${user}`;
      const imagePart = {
        inlineData: {
          data: base64,
          mimeType: "image/jpeg",
        },
      };
      const result = await model.generateContent([prompt, imagePart]);
      return result.response.text();
    },
  },
  {
    name: "openai",
    run: async (system, user) =>
      callOpenAICompatible(getOpenAI(), "gpt-4o-mini", system, user),
    runVision: async (system, user, base64) =>
      callOpenAIVision(getOpenAI(), "gpt-4o-mini", system, user, base64),
  },
  {
    name: "deepseek",
    run: async (system, user) =>
      callOpenAICompatible(getDeepseek(), "deepseek-chat", system, user),
    runVision: null,
  },
  {
    name: "grok",
    run: async (system, user) =>
      callOpenAICompatible(getGrok(), "grok-2-1212", system, user),
    runVision: async (system, user, base64) =>
      callOpenAIVision(getGrok(), "grok-2-vision-1212", system, user, base64),
  },
];

async function callOpenAICompatible(client, model, system, user) {
  const isJSON = system.includes("JSON") || user.includes("JSON");
  const suffix = isJSON ? "" : SYSTEM_INSTRUCTION_SUFFIX;

  // Truncate user prompt to 12k chars to fit in context for mini models
  const truncatedUser = (user || "").substring(0, 12000);

  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: system + suffix },
      { role: "user", content: truncatedUser },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });
  return response.choices[0].message.content;
}

async function callOpenAIVision(client, model, system, user, imageBase64) {
  const isJSON =
    system.includes("JSON") ||
    user.includes("JSON") ||
    system.includes("OCR") ||
    user.includes("OCR");
  const suffix = isJSON ? "" : SYSTEM_INSTRUCTION_SUFFIX;

  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: system + suffix },
      {
        role: "user",
        content: [
          { type: "text", text: user },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 2000,
  });
  return response.choices[0].message.content;
}

export const callLLM = async ({
  systemPrompt,
  userPrompt,
  preferredProvider,
}) => {
  const errors = [];

  // Sort providers: preferred first, then OpenRouter (as it has free models)
  const sortedProviders = [...providers];
  if (preferredProvider) {
    const idx = sortedProviders.findIndex((p) => p.name === preferredProvider);
    if (idx > -1) {
      const p = sortedProviders.splice(idx, 1)[0];
      sortedProviders.unshift(p);
    }
  } else {
    // Default priority: openrouter (free models) first to handle blocked keys
    const orIdx = sortedProviders.findIndex((p) => p.name === "openrouter");
    if (orIdx > -1) {
      const p = sortedProviders.splice(orIdx, 1)[0];
      sortedProviders.unshift(p);
    }
  }

  for (const provider of sortedProviders) {
    try {
      // Check for available API keys
      if (provider.name === "gemini" && !process.env.GEMINI_API_KEY) continue;
      if (provider.name === "openrouter" && !process.env.OPENROUTER_API_KEY)
        continue;
      if (provider.name === "openai" && !process.env.OPENAI_API_KEY) continue;
      if (provider.name === "deepseek" && !process.env.DEEPSEEK_API_KEY)
        continue;
      if (provider.name === "grok" && !process.env.GROK_API_KEY) continue;

      return await provider.run(systemPrompt, userPrompt);
    } catch (err) {
      console.warn(`Provider ${provider.name} failed:`, err.message);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  // If all failed, throw
  console.error("All providers failed:", errors);
  throw new Error(`AI Service Unavailable. Details: ${errors.join("; ")}`);
};

export const callVisionLLM = async ({
  systemPrompt,
  userPrompt,
  imageBase64,
  preferredProvider,
}) => {
  const errors = [];

  const sortedProviders = [...providers];
  if (preferredProvider) {
    const idx = sortedProviders.findIndex((p) => p.name === preferredProvider);
    if (idx > -1) {
      const p = sortedProviders.splice(idx, 1)[0];
      sortedProviders.unshift(p);
    }
  } else {
    // Default priority: openrouter first
    const orIdx = sortedProviders.findIndex((p) => p.name === "openrouter");
    if (orIdx > -1) {
      const p = sortedProviders.splice(orIdx, 1)[0];
      sortedProviders.unshift(p);
    }
  }

  for (const provider of sortedProviders) {
    if (!provider.runVision) continue;

    try {
      if (provider.name === "openrouter" && !process.env.OPENROUTER_API_KEY)
        continue;
      if (provider.name === "gemini" && !process.env.GEMINI_API_KEY) continue;
      if (provider.name === "openai" && !process.env.OPENAI_API_KEY) continue;
      if (provider.name === "grok" && !process.env.GROK_API_KEY) continue;

      return await provider.runVision(systemPrompt, userPrompt, imageBase64);
    } catch (err) {
      console.warn(`Vision Provider ${provider.name} failed:`, err.message);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  throw new Error(
    `Vision AI Service Unavailable. Details: ${errors.join("; ")}`
  );
};
