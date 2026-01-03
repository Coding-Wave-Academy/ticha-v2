import supabase from "../config/supabase.js";

export const updateWeaknesses = async (userId) => {
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("*")
    .eq("user_id", userId);

  const grouped = attempts.reduce((acc, a) => {
    acc[a.knowledge_unit_id] = acc[a.knowledge_unit_id] || [];
    acc[a.knowledge_unit_id].push(a);
    return acc;
  }, {});

  for (const [knowledgeUnitId, unitAttempts] of Object.entries(grouped)) {
    const weaknessScore = calculateWeaknessScore(unitAttempts);

    await supabase.from("user_weaknesses").upsert(
      {
        user_id: userId,
        knowledge_unit_id: knowledgeUnitId,
        weakness_score: weaknessScore,
        last_updated: new Date(),
      },
      { onConflict: ["user_id", "knowledge_unit_id"] }
    );
  }
};
export const calculateWeaknessScore = (attempts) => {
  const N = attempts.length;
  const incorrect = attempts.filter((a) => !a.is_correct).length;
  const avgDifficulty =
    attempts.reduce((sum, a) => sum + a.difficulty_level, 0) / N;
  const avgTime = attempts.reduce((sum, a) => sum + a.response_time, 0) / N;

  return (
    (incorrect / N) * 0.6 + (avgDifficulty / 5) * 0.2 + (avgTime / 30) * 0.2
  );
};
export const getWeakestKnowledgeUnits = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from("user_weaknesses")
    .select(
      `
      knowledge_unit_id,
      weakness_score,
      knowledge_units(concept_title)
    `
    )
    .eq("user_id", userId)
    .order("weakness_score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching weakest knowledge units:", error);
    return [];
  }

  return data.map((item) => ({
    id: item.knowledge_unit_id,
    score: item.weakness_score,
    concept: item.knowledge_units?.concept_title || "Unknown Topic",
  }));
};
