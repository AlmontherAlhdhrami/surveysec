import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ تأكد من تثبيت الحزمة

// ✅ استخدم import.meta.env بدلاً من process.meta.env
const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error("❌ API Key for Google AI is missing! Add it to .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",

});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// ✅ تصدير الجلسة بشكل صحيح
export const AIChatSession = model.startChat({
  generationConfig,
  history: [],
});
