/**
 * AIreport.js - Advanced Survey Analysis with AI
 * 
 * This module provides advanced functions for analyzing survey data and generating
 * intelligent reports using statistical methods and artificial intelligence.
 */

import { AIChatSession } from "./AIAnalysis";
import { linearRegressionLine, linearRegression, sampleCorrelation } from "simple-statistics";
import { calculateSummaryStatistics } from "../utils/statisticalFunctions";

// Configuration constants - could be moved to separate config file
const ANALYSIS_CONFIG = {
  MIN_RESPONSES: 10,
  MIN_CATEGORIES: 2,
  MIN_DATA_POINTS: 3,
  CORRELATION_THRESHOLDS: {
    STRONG: 0.7,
    MODERATE: 0.3
  },
  CHI_SQUARE_SIGNIFICANCE: 3.84, // Critical value at p=0.05, df=1
  QUALITY_SCORE_WEIGHTS: {
    RESPONSE_COUNT: 0.5,
    DATA_VALIDITY: 0.3,
    VARIANCE: 0.4
  }
};

/**
 * Validate question data and assess quality
 * 
 * @param {Object} question - Question object
 * @param {Array} answers - Array of answers
 * @returns {Object} Validation results
 */
const validateQuestionData = (question, answers) => {
  if (!question || !question.id || !Array.isArray(answers)) {
    return {
      isValid: false,
      qualityScore: 0,
      errors: ["Invalid question or answer data"],
      filteredAnswers: [],
      numericalValues: []
    };
  }

  // Filter answers for this question
  const filteredAnswers = answers.filter(a => a && a.question_id === question.id);
  
  // Extract valid numerical values
  const numericalValues = filteredAnswers
    .map(a => {
      const num = Number(a.answer_value);
      return Number.isFinite(num) ? num : null;
    })
    .filter(v => v !== null);

  const errors = [];
  let qualityScore = 1;

  // Check response count
  if (filteredAnswers.length < ANALYSIS_CONFIG.MIN_RESPONSES) {
    errors.push(`Insufficient responses (${filteredAnswers.length}/${ANALYSIS_CONFIG.MIN_RESPONSES})`);
    qualityScore *= ANALYSIS_CONFIG.QUALITY_SCORE_WEIGHTS.RESPONSE_COUNT;
  }

  // Check numerical data validity
  if (numericalValues.length === 0) {
    errors.push("No valid numerical data");
    qualityScore *= ANALYSIS_CONFIG.QUALITY_SCORE_WEIGHTS.DATA_VALIDITY;
  } else {
    // Check for zero variance
    const uniqueValues = new Set(numericalValues);
    if (uniqueValues.size === 1) {
      errors.push("Constant values detected (zero variance)");
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
 * Calculate R-squared value for linear regression
 * 
 * @param {Array} dataPoints - Array of data points [[x1,y1], [x2,y2], ...]
 * @param {Function} predictFn - Prediction function
 * @returns {number} R-squared value
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
    console.error("Error calculating R²:", error);
    return 0;
  }
};

/**
 * Perform chi-square test for independence
 * 
 * @param {Object} question - Question object
 * @param {Array} answers - Array of answers
 * @returns {Object} Test results
 */
const performChiSquareTest = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    // Calculate observed frequencies
    const observedFrequencies = validation.filteredAnswers.reduce((acc, { answer_value }) => {
      acc[answer_value] = (acc[answer_value] || 0) + 1;
      return acc;
    }, {});

    const observed = Object.values(observedFrequencies);
    if (observed.length < ANALYSIS_CONFIG.MIN_CATEGORIES) {
      return { error: ["Insufficient response categories"] };
    }

    // Calculate expected frequencies (uniform distribution)
    const total = observed.reduce((sum, val) => sum + val, 0);
    const expected = Array(observed.length).fill(total / observed.length);

    // Calculate chi-square value
    const chiSquareValue = observed.reduce((sum, obs, i) => sum + ((obs - expected[i]) ** 2) / expected[i], 0);
    const degreesOfFreedom = observed.length - 1;
    
    return {
      chiSquareValue,
      degreesOfFreedom,
      significant: chiSquareValue > ANALYSIS_CONFIG.CHI_SQUARE_SIGNIFICANCE,
      observedFrequencies
    };
  } catch (error) {
    console.error("Chi-square test error:", error);
    return { error: ["Statistical calculation failed"] };
  }
};

/**
 * Perform linear regression analysis
 * 
 * @param {Object} question - Question object
 * @param {Array} answers - Array of answers
 * @returns {Object} Regression results
 */
const performLinearRegression = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    if (validation.numericalValues.length < ANALYSIS_CONFIG.MIN_DATA_POINTS) {
      return { error: ["Insufficient data points for regression"] };
    }

    // Create regression data points
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
    console.error("Regression analysis error:", error);
    return { error: ["Regression analysis failed"] };
  }
};

/**
 * Perform correlation analysis
 * 
 * @param {Object} question - Question object
 * @param {Array} answers - Array of answers
 * @returns {Object} Correlation results
 */
