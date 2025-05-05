/**
 * AIreport.js - تحليل متقدم للاستبانات باستخدام الذكاء الاصطناعي
 * 
 * هذا الملف يوفر وظائف متقدمة لتحليل بيانات الاستبانات وإنشاء تقارير ذكية
 * باستخدام الإحصاءات والذكاء الاصطناعي
 */

import { AIChatSession } from "./AIAnalysis";
import { linearRegressionLine, linearRegression, sampleCorrelation } from "simple-statistics";
import { calculateSummaryStatistics } from "../utils/statisticalFunctions";

// ثوابت التكوين - يمكن نقلها إلى ملف تكوين منفصل
const ANALYSIS_CONFIG = {
  MIN_RESPONSES: 10,
  MIN_CATEGORIES: 2,
  MIN_DATA_POINTS: 3,
  CORRELATION_THRESHOLDS: {
    STRONG: 0.7,
    MODERATE: 0.3
  },
  CHI_SQUARE_SIGNIFICANCE: 3.84, // القيمة الحرجة عند p=0.05, df=1
  QUALITY_SCORE_WEIGHTS: {
    RESPONSE_COUNT: 0.5,
    DATA_VALIDITY: 0.3,
    VARIANCE: 0.4
  }
};

/**
 * التحقق من صحة بيانات السؤال وتقييم جودتها
 * 
 * @param {Object} question - كائن السؤال
 * @param {Array} answers - مصفوفة الإجابات
 * @returns {Object} - نتائج التحقق من الصحة
 */
const validateQuestionData = (question, answers) => {
  if (!question || !question.id || !Array.isArray(answers)) {
    return {
      isValid: false,
      qualityScore: 0,
      errors: ["بيانات السؤال أو الإجابات غير صالحة"],
      filteredAnswers: [],
      numericalValues: []
    };
  }

  // تصفية الإجابات المتعلقة بهذا السؤال
  const filteredAnswers = answers.filter(a => a && a.question_id === question.id);
  
  // استخراج القيم العددية الصالحة
  const numericalValues = filteredAnswers
    .map(a => {
      const num = Number(a.answer_value);
      return Number.isFinite(num) ? num : null;
    })
    .filter(v => v !== null);

  const errors = [];
  let qualityScore = 1;

  // التحقق من عدد الاستجابات
  if (filteredAnswers.length < ANALYSIS_CONFIG.MIN_RESPONSES) {
    errors.push(`عدد الاستجابات غير كافٍ (${filteredAnswers.length}/${ANALYSIS_CONFIG.MIN_RESPONSES})`);
    qualityScore *= ANALYSIS_CONFIG.QUALITY_SCORE_WEIGHTS.RESPONSE_COUNT;
  }

  // التحقق من صحة البيانات العددية
  if (numericalValues.length === 0) {
    errors.push("لا توجد بيانات عددية صالحة");
    qualityScore *= ANALYSIS_CONFIG.QUALITY_SCORE_WEIGHTS.DATA_VALIDITY;
  } else {
    // التحقق من التباين الصفري
    const uniqueValues = new Set(numericalValues);
    if (uniqueValues.size === 1) {
      errors.push("تم اكتشاف قيم ثابتة (تباين صفري)");
      qualityScore *= ANALYSIS_CONFIG.QUALITY_SCORE_WEIGHTS.VARIANCE;
    }
  }

  return {
    isValid: errors.length === 0,
    qualityScore: Math.round(qualityScore * 100),
    errors,
    filteredAnswers,
    numericalValues
  };
};

/**
 * حساب معامل التحديد (R²) للانحدار الخطي
 * 
 * @param {Array} dataPoints - نقاط البيانات [[x1,y1], [x2,y2], ...]
 * @param {Function} predictFn - دالة التنبؤ
 * @returns {number} - قيمة R²
 */
const calculateRSquared = (dataPoints, predictFn) => {
  try {
    const yValues = dataPoints.map(point => point[1]);
    const yMean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
    
    const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssResidual = dataPoints.reduce((sum, point) => {
      const yPredicted = predictFn(point[0]);
      return sum + Math.pow(point[1] - yPredicted, 2);
    }, 0);
    
    return 1 - (ssResidual / ssTotal);
  } catch (error) {
    console.error("خطأ في حساب R²:", error);
    return 0;
  }
};

/**
 * إجراء اختبار مربع كاي للاستقلالية
 * 
 * @param {Object} question - كائن السؤال
 * @param {Array} answers - مصفوفة الإجابات
 * @returns {Object} - نتائج الاختبار
 */
