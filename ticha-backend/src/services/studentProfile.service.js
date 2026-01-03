import supabase from "../config/supabase.js";

export const createStudentProfile = async (userId, payload) => {
  const { system, subjects, current_level, language } = payload;

  const { data, error } = await supabase
    .from("student_profiles")
    .insert([{
      user_id: userId,
      system,
      subjects,
      current_level
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getStudentProfile = async (userId) => {
  const { data, error } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
};
