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

// Data Validation Core
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

// Enhanced Statistical Functions
const performChiSquareTest = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) {
      return { error: validation.errors };
    }

    const observedFrequencies = validation.filteredAnswers
      .reduce((acc, { answer_value }) => {
        acc[answer_value] = (acc[answer_value] || 0) + 1;
        return acc;
      }, {});

    const observed = Object.values(observedFrequencies);
    if (observed.length < ANALYSIS_CONFIG.MIN_CATEGORIES) {
      return { error: ["Insufficient response categories"] };
    }

    // ... rest of original chi-square implementation ...

  } catch (error) {
    console.error("Chi-Square Error:", error);
    return { error: ["Statistical calculation failed"] };
  }
};

const performLinearRegression = (question, answers) => {
  try {
    const validation = validateQuestionData(question, answers);
    if (!validation.isValid) {
      return { error: validation.errors };
    }

    // ... rest of original regression implementation ...

  } catch (error) {
    console.error("Regression Error:", error);
    return { error: ["Regression analysis failed"] };
  }
};

// AI Report Generator
export const generateAdvancedAIReport = async (questions, answers) => {
  try {
    // Input Validation
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      throw new Error("Invalid input data structures");
    }

    // Data Preparation
    const analysisResults = questions.map(question => {
      const validation = validateQuestionData(question, answers);
      const analyses = validation.isValid ? {
        chiSquare: performChiSquareTest(question, answers),
        regression: performLinearRegression(question, answers),
        correlation: performCorrelation(answers, question.id),
        summaryStats: calculateSummaryStatistics(validation.numericalValues)
      } : null;

      return {
        questionId: question.id,
        questionText: question.question_text,
        validation,
        analyses
      };
    });

    // Quality Metrics
    const validResults = analysisResults.filter(r => r.validation.isValid);
    const qualityScore = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.validation.qualityScore, 0) / validResults.length
      : 0;

    // AI Prompt Construction
    const promptSections = analysisResults.map((result, index) => {
      if (!result.validation.isValid) {
        return `[INVALID] Question ${index + 1}: ${result.questionText}\n` +
               `- Issues: ${result.validation.errors.join(", ")}\n` +
               `- Quality Score: ${result.validation.qualityScore}%`;
      }

      return `[VALID] Question ${index + 1}: ${result.questionText}\n` +
             `- Responses: ${result.validation.filteredAnswers.length}\n` +
             `- Mean: ${result.analyses.summaryStats.mean?.toFixed(2) || 'N/A'}\n` +
             `- Correlation: ${result.analyses.correlation?.correlationValue?.toFixed(2) || 'N/A'}\n` +
             `- Significance: ${result.analyses.chiSquare?.significant ? 'Yes' : 'No'}\n` +
             `- Quality Score: ${result.validation.qualityScore}%`;
    });

    const fullPrompt = `As a senior data analyst, create a report with:
1. Executive Summary
2. Data Quality Assessment
3. Statistical Insights
4. Recommendations
5. Validation Summary

Dataset Quality: ${qualityScore.toFixed(1)}%
Analysis Data:\n${promptSections.join("\n\n")}`;

    // AI Analysis
    const aiResponse = await AIChatSession.sendMessage(fullPrompt);
    
    if (!aiResponse?.response?.text?.trim()) {
      throw new Error("AI service returned empty response");
    }

    // Final Output Structure
    return {
      aiReport: aiResponse.response.text,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        validQuestions: validResults.length,
        qualityScore: qualityScore.toFixed(1),
        warnings: analysisResults.filter(r => !r.validation.isValid).map(r => ({
          question: r.questionText,
          issues: r.validation.errors
        }))
      },
      analysisData: analysisResults
    };

  } catch (error) {
    console.error("Report Generation Failed:", error);
    return {
      aiReport: `Analysis unavailable: ${error.message}\n\nCommon Solutions:\n` +
                "1. Verify all questions have >10 responses\n" +
                "2. Ensure numerical questions receive valid numbers\n" +
                "3. Check API service availability",
      metadata: {
        error: true,
        errorDetails: error.message
      }
    };
  }
};