const performChiSquareTest = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    // حساب التكرارات المرصودة
    const observedFrequencies = validation.filteredAnswers.reduce((acc, { answer_value }) => {
      acc[answer_value] = (acc[answer_value] || 0) + 1;
      return acc;
    }, {});

    const observed = Object.values(observedFrequencies);
    if (observed.length < ANALYSIS_CONFIG.MIN_CATEGORIES) {
      return { error: ["عدد فئات الاستجابة غير كافٍ"] };
    }

    // حساب التكرارات المتوقعة بافتراض التوزيع المنتظم
    const total = observed.reduce((sum, val) => sum + val, 0);
    const expected = Array(observed.length).fill(total / observed.length);

    // حساب قيمة مربع كاي
    const chiSquareValue = observed.reduce((sum, obs, i) => sum + ((obs - expected[i]) ** 2) / expected[i], 0);
    const degreesOfFreedom = observed.length - 1;
    
    return {
      chiSquareValue,
      degreesOfFreedom,
      significant: chiSquareValue > ANALYSIS_CONFIG.CHI_SQUARE_SIGNIFICANCE,
      observedFrequencies
    };
  } catch (error) {
    console.error("خطأ في اختبار مربع كاي:", error);
    return { error: ["فشل في الحساب الإحصائي"] };
  }
};

/**
 * إجراء تحليل الانحدار الخطي
 * 
 * @param {Object} question - كائن السؤال
 * @param {Array} answers - مصفوفة الإجابات
 * @returns {Object} - نتائج الانحدار
 */
const performLinearRegression = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    if (validation.numericalValues.length < ANALYSIS_CONFIG.MIN_DATA_POINTS) {
      return { error: ["عدد نقاط البيانات غير كافٍ للانحدار"] };
    }

    // إنشاء نقاط البيانات للانحدار
    const dataPoints = validation.filteredAnswers.map((a, index) => [index + 1, Number(a.answer_value)]);
    const regression = linearRegression(dataPoints);
    const predict = linearRegressionLine(regression);
    const rSquared = calculateRSquared(dataPoints, predict);

    return {
      slope: regression.m,
      intercept: regression.b,
      rSquared,
      equation: `y = ${regression.m.toFixed(2)}x + ${regression.b.toFixed(2)}`,
      dataPoints,
      predict
    };
  } catch (error) {
    console.error("خطأ في تحليل الانحدار:", error);
    return { error: ["فشل في تحليل الانحدار"] };
  }
};

/**
 * إجراء تحليل الارتباط
 * 
 * @param {Object} question - كائن السؤال
 * @param {Array} answers - مصفوفة الإجابات
 * @returns {Object} - نتائج الارتباط
 */
const performCorrelation = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    if (validation.numericalValues.length < ANALYSIS_CONFIG.MIN_DATA_POINTS) {
      return { error: ["عدد نقاط البيانات غير كافٍ للارتباط"] };
    }

    // حساب معامل الارتباط
    const x = validation.filteredAnswers.map((_, i) => i + 1);
    const y = validation.numericalValues;
    const correlationValue = sampleCorrelation(x, y);

    // تحديد قوة واتجاه الارتباط
    let strength = "ضعيف";
    if (Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.STRONG) {
      strength = "قوي";
    } else if (Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.MODERATE) {
      strength = "متوسط";
    }

    return {
      correlationValue,
      strength,
      interpretation: correlationValue > 0 ? "إيجابي" : "سلبي",
      dataPoints: x.map((xVal, i) => [xVal, y[i]])
    };
  } catch (error) {
    console.error("خطأ في تحليل الارتباط:", error);
    return { error: ["فشل في تحليل الارتباط"] };
  }
};

/**
 * إنشاء تقرير ذكاء اصطناعي متقدم
 * 
 * @param {Array} questions - مصفوفة الأسئلة
 * @param {Array} answers - مصفوفة الإجابات
 * @param {Function} setState - دالة لتحديث حالة المكون
 * @returns {Promise<Object>} - وعد بتقرير الذكاء الاصطناعي
 */
