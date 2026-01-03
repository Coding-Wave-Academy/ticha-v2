import supabase from "../config/supabase.js";

export const createSession = async (userId, title = "New Chat") => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert([{ user_id: userId, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSessions = async (userId) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getSessionMessages = async (sessionId) => {
  const { data, error } = await supabase
    .from("tutor_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
};
