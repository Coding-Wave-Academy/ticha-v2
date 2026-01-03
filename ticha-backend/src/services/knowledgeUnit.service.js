import supabase from "../config/supabase.js";

export const saveKnowledgeUnits = async (materialId, units) => {
  const formatted = units.map(u => ({
    material_id: materialId,
    concept_title: u.concept_title,
    explanation: u.explanation,
    misconceptions: u.misconceptions,
    examples: u.examples,
    difficulty: u.difficulty
  }));

  const { error } = await supabase
    .from("knowledge_units")
    .insert(formatted);

  if (error) throw error;
};
