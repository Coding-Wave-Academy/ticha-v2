import supabase from "../config/supabase.js";

export const buildAIContext = (user, profile) => {
  return {
    identity: {
      name: user.full_name,
      role: profile.system,
      level: profile.current_level,
      subjects: profile.subjects,
      language: user.language || "en",
    },
    learning_state: {
      strengths: profile.strengths || [],
      weaknesses: profile.weaknesses || [],
      difficulty: profile.difficulty_rating,
    },
    tone: profile.motivation_style,
    constraints: {
      curriculum: "Cameroon",
      exam_focus: true,
      compassion_required: true,
    },
  };
};

export const buildTutorContext = async (userId) => {
  try {
    const { data: user } = await supabase
      .from("students")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: profile } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    return {
      userId,
      name: user?.full_name || "Student",
      level: user?.role || "GCE A/L",
      subjects: profile?.subjects || [],
      weakestTopics: profile?.weaknesses || [],
      recentMistakes: [],
      tone: profile?.motivation_style || "compassionate_teacher",
      language: user?.language || "EN",
    };
  } catch (error) {
    console.error("Error building tutor context:", error);
    return {
      userId,
      name: "Student",
      level: "GCE A/L",
      subjects: [],
      weakestTopics: [],
      recentMistakes: [],
      tone: "compassionate_teacher",
      language: "EN",
    };
  }
};
