import { getWeakestKnowledgeUnits } from "./weaknessMapping.service.js";
import supabase from "../config/supabase.js";

export const generateDailyTasks = async (userId) => {
  // fetch weaknesses
  const weaknesses = await getWeakestKnowledgeUnits(userId);

  // fetch user's uploaded timetable
  const { data: timetable } = await supabase
    .from("student_timetables")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!timetable || !timetable.courses) return [];

  const dailyTasks = [];

  for (let block of timetable.courses) {
    // prioritize weak concepts first
    const subject = weaknesses.shift() || block.course_name;
    dailyTasks.push({
      time: block.preferred_times[0] || "08:00",
      subject,
    });
  }

  return dailyTasks;
};