export const generateAdvancedAIReport = async (questions, answers, setState) => {
  try {
    console.log("🟢 جاري إنشاء تقرير الذكاء الاصطناعي...");

    // التحقق من صحة البيانات المدخلة
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      console.error("❌ بيانات مدخلة غير صالحة:", { questions, answers });
      throw new Error("بيانات مدخلة غير صالحة");
    }

    // تحليل كل سؤال
    const analysisResults = questions.map((question, index) => {
      const validation = validateQuestionData(question, answers);
      
      // إجراء التحليلات فقط إذا كانت البيانات صالحة
      const analyses = validation.isValid ? {
        chiSquare: performChiSquareTest(question, answers),
        regression: performLinearRegression(question, answers),
        correlation: performCorrelation(question, answers),
        summaryStats: calculateSummaryStatistics(validation.numericalValues)
      } : null;

      return {
        questionId: question.id,
        questionText: question.question_text,
        validation,
        analyses
      };
    });

    // تصفية النتائج الصالحة
    const validResults = analysisResults.filter(r => r.validation.isValid);

    if (validResults.length === 0) {
      console.warn("⚠️ لم يتم العثور على أسئلة صالحة. قد يكون تقرير الذكاء الاصطناعي فارغًا.");
    }

    // إنشاء محتوى تقرير الذكاء الاصطناعي
    const promptSections = analysisResults.map((result, index) => {
      if (!result.validation.isValid) {
        return `❌ **السؤال ${index + 1}:** ${result.questionText}\n**المشكلات:** ${result.validation.errors.join(", ")}\n**درجة الجودة:** ${result.validation.qualityScore}%`;
      }

      return `✅ **السؤال ${index + 1}:** ${result.questionText}\n- **الاستجابات:** ${result.validation.filteredAnswers.length}\n- **المتوسط:** ${result.analyses.summaryStats.mean?.toFixed(2) || 'غير متاح'}\n- **الارتباط:** ${result.analyses.correlation?.correlationValue?.toFixed(2) || 'غير متاح'} (${result.analyses.correlation?.strength || 'غير متاح'})\n- **الدلالة الإحصائية:** ${result.analyses.chiSquare?.significant ? 'نعم' : 'لا'}\n- **درجة الجودة:** ${result.validation.qualityScore}%`;
    }).join("\n\n");

    // إنشاء النص الكامل للتقرير
    const fullPrompt = `
## **تقرير تحليل الاستبانة**  

### 📖 **مقدمة**  
يقدم هذا التقرير تحليلاً متعمقاً لاستجابات الاستبانة، مع تسليط الضوء على الأنماط والرؤى الرئيسية والتوصيات القابلة للتنفيذ.  

---

### 📌 **ملخص تنفيذي**  
1. **جودة مجموعة البيانات:** ${validResults.length}/${questions.length} أسئلة صالحة  
2. **الاتجاهات والأنماط الرئيسية المحددة:**  
   - تحسين اتساق البيانات  
   - ارتباط قوي بين متغيرات معينة  
   - الحاجة إلى فئات استجابة أكثر تنوعاً  

---

### 📊 **النتائج الرئيسية**  
${promptSections}

---

### 📈 **الرؤى الإحصائية**  
- **اختبار مربع كاي:** قياس الدلالة الإحصائية للبيانات الفئوية.  
- **تحليل الانحدار:** تحديد الأنماط والعلاقات في الاستجابات العددية.  
- **الارتباط:** قياس قوة واتجاه العلاقات بين المتغيرات.  

---

### 📢 **التوصيات**  
1. تحسين هيكل الاستبانة لتحقيق اتساق أفضل للبيانات.  
2. تحسين وضوح الأسئلة لتقليل التناقضات.  
3. مزيد من تحليل الاتجاهات باستخدام النمذجة التنبؤية.  

---

### 🔎 **الخلاصة**  
يلخص هذا التقرير النتائج الرئيسية ويقدم رؤى لاتخاذ القرارات المستقبلية. تهدف التوصيات المقدمة إلى تحسين جودة واتساق جهود جمع البيانات المستقبلية.  

---

`;

    // إرسال الطلب إلى خدمة الذكاء الاصطناعي
    const aiResponse = await AIChatSession.sendMessage(fullPrompt);
    let responseText = "⚠️ استجابة الذكاء الاصطناعي فارغة.";

    // معالجة استجابة الذكاء الاصطناعي
    if (aiResponse?.response) {
      try {
        responseText = typeof aiResponse.response.text === "function"
          ? aiResponse.response.text()
          : aiResponse.response.text || "⚠️ خدمة الذكاء الاصطناعي أرجعت استجابة فارغة.";
      } catch (error) {
        console.error("❌ فشل في استخراج نص استجابة الذكاء الاصطناعي:", error);
      }
    } else {
      console.error("❌ خدمة الذكاء الاصطناعي أرجعت استجابة غير صالحة:", aiResponse);
    }

    // تحديث الحالة بتقرير الذكاء الاصطناعي
    if (setState && typeof setState === 'function') {
      setState(prev => ({
        ...prev,
        aiReport: responseText.trim() || "⚠️ لا يوجد تقرير ذكاء اصطناعي متاح.",
        analysisResults: analysisResults,
        lastUpdated: new Date().toISOString()
      }));
    }

    return {
      aiReport: responseText,
      analysisResults,
      validResultsCount: validResults.length,
      totalQuestionsCount: questions.length
    };

  } catch (error) {
    console.error("❌ فشل إنشاء التقرير:", error.message);

    // تحديث الحالة برسالة الخطأ
    if (setState && typeof setState === 'function') {
      setState(prev => ({
        ...prev,
        aiReport: `⚠️ التحليل غير متاح: ${error.message}`,
        error: error.message
      }));
    }

    return {
      aiReport: `⚠️ التحليل غير متاح: ${error.message}`,
      error: error.message
    };
  }
};
