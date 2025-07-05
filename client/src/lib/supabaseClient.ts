import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging to help troubleshoot
console.log("🔍 Supabase Environment Variables:");
console.log("VITE_SUPABASE_URL:", supabaseUrl ? "✅ Found" : "❌ Missing");
console.log(
  "VITE_SUPABASE_ANON_KEY:",
  supabaseAnonKey ? "✅ Found" : "❌ Missing"
);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
