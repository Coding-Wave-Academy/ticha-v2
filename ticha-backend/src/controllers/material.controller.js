import { extractKnowledgeUnits } from "../services/knowledgeExtraction.service.js";
import { saveKnowledgeUnits } from "../services/knowledgeUnit.service.js";
import supabase from "../config/supabase.js";
import { createMaterial, getMaterials } from "../services/material.service.js";
import { callLLM, callVisionLLM } from "../services/aiProvider.service.js";
import { TICHA_SYSTEM_PROMPT } from "../prompts/ticha.system.prompt.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const uploadMaterial = async (req, res) => {
  try {
    const material = await createMaterial(req.user.userId, req.body);
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listMaterials = async (req, res) => {
  try {
    const materials = await getMaterials(req.user.userId);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch materials" });
  }
};

export const generateSummary = async (req, res) => {
  try {
    let { title, content, subject } = req.body;
    const userId = req.user.userId;

    // Fetch user profile for personalization early
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Handle file upload
    if (req.file) {
      const fileName = req.file.originalname.replace(/\.[^/.]+$/, ""); // Strip extension
      if (!title) title = fileName;

      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = req.file.buffer;
        const pdfData = await pdf(dataBuffer);
        content = pdfData.text;
      } else if (req.file.mimetype.startsWith("image/")) {
        const base64Image = req.file.buffer.toString("base64");
        // Use Vision LLM to extract/summarize directly
        const visionResponse = await callVisionLLM({
          systemPrompt:
            "You are an expert OCR and education assistant. Analyze the image and extract the key educational content.",
          userPrompt:
            "Extract the text from this study material and provide a summary structure.",
          imageBase64: base64Image,
          preferredProvider: "grok",
        });
        // Vision LLM returns the summary directly, so we might skip the second step or use it as content
        // For consistency, let's treat it as extracted content for now, or just use the response if it's unstructured.
        // Better: Ask Vision to produce the JSON summary directly.
        const summaryValues = await callVisionLLM({
          systemPrompt: `${TICHA_SYSTEM_PROMPT}\n\nYou are a legendary educator. Turn boring study material into a "wow" summary. Be concise, punchy, and eliminate all fluff. Give the reader that "Aha!" moment immediately.`,
          userPrompt: `Analyze this material for a ${
            profile?.level || "student"
          }. 
Focus on clarity and that "aha!" insight.
Provide:
1. Overview (Short & snappy)
2. 3-4 Key points (Bullet points)
3. Practical example (Real-world)
4. 1-2 Review questions
5. A 'Wow Fact' or 'Cool Insight'
6. A 1-sentence 'Quick Takeaway'

Format strictly as JSON: { "overview": "", "keyPoints": [], "example": "", "reviewQuestions": [], "wowFact": "", "takeaway": "" }. NO markdown.`,
          imageBase64: base64Image,
          preferredProvider: "grok",
        });

        // Parse directly here and return
        let summaryData;
        try {
          const jsonMatch = summaryValues.match(/\{[\s\S]*\}/);
          summaryData = jsonMatch
            ? JSON.parse(jsonMatch[0])
            : JSON.parse(summaryValues);
        } catch (e) {
          summaryData = {
            overview: summaryValues,
            keyPoints: [],
            example: "",
            reviewQuestions: [],
            wowFact: "Knowledge is power!",
            takeaway: "Keep learning!",
          };
        }

        // Check for existing summary with same title to avoid duplicates
        const { data: existingSummary } = await supabase
          .from("summaries")
          .select("id")
          .eq("user_id", userId)
          .eq("title", title)
          .maybeSingle();

        if (existingSummary) {
          return res.json({
            summary: summaryData,
            id: existingSummary.id,
            existing: true,
          });
        }

        // Save and return early to avoid double-processing
        const { data: storedSummary, error } = await supabase
          .from("summaries")
          .insert({
            user_id: userId,
            title: title,
            category: subject || "general",
            content: JSON.stringify(summaryData),
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return res.json({ summary: summaryData, id: storedSummary?.id });
      }
    }

    if (!content && !req.file) {
      return res
        .status(400)
        .json({ error: "Title and content/file are required" });
    }

    // Process Text Content (from PDF or direct text input)

    const prompt = `
Create a concise, super engaging summary for a student at level: ${
      profile?.level || "intermediate"
    }.
Make it fun to read with "wow/aha" moments!

Title: ${title}
Subject: ${subject || "general"}
Content:
${(content || "").substring(0, 5000)}

Provide:
1. Overview (2-3 snappy sentences)
2. 3-4 Key points (High impact)
3. Practical example (A "real world" scenario)
4. 1-2 Review questions (Thought-provoking)
5. A 'Wow Fact' or 'Cool Insight' (That "aha!" moment)
6. A 1-sentence 'Quick Takeaway' (The core essence)

Format as JSON with keys: overview, keyPoints (array), example, reviewQuestions (array), wowFact, takeaway
`;

    const response = await callLLM({
      systemPrompt: `${TICHA_SYSTEM_PROMPT}\nYou are a high-impact educator. Your goal is to make students go "whoa!" with concise, ultra-clear, and exciting study summaries. NO fluff. Keep it punchy.`,
      userPrompt: prompt,
      preferredProvider: "grok",
    });

    // Parse AI response
    let summaryData;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
    } catch {
      summaryData = {
        overview: response,
        keyPoints: [],
        example: "",
        reviewQuestions: [],
        wowFact: "Did you know learning increases brain connectivity?",
        takeaway: "Master the basics, and the rest follows.",
      };
    }

    // Check for existing summary with same title
    const { data: existingSummary } = await supabase
      .from("summaries")
      .select("id")
      .eq("user_id", userId)
      .eq("title", title)
      .maybeSingle();

    if (existingSummary) {
      return res.json({
        summary: summaryData,
        id: existingSummary.id,
        existing: true,
      });
    }

    // Store summary in database
    const { data: storedSummary, error } = await supabase
      .from("summaries")
      .insert({
        user_id: userId,
        title: title,
        category: subject || "general",
        content: JSON.stringify(summaryData),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ summary: summaryData, id: storedSummary?.id });
  } catch (err) {
    console.error("Error generating summary:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to generate summary" });
  }
};

export const processMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const { data: material } = await supabase
      .from("learning_materials")
      .select("*")
      .eq("id", materialId)
      .single();

    const units = await extractKnowledgeUnits(material);
    await saveKnowledgeUnits(materialId, units);

    await supabase
      .from("learning_materials")
      .update({ processed: true })
      .eq("id", materialId);

    res.json({ message: "Material processed successfully 🧠" });
  } catch (err) {
    res.status(500).json({ error: "AI processing failed" });
  }
};

export const listSummaries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { data: summaries, error } = await supabase
      .from("summaries")
      .select("id, title, category, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch summaries history" });
  }
};

export const deleteSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { error } = await supabase
      .from("summaries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
    res.json({ message: "Summary deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete summary" });
  }
};
