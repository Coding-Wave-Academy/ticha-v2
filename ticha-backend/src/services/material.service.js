import supabase from "../config/supabase.js";

export const createMaterial = async (userId, payload) => {
  const { title, subject, source_type, raw_text } = payload;

  const { data, error } = await supabase
    .from("learning_materials")
    .insert([{
      user_id: userId,
      title,
      subject,
      source_type,
      raw_text
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMaterials = async (userId) => {
  const { data, error } = await supabase
    .from("learning_materials")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};
