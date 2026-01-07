import "./src/config/env.js";
import supabase from "./src/config/supabase.js";

async function testAvatarUpdate() {
  try {
    console.log("Checking students table for avatar_url column...");
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("id, avatar_url")
      .limit(1)
      .single();

    if (fetchError) {
      console.error("Fetch Error:", fetchError);
      return;
    }

    console.log("Column exists. Student ID:", student.id);
    console.log("Updating avatar...");
    const { data: updated, error: updateError } = await supabase
      .from("students")
      .update({ avatar_url: "https://example.com/test.png" })
      .eq("id", student.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update Error:", updateError);
    } else {
      console.log("Success:", updated);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAvatarUpdate();
