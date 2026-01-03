export const buildAIContext = (user, profile) => {
  return {
    identity: {
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
  return {
    userId, // Add userId for conversation tracking
    level: "GCE A/L",
    subjects: ["Mathematics", "Physics"],
    weakestTopics: ["Electric Fields", "Differentiation"],
    recentMistakes: ["confusing potential and voltage"],
    tone: "compassionate_teacher",
    language: "EN",
  };
};
