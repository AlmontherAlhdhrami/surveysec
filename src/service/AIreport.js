import { AIChatSession } from "./AIAnalysis";
import { linearRegressionLine, linearRegression, sampleCorrelation } from "simple-statistics";
import { calculateSummaryStatistics } from "../utils/statisticalFunctions";

// Configuration Constants
const ANALYSIS_CONFIG = {
  MIN_RESPONSES: 10,
  MIN_CATEGORIES: 2,
  MIN_DATA_POINTS: 3,
  CORRELATION_THRESHOLDS: {
    STRONG: 0.7,
    MODERATE: 0.3
  }
};

// ** Data Validation Core **
const validateQuestionData = (question, answers) => {
  const filteredAnswers = answers.filter(a => a.question_id === question.id);
  const numericalValues = filteredAnswers
    .map(a => {
      const num = Number(a.answer_value);
      return Number.isFinite(num) ? num : null;
    })
    .filter(v => v !== null);

  const errors = [];
  let qualityScore = 1;

  // Response Count Validation
  if (filteredAnswers.length < ANALYSIS_CONFIG.MIN_RESPONSES) {
    errors.push(`Insufficient responses (${filteredAnswers.length}/${ANALYSIS_CONFIG.MIN_RESPONSES})`);
    qualityScore *= 0.5;
  }

  // Numerical Data Validation
  if (numericalValues.length === 0) {
    errors.push("No valid numerical data");
    qualityScore *= 0.3;
  } else {
    // Zero Variance Check
    const uniqueValues = new Set(numericalValues);
    if (uniqueValues.size === 1) {
      errors.push("Constant values detected");
      qualityScore *= 0.4;
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

// ** Statistical Tests & Analysis **
const performChiSquareTest = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    const observedFrequencies = validation.filteredAnswers.reduce((acc, { answer_value }) => {
      acc[answer_value] = (acc[answer_value] || 0) + 1;
      return acc;
    }, {});

    const observed = Object.values(observedFrequencies);
    if (observed.length < ANALYSIS_CONFIG.MIN_CATEGORIES) return { error: ["Insufficient response categories"] };

    // Expected frequencies assuming uniform distribution
    const total = observed.reduce((sum, val) => sum + val, 0);
    const expected = Array(observed.length).fill(total / observed.length);

    // Calculate Chi-Square
    const chiSquareValue = observed.reduce((sum, obs, i) => sum + ((obs - expected[i]) ** 2) / expected[i], 0);
    const degreesOfFreedom = observed.length - 1;
    
    return {
      chiSquareValue,
      degreesOfFreedom,
      significant: chiSquareValue > 3.84, // Critical Value at p=0.05, df=1
    };
  } catch (error) {
    return { error: ["Statistical calculation failed"] };
  }
};

const performLinearRegression = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    const dataPoints = validation.filteredAnswers.map((a, index) => [index + 1, Number(a.answer_value)]);
    const regression = linearRegression(dataPoints);
    const predict = linearRegressionLine(regression);

    return {
      slope: regression.m,
      intercept: regression.b,
      rSquared: calculateRSquared(dataPoints, predict),
      equation: `y = ${regression.m.toFixed(2)}x + ${regression.b.toFixed(2)}`
    };
  } catch (error) {
    return { error: ["Regression analysis failed"] };
  }
};

const performCorrelation = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    const x = validation.filteredAnswers.map((_, i) => i + 1);
    const y = validation.numericalValues;
    const correlationValue = sampleCorrelation(x, y);

    return {
      correlationValue,
      strength: Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.STRONG
        ? "Strong"
        : Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.MODERATE
        ? "Moderate"
        : "Weak",
      interpretation: correlationValue > 0 ? "Positive" : "Negative"
    };
  } catch (error) {
    return { error: ["Correlation analysis failed"] };
  }
};

// ** AI Report Generator **
export const generateAdvancedAIReport = async (questions, answers, setState) => {
  try {
    console.log("🟢 Generating AI report...");

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      console.error("❌ Invalid input data:", { questions, answers });
      throw new Error("Invalid input data");
    }

    const analysisResults = questions.map((question, index) => {
      const validation = validateQuestionData(question, answers);
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

    const validResults = analysisResults.filter(r => r.validation.isValid);

    if (validResults.length === 0) {
      console.warn("⚠️ No valid questions found. AI report may be empty.");
    }

    // Generate AI Report Content
    const promptSections = analysisResults.map((result, index) => {
      if (!result.validation.isValid) {
        return `❌ **Question ${index + 1}:** ${result.questionText}\n**Issues:** ${result.validation.errors.join(", ")}\n**Quality Score:** ${result.validation.qualityScore}%`;
      }

      return `✅ **Question ${index + 1}:** ${result.questionText}\n- **Responses:** ${result.validation.filteredAnswers.length}\n- **Mean:** ${result.analyses.summaryStats.mean?.toFixed(2) || 'N/A'}\n- **Correlation:** ${result.analyses.correlation?.correlationValue?.toFixed(2) || 'N/A'} (${result.analyses.correlation?.strength || 'N/A'})\n- **Significance:** ${result.analyses.chiSquare?.significant ? 'Yes' : 'No'}\n- **Quality Score:** ${result.validation.qualityScore}%`;
    }).join("\n\n");

    const fullPrompt = `
## **Survey Analysis Report**  

### 📖 **Introduction**  
This report provides an in-depth analysis of the survey responses, highlighting key patterns, insights, and actionable recommendations.  

---

### 📌 **Executive Summary**  
1. **Dataset Quality:** ${validResults.length}/${questions.length} valid questions  
2. **Key Trends and Patterns Identified:**  
   - Improved data consistency  
   - Strong correlation between certain variables  
   - Need for more diversified response categories  

---

### 📊 **Key Findings**  
${promptSections}

---

### 📈 **Statistical Insights**  
- **Chi-Square Test:** Statistical significance measured for categorical data.  
- **Regression Analysis:** Identifies patterns and relationships in numerical responses.  
- **Correlation:** Measures the strength and direction of relationships between variables.  

---

### 📢 **Recommendations**  
1. Improve survey structure for better data consistency.  
2. Optimize question clarity to reduce inconsistencies.  
3. Further analyze trends using predictive modeling.  

---

### 🔎 **Conclusion**  
This report summarizes the key findings and provides insights for future decision-making. The recommendations provided aim to improve the quality and consistency of future data collection efforts.  

---

`;

    const aiResponse = await AIChatSession.sendMessage(fullPrompt);
    let responseText = "⚠️ AI response is empty.";

    if (aiResponse?.response) {
      try {
        responseText = typeof aiResponse.response.text === "function"
          ? aiResponse.response.text()
          : aiResponse.response.text || "⚠️ AI service returned an empty response.";
      } catch (error) {
        console.error("❌ Failed to extract AI response text:", error);
      }
    } else {
      console.error("❌ AI Service returned an invalid response:", aiResponse);
    }

    // ✅ Update state with AI report
    setState(prev => ({
      ...prev,
      aiReport: responseText.trim() || "⚠️ No AI report available."
    }));

    return {
      aiReport: responseText
    };

  } catch (error) {
    console.error("❌ Report Generation Failed:", error.message);

    setState(prev => ({
      ...prev,
      aiReport: `⚠️ Analysis unavailable: ${error.message}`
    }));

    return {
      aiReport: `⚠️ Analysis unavailable: ${error.message}`
    };
  }
};
