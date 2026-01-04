import "./env.js";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
console.log("All good supabase");

export default supabase;
