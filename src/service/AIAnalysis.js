/**
 * AIAnalysis.js - واجهة للتفاعل مع خدمات الذكاء الاصطناعي التوليدي
 * 
 * هذا الملف يوفر واجهة مبسطة للتفاعل مع نماذج Google Generative AI
 * ويستخدم لإنشاء تحليلات ذكية للاستبانات
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// استيراد مفتاح API من متغيرات البيئة
const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;

// التحقق من وجود مفتاح API
if (!apiKey) {
  console.error("❌ مفتاح API لخدمة Google AI مفقود! يرجى إضافته إلى ملف .env");
  // إضافة تنبيه للمستخدم في حالة عدم وجود المفتاح
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      alert("تنبيه: مفتاح API للذكاء الاصطناعي مفقود. بعض الميزات قد لا تعمل بشكل صحيح.");
    }, 1000);
  }
}

/**
 * تهيئة مثيل من Google Generative AI
 * مع التعامل الآمن مع حالة عدم وجود مفتاح API
 */
const genAI = apiKey 
  ? new GoogleGenerativeAI(apiKey)
  : null;

/**
 * إعدادات النموذج المستخدم
 * gemini-2.0-flash هو نموذج سريع ومناسب للتحليلات
 */
const model = genAI?.getGenerativeModel({
  model: "gemini-2.0-flash",
});

/**
 * إعدادات توليد النص
 * 
 * temperature: درجة الإبداع (1 = متوازن)
 * topP: تنوع الاستجابات (0.95 = متنوع مع الحفاظ على الصلة)
 * topK: عدد الكلمات المرشحة للاختيار في كل خطوة
 * maxOutputTokens: الحد الأقصى لطول الاستجابة
 */
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

/**
 * إنشاء جلسة محادثة مع نموذج الذكاء الاصطناعي
 * 
 * يتم استخدام هذه الجلسة لإرسال طلبات التحليل وتلقي الاستجابات
 */
export const AIChatSession = model 
  ? model.startChat({
      generationConfig,
      history: [],
    })
  : createFallbackChatSession();

/**
 * إنشاء جلسة محادثة احتياطية في حالة عدم توفر مفتاح API
 * 
 * تستخدم هذه الجلسة لتوفير استجابات افتراضية عندما لا يمكن الوصول إلى خدمة الذكاء الاصطناعي
 * @returns {Object} كائن يحاكي واجهة جلسة المحادثة الحقيقية
 */
function createFallbackChatSession() {
  console.warn("⚠️ استخدام جلسة محادثة احتياطية بسبب عدم توفر مفتاح API");
  
  return {
    sendMessage: async (message) => {
      console.log("📤 رسالة أرسلت إلى جلسة احتياطية:", message.substring(0, 100) + "...");
      
      // إنشاء استجابة افتراضية بعد تأخير قصير لمحاكاة الاتصال بالخدمة
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        response: {
          text: () => "⚠️ لم يتم تكوين خدمة الذكاء الاصطناعي بشكل صحيح. يرجى التحقق من مفتاح API في ملف .env الخاص بك."
        }
      };
    }
  };
}

/**
 * تحليل نص باستخدام الذكاء الاصطناعي
 * 
 * @param {string} text - النص المراد تحليله
 * @param {string} prompt - التوجيه المستخدم للتحليل
 * @returns {Promise<string>} - وعد بنتيجة التحليل
 */
export const analyzeText = async (text, prompt = "حلل النص التالي وقدم رؤى مفيدة:") => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error("النص المدخل غير صالح");
    }
    
    const fullPrompt = `${prompt}\n\n${text}`;
    const result = await AIChatSession.sendMessage(fullPrompt);
    
    return result?.response?.text() || "لم يتم الحصول على استجابة من خدمة الذكاء الاصطناعي";
  } catch (error) {
    console.error("❌ خطأ في تحليل النص:", error);
    return `حدث خطأ أثناء التحليل: ${error.message}`;
  }
};

/**
 * تلخيص نص باستخدام الذكاء الاصطناعي
 * 
 * @param {string} text - النص المراد تلخيصه
 * @param {number} maxLength - الحد الأقصى لطول الملخص (بالكلمات)
 * @returns {Promise<string>} - وعد بنتيجة التلخيص
 */
export const summarizeText = async (text, maxLength = 200) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error("النص المدخل غير صالح");
    }
    
    const prompt = `لخص النص التالي في حوالي ${maxLength} كلمة أو أقل:\n\n${text}`;
    const result = await AIChatSession.sendMessage(prompt);
    
    return result?.response?.text() || "لم يتم الحصول على استجابة من خدمة الذكاء الاصطناعي";
  } catch (error) {
    console.error("❌ خطأ في تلخيص النص:", error);
    return `حدث خطأ أثناء التلخيص: ${error.message}`;
  }
};

/**
 * استخراج الكلمات المفتاحية من نص باستخدام الذكاء الاصطناعي
 * 
 * @param {string} text - النص المراد استخراج الكلمات المفتاحية منه
 * @param {number} count - عدد الكلمات المفتاحية المطلوبة
 * @returns {Promise<string[]>} - وعد بمصفوفة الكلمات المفتاحية
 */
export const extractKeywords = async (text, count = 5) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error("النص المدخل غير صالح");
    }
    
    const prompt = `استخرج ${count} كلمات مفتاحية من النص التالي. قدم الإجابة كقائمة مفصولة بفواصل فقط:\n\n${text}`;
    const result = await AIChatSession.sendMessage(prompt);
    
    const response = result?.response?.text() || "";
    return response.split(',').map(keyword => keyword.trim()).filter(Boolean);
  } catch (error) {
    console.error("❌ خطأ في استخراج الكلمات المفتاحية:", error);
    return [];
  }
};

// تصدير دوال إضافية للاستخدام في التطبيق
export default {
  AIChatSession,
  analyzeText,
  summarizeText,
  extractKeywords
};
