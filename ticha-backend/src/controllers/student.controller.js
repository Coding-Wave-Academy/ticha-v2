import supabase from "../config/supabase.js";

export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({ error: "avatar_url is required" });
    }

    const { data, error } = await supabase
      .from("students")
      .update({ avatar_url })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: "Avatar updated successfully",
      avatar_url: data.avatar_url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
