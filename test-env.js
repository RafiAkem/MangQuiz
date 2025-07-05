// Test script to check environment variables
import { config } from "dotenv";

// Load environment variables from .env file
config();

console.log("🔍 Environment Variable Test");
console.log("============================");

// Check if the API key is loaded
const apiKey = process.env.VITE_GEMINI_API_KEY;
console.log("VITE_GEMINI_API_KEY:", apiKey ? "✅ Found" : "❌ Not found");

if (apiKey) {
  console.log("API Key length:", apiKey.length);
  console.log("API Key starts with:", apiKey.substring(0, 10) + "...");
} else {
  console.log("❌ API key not found in environment variables");
}

// Check other environment variables
console.log("\nOther environment variables:");
console.log(
  "VITE_SUPABASE_URL:",
  process.env.VITE_SUPABASE_URL ? "✅ Found" : "❌ Not found"
);
console.log(
  "SUPABASE_KEY:",
  process.env.SUPABASE_KEY ? "✅ Found" : "❌ Not found"
);

console.log("\n📁 Current working directory:", process.cwd());
console.log("📄 .env file should be in:", process.cwd() + "\\.env");
