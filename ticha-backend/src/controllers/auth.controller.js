import supabase from "../config/supabase.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { full_name, email, password, role = "OL", level, language } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields: full_name, email, password" });
    }

    // Validate role - only allow specific values
    const validRoles = ["OL", "AL", "UNIVERSITY"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    const password_hash = await hashPassword(password);

    const { data, error } = await supabase
      .from("students")
      .insert([{ full_name, email, password_hash, role, level, language }])
      .select()
      .single();

    if (error) throw error;

    const token = generateToken({
      userId: data.id,
      role: data.role
    });

    res.status(201).json({
      message: "Welcome to TICHA AI 🎓",
      token,
      user: {
        id: data.id,
        full_name: data.full_name,
        role: data.role
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from("students")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role
    });

    res.json({
      message: "Welcome back 👋",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        level: user.level,
        language: user.language
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

