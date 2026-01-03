export const updateStreak = async (userId) => {
  const today = new Date().toISOString().split("T")[0];

  const { data: streak } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today
    });
    return;
  }

  const last = streak.last_active_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (last === yesterday) {
    const newStreak = streak.current_streak + 1;
    await supabase.from("streaks").update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_active_date: today
    }).eq("user_id", userId);
  }
};
