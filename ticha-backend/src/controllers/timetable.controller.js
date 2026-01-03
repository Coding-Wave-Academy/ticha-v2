import supabase from "../config/supabase.js";

export const uploadTimetable = async (req, res) => {
  const { courses } = req.body; // expect array of course objects
  const { userId } = req.user;

  const { error } = await supabase
    .from("student_timetables")
    .upsert({ user_id: userId, courses });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Timetable uploaded successfully" });
};

export const getTimetable = async (req, res) => {
  const { userId } = req.user;

  const { data, error } = await supabase
    .from("student_timetables")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
};

