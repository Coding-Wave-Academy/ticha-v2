import supabase from "../config/supabase.js";
import { callLLM, safeJSONParse } from "../services/aiProvider.service.js";
import { getWeakestKnowledgeUnits } from "../services/weaknessMapping.service.js";

export const getTodayTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split("T")[0];

    // Check for existing tasks
    const { data: existing } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today);

    if (existing && existing.length > 0) {
      return res.json(existing);
    }

    // Auto-generate if not exists
    const result = await generateAILogic(userId);

    if (result.noData) {
      // Create a notification for the user to upload materials
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("title", "Activate TICHA Daily!")
        .maybeSingle();

      if (!existingNotif) {
        await supabase.from("notifications").insert({
          user_id: userId,
          title: "Activate TICHA Daily!",
          content:
            "Upload some notes or take a practice quiz so I can create a personalized daily study plan for you! 🧠",
          type: "system",
          read: false,
        });
      }
      return res.json([]);
    }

    res.json(result.tasks);
  } catch (err) {
    console.error("getTodayTasks error:", err);
    res.json([]);
  }
};

// Internal AI logic to be reused
const generateAILogic = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  // Fetch contextual data
  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  const weaknesses = await getWeakestKnowledgeUnits(userId, 5);
  const { data: summaries } = await supabase
    .from("summaries")
    .select("title, category")
    .eq("user_id", userId)
    .limit(3);

  // Check if we have enough data to be "smart"
  if (
    (!weaknesses || weaknesses.length === 0) &&
    (!summaries || summaries.length === 0)
  ) {
    return { noData: true };
  }

  const prompt = `
Generate 3 personalized daily learning tasks for today: ${today}.
CONTEXT: Level ${profile?.level || "secondary"}, Subjects ${
    profile?.subject || "general"
  }.
STRENGTHS/WEAKNESSES: ${weaknesses.map((w) => w.concept_title).join(", ")}.
SUMMARIES: ${summaries.map((s) => s.title).join(", ")}.

Create catchy, high-impact tasks. 
Return ONLY JSON array: [{ "title": "", "description": "", "estimated_minutes": 20, "task_type": "quiz|practice|review" }]
`;

  const response = await callLLM({
    systemPrompt:
      "You are TICHA AI's Planner. Create precise, motivating study tasks. Return ONLY valid JSON.",
    userPrompt: prompt,
  });

  const tasksData = safeJSONParse(response) || [
    {
      title: "Power Up",
      description: "Review your latest concepts",
      estimated_minutes: 20,
      task_type: "review",
    },
  ];

  const taskRecords = tasksData.slice(0, 3).map((task, idx) => ({
    user_id: userId,
    date: today,
    title: task.title,
    description: task.description,
    task_type: task.task_type || "practice",
    estimated_minutes: task.estimated_minutes || 20,
    knowledge_unit_id: weaknesses[idx]?.id || null,
    completed: false,
  }));

  const { data: insertedTasks } = await supabase
    .from("daily_tasks")
    .insert(taskRecords)
    .select();
  return { tasks: insertedTasks || taskRecords, generated: true };
};

export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from("daily_tasks")
      .update({ completed: true })
      .match({ id: taskId, user_id: userId })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, task: data });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const generateAITasks = async (req, res) => {
  const result = await generateAILogic(req.user.userId);
  res.json(result);
};

export const getDailyTip = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const prompt = `Give me one catchy, "aha-moment" AI study tip for a student at level: ${
      profile?.level || "general"
    }. 
Keep it under 20 words. Use 1 emoji.
Format: Just the text of the tip.`;

    const tip = await callLLM({
      systemPrompt:
        "You are TICHA AI, the cool study mentor. Give snappy, high-value study advice.",
      userPrompt: prompt,
    });

    res.json({ tip: tip.trim() });
  } catch (err) {
    res.json({ tip: "Space your study sessions to remember more! 🧠" });
  }
};
