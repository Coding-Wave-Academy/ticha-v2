import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenRouter } from "@openrouter/sdk";

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

let orClient;
const getOpenRouter = () => {
  if (!orClient) {
    orClient = new OpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY || "dummy",
    });
  }
  return orClient;
};

const SYSTEM_INSTRUCTION_SUFFIX =
  "\nIMPORTANT: Your response MUST be highly visual and clear. \n1. Use **Bold** for all key concepts, definitions, and important terms.\n2. Use ### Headers for different sections of your explanation.\n3. Use Bullet points or Numbered lists for sequences or features.\n4. Use `code blocks` for formulas or specific terminology.\n5. Keep paragraphs short and use spacing to make the text 'pop'.\n6. Avoid large walls of plain text.\nREASONING: Before providing the final answer, think step-by-step and show your reasoning process clearly.";

// Provider Configurations
const providers = [
  {
    name: "openrouter",
    run: async (system, user) => {
      const response = await getOpenRouter().chat.send({
        model: "xiaomi/mimo-v2-flash:free",
        messages: [
          { role: "system", content: system + SYSTEM_INSTRUCTION_SUFFIX },
          { role: "user", content: user },
        ],
        temperature: 0.3,
      });
      return response.choices[0].message.content;
    },
    runVision: async (system, user, base64) => {
      const response = await getOpenRouter().chat.send({
        model: "google/gemma-3-27b-it:free",
        messages: [
          { role: "system", content: system + SYSTEM_INSTRUCTION_SUFFIX },
          {
            role: "user",
            content: [
              { type: "text", text: user },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${base64}` },
              },
            ],
          },
        ],
        temperature: 0.3,
      });
      return response.choices[0].message.content;
    },
  },
  {
    name: "gemini",
    run: async (system, user) => {
      const model = getGemini().getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const prompt = `${system} ${SYSTEM_INSTRUCTION_SUFFIX}\n\nUser Question: ${user}`;
      const result = await model.generateContent(prompt);
      return result.response.text();
    },
    runVision: async (system, user, base64) => {
      const model = getGemini().getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const prompt = `${system} ${SYSTEM_INSTRUCTION_SUFFIX}\n\n${user}`;
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
      callOpenAICompatible(getGrok(), "grok-2-latest", system, user),
    runVision: async (system, user, base64) =>
      callOpenAIVision(getGrok(), "grok-2-vision-latest", system, user, base64),
  },
];

async function callOpenAICompatible(client, model, system, user) {
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: system + SYSTEM_INSTRUCTION_SUFFIX },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });
  return response.choices[0].message.content;
}

async function callOpenAIVision(client, model, system, user, imageBase64) {
  const response = await client.chat.completions.create({
    model: model,
    messages: [
      { role: "system", content: system + SYSTEM_INSTRUCTION_SUFFIX },
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
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

export const callLLM = async ({
  systemPrompt,
  userPrompt,
  preferredProvider,
}) => {
  const errors = [];

  // Sort providers if a preference is provided
  const sortedProviders = [...providers];
  if (preferredProvider) {
    const idx = sortedProviders.findIndex((p) => p.name === preferredProvider);
    if (idx > -1) {
      const p = sortedProviders.splice(idx, 1)[0];
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

  // Sort providers if a preference is provided
  const sortedProviders = [...providers];
  if (preferredProvider) {
    const idx = sortedProviders.findIndex((p) => p.name === preferredProvider);
    if (idx > -1) {
      const p = sortedProviders.splice(idx, 1)[0];
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
