import { generateDailyPlan } from "../services/dailyPlanner.service.js";
import supabase from "../config/supabase.js";
import { callLLM } from "../services/aiProvider.service.js";
import { getWeakestKnowledgeUnits } from "../services/weaknessMapping.service.js";

export const getTodayTasks = async (req, res) => {
  const tasks = await generateDailyPlan(req.user.userId);
  res.json(tasks);
};

export const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    // Update the task to mark it completed
    const { data, error } = await supabase
      .from("daily_tasks")
      .update({ completed: true })
      .match({ id: taskId, user_id: userId })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, task: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const generateAITasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date().toISOString().split("T")[0];

    // Fetch user profile to personalize tasks
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get weakest knowledge units
    const weaknesses = await getWeakestKnowledgeUnits(userId, 5);

    // Fetch recent student summaries
    const { data: summaries } = await supabase
      .from("summaries")
      .select("title, category")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    // Fetch recent AI interactions
    const { data: interactionHistory } = await supabase
      .from("tutor_conversations")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    const summariesContext = summaries?.length
      ? `Recent student notes/summaries: ${summaries
          .map((s) => `${s.title} (${s.category})`)
          .join(", ")}`
      : "";

    const interactionsContext = interactionHistory?.length
      ? `Recent AI interactions: ${interactionHistory
          .map((i) => i.content)
          .join(" | ")}`
      : "";

    // Use AI to generate personalized task descriptions
    const prompt = `
Create 3 engaging, personalized daily learning tasks for a student.

STUDENT PROGRESS CONTEXT:
- Level: ${profile?.level || "intermediate"}
- Subject: ${profile?.subject || "general"}
- Weak areas: ${weaknesses.map((w) => w.concept).join(", ")}
${summariesContext ? `- ${summariesContext}` : ""}
${interactionsContext ? `- ${interactionsContext}` : ""}

For each task, provide:
1. Task title (short, motivating)
2. Description (clear, actionable, mentioning a specific concept or note above)
3. Estimated minutes (15-30)
4. Task type (quiz, practice, review)

Return as JSON array with keys: title, description, estimated_minutes, task_type
`;

    const response = await callLLM({
      systemPrompt:
        "You are an expert educational task designer. Create engaging, achievable learning tasks.",
      userPrompt: prompt,
    });

    // Parse AI response
    let tasksData;
    try {
      // Extract JSON from response (might be wrapped in markdown or text)
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      tasksData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);
    } catch {
      tasksData = [
        {
          title: "Review Weaknesses",
          description: "Focus on your weaker concepts",
          estimated_minutes: 20,
          task_type: "review",
        },
        {
          title: "Practice Quiz",
          description: "Test your knowledge",
          estimated_minutes: 25,
          task_type: "quiz",
        },
        {
          title: "Study Summary",
          description: "Review today's lessons",
          estimated_minutes: 15,
          task_type: "review",
        },
      ];
    }

    // Store tasks in database
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

    res.json({ tasks: insertedTasks || taskRecords, generated: true });
  } catch (err) {
    console.error("Error generating AI tasks:", err);
    res.status(500).json({ error: err.message || "Failed to generate tasks" });
  }
};
