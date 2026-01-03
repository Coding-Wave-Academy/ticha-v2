import supabase from "../config/supabase.js";
import { getWeakestKnowledgeUnits } from "./weaknessMapping.service.js";

export const generateDailyPlan = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  // Check if already generated
  const { data: existing } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today);

  if (existing.length > 0) return existing;

  const weaknesses = await getWeakestKnowledgeUnits(userId);

  const tasks = weaknesses.slice(0, 3).map(w => ({
    user_id: userId,
    date: today,
    task_type: "quiz",
    subject: w.subject,
    knowledge_unit_id: w.id,
    estimated_minutes: 20
  }));

  await supabase.from("daily_tasks").insert(tasks);

  return tasks;
};
