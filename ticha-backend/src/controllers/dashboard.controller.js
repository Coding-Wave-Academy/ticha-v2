import supabase from "../config/supabase.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch streak
    let streak = 0;
    try {
      const { data: s } = await supabase
        .from("streaks")
        .select("current_streak")
        .eq("user_id", userId)
        .single();
      streak = s?.current_streak || 0;
    } catch (e) {
      // left as 0 if table doesn't exist
      streak = 0;
    }

    // Fetch notifications count if table exists
    let notifications = 0;
    try {
      const { count } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      notifications = Number(count) || 0;
    } catch (e) {
      notifications = 0;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from("student_profiles")
      .select("level, major")
      .eq("user_id", userId)
      .single();

    // Fetch summaries count
    const { count: summaryCount } = await supabase
      .from("summaries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Fetch recent summaries if any
    let recentSummaries = [];
    try {
      const { data } = await supabase
        .from("summaries")
        .select("id,title,category,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      recentSummaries = data || [];
    } catch (e) {
      recentSummaries = [];
    }

    res.json({
      streak,
      notifications,
      recentSummaries,
      level: profile?.level || "ol",
      major: profile?.major || "",
      hasUploadedCourses: (summaryCount || 0) > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch dashboard data" });
  }
};

export const seedDashboard = async (req, res) => {
  // Allow seeding in non-production environments (safe for local dev)
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Seeding disabled in production" });
  }

  try {
    const userId = req.user.userId;

    // Upsert streak
    await supabase
      .from("streaks")
      .upsert(
        { user_id: userId, current_streak: 7 },
        { onConflict: ["user_id"] }
      );

    // Insert a couple of notifications (avoid duplicates by checking existing messages)
    const notifications = [
      {
        user_id: userId,
        message: "Welcome to TICHA! Your personalized study plan is ready.",
        is_read: false,
      },
      {
        user_id: userId,
        message:
          "New GCE O/L Biology summary available: Photosynthesis deeply explained.",
        is_read: false,
      },
      {
        user_id: userId,
        message: "You have completed 70% of your daily goal. Keep going!",
        is_read: false,
      },
    ];

    for (const n of notifications) {
      const { data: exists } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("message", n.message)
        .limit(1);
      if (!exists || exists.length === 0) {
        await supabase.from("notifications").insert(n);
      }
    }

    // Remove existing demo summaries to avoid duplicates
    await supabase
      .from("summaries")
      .delete()
      .eq("user_id", userId)
      .eq("demo", true);

    // Mock summaries removed as per request

    // Return the updated dashboard data
    const { data: s } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("user_id", userId)
      .single();
    const streak = s?.current_streak || 0;

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    const notificationsCount = Number(count) || 0;

    const { data: recentSummaries } = await supabase
      .from("summaries")
      .select("id,title,category,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Insert demo knowledge units
    const { data: existingUnits } = await supabase
      .from("knowledge_units")
      .select("id")
      .limit(1);
    if (!existingUnits || existingUnits.length === 0) {
      const demoUnits = [
        {
          concept_title: "Mitochondria",
          explanation: "The powerhouse of the cell, where ATP is produced.",
          difficulty: 2,
        },
        {
          concept_title: "Differentiation",
          explanation: "The process of finding the derivative of a function.",
          difficulty: 3,
        },
        {
          concept_title: "Pre-independence Cameroon",
          explanation: "The period before 1960 marked by colonial struggle.",
          difficulty: 2,
        },
      ];
      const { data: insertedUnits } = await supabase
        .from("knowledge_units")
        .insert(demoUnits)
        .select();

      // Add weaknesses for these units
      if (insertedUnits) {
        const weaknesses = insertedUnits.map((unit) => ({
          user_id: userId,
          knowledge_unit_id: unit.id,
          weakness_score: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
          last_updated: new Date(),
        }));
        await supabase
          .from("user_weaknesses")
          .upsert(weaknesses, { onConflict: ["user_id", "knowledge_unit_id"] });
      }
    }

    res.json({
      streak,
      notifications: notificationsCount,
      recentSummaries: recentSummaries || [],
    });
  } catch (err) {
    console.error("Error seeding dashboard:", err);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
};