const performCorrelation = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) return { error: validation.errors };

    if (validation.numericalValues.length < ANALYSIS_CONFIG.MIN_DATA_POINTS) {
      return { error: ["Insufficient data points for correlation"] };
    }

    // Calculate correlation coefficient
    const x = validation.filteredAnswers.map((_, i) => i + 1);
    const y = validation.numericalValues;
    const correlationValue = sampleCorrelation(x, y);

    // Determine correlation strength
    let strength = "Weak";
    if (Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.STRONG) {
      strength = "Strong";
    } else if (Math.abs(correlationValue) > ANALYSIS_CONFIG.CORRELATION_THRESHOLDS.MODERATE) {
      strength = "Moderate";
    }

    return {
      correlationValue,
      strength,
      interpretation: correlationValue > 0 ? "Positive" : "Negative",
      dataPoints: x.map((xVal, i) => [xVal, y[i]])
    };
  } catch (error) {
    console.error("Correlation analysis error:", error);
    return { error: ["Correlation analysis failed"] };
  }
};

/**
 * Generate advanced AI analysis report
 * 
 * @param {Array} questions - Array of questions
 * @param {Array} answers - Array of answers
 * @param {Function} setState - State update function
 * @returns {Promise<Object>} AI analysis report
 */
export const generateAdvancedAIReport = async (questions, answers, setState) => {
  try {
    console.log("🟢 Generating AI report...");

    // Validate input data
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      console.error("❌ Invalid input data:", { questions, answers });
      throw new Error("Invalid input data");
    }

    // Analyze each question
    const analysisResults = questions.map((question, index) => {
      const validation = validateQuestionData(question, answers);
      
      // Perform analyses if data is valid
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

    // Filter valid results
    const validResults = analysisResults.filter(r => r.validation.isValid);

    if (validResults.length === 0) {
      console.warn("⚠️ No valid questions found. AI report may be empty.");
    }

    // Create report content
    const promptSections = analysisResults.map((result, index) => {
      if (!result.validation.isValid) {
        return `❌ **Question ${index + 1}:** ${result.questionText}\n**Issues:** ${result.validation.errors.join(", ")}\n**Quality Score:** ${result.validation.qualityScore}%`;
      }

      return `✅ **Question ${index + 1}:** ${result.questionText}\n- **Responses:** ${result.validation.filteredAnswers.length}\n- **Mean:** ${result.analyses.summaryStats.mean?.toFixed(2) || 'N/A'}\n- **Correlation:** ${result.analyses.correlation?.correlationValue?.toFixed(2) || 'N/A'} (${result.analyses.correlation?.strength || 'N/A'})\n- **Statistical Significance:** ${result.analyses.chiSquare?.significant ? 'Yes' : 'No'}\n- **Quality Score:** ${result.validation.qualityScore}%`;
    }).join("\n\n");

    // Construct full report prompt
    const fullPrompt = `
## **Survey Analysis Report**  

### 📖 **Introduction**  
This report provides an in-depth analysis of survey responses, highlighting key patterns, insights, and actionable recommendations.  

---

### 📌 **Executive Summary**  
1. **Dataset Quality:** ${validResults.length}/${questions.length} valid questions  
2. **Key Identified Patterns:**  
   - Data consistency improvements  
   - Strong correlations between specific variables  
   - Need for more diverse response categories  

---

### 📊 **Key Findings**  
${promptSections}

---

### 📈 **Statistical Insights**  
- **Chi-Square Test:** Measuring significance of categorical data  
- **Regression Analysis:** Identifying patterns in numerical responses  
- **Correlation Analysis:** Measuring relationship strength between variables  

---

### 📢 **Recommendations**  
1. Improve survey structure for better data consistency  
2. Enhance question clarity to reduce ambiguity  
3. Further analyze trends using predictive modeling  

---

### 🔎 **Conclusion**  
This report summarizes key findings and provides insights for future decision-making. Recommendations aim to improve future data collection quality and consistency.  

---

`;

    // Send request to AI service
    const aiResponse = await AIChatSession.sendMessage(fullPrompt);
    let responseText = "⚠️ Empty AI response.";

    // Process AI response
    if (aiResponse?.response) {
      try {
        responseText = typeof aiResponse.response.text === "function"
          ? aiResponse.response.text()
          : aiResponse.response.text || "⚠️ AI service returned empty response.";
      } catch (error) {
        console.error("❌ Failed to extract AI response text:", error);
      }
    } else {
      console.error("❌ AI service returned invalid response:", aiResponse);
    }

    // Update state with AI report
    if (setState && typeof setState === 'function') {
      setState(prev => ({
        ...prev,
        aiReport: responseText.trim() || "⚠️ No AI report available.",
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
    console.error("❌ Report generation failed:", error.message);

    // Update state with error
    if (setState && typeof setState === 'function') {
      setState(prev => ({
        ...prev,
        aiReport: `⚠️ Analysis unavailable: ${error.message}`,
        error: error.message
      }));
    }

    return {
      aiReport: `⚠️ Analysis unavailable: ${error.message}`,
      error: error.message
    };
  }
};