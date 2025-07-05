// Simple test script for Gemini service
// Run with: node test-gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key is set
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.log("❌ VITE_GEMINI_API_KEY not found in environment variables");
  console.log("Please set your Gemini API key in a .env file");
  process.exit(1);
}

console.log("✅ API key found");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function testConnection() {
  try {
    console.log("🔄 Testing connection...");
    const result = await model.generateContent("Hello");
    const response = result.response.text();
    console.log("✅ Connection successful!");
    console.log("Response:", response);
    return true;
  } catch (error) {
    console.log("❌ Connection failed:", error.message);
    return false;
  }
}

async function testQuestionGeneration() {
  try {
    console.log("🔄 Testing question generation...");

    const prompt = `Generate 2 multiple choice trivia questions about Ancient History with medium difficulty level.
    
Requirements:
- Each question should have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Include a brief explanation for the correct answer

Format each question as JSON:
{
  "id": "unique_id",
  "category": "Ancient History",
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "difficulty": "medium",
  "explanation": "Brief explanation of why this is correct"
}

Return only valid JSON array of questions, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("✅ Question generation successful!");
    console.log("Raw response:", response);

    // Try to parse JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      console.log("✅ Parsed questions:", JSON.stringify(questions, null, 2));
    } else {
      console.log("⚠️ Could not parse JSON from response");
    }

    return true;
  } catch (error) {
    console.log("❌ Question generation failed:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Running Gemini service tests...\n");

  const connectionOk = await testConnection();
  console.log();

  if (connectionOk) {
    await testQuestionGeneration();
  }

  console.log("\n🏁 Tests completed!");
}

runTests().catch(console.error);
