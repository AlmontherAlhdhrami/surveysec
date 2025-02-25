import { AIChatSession } from "./AIAnalysis";
import { linearRegressionLine, linearRegression, sampleCorrelation } from "simple-statistics";

// ✅ Chi-Square Test Function
const performChiSquareTest = (answers, questionId) => {
  const observedFrequencies = {};

  // Count observed frequencies
  answers
    .filter((a) => a.question_id === questionId)
    .forEach((answer) => {
      observedFrequencies[answer.answer_value] = (observedFrequencies[answer.answer_value] || 0) + 1;
    });

  const observed = Object.values(observedFrequencies);

  if (observed.length === 0) {
    return {
      chiSquareValue: 0,
      significant: false,
    };
  }

  // Calculate Expected Frequencies (Assuming equal distribution)
  const total = observed.reduce((sum, value) => sum + value, 0);
  const expected = Array(observed.length).fill(total / observed.length);

  // Manually compute chi-square statistic
  const chiSquareValue = observed.reduce((sum, obs, i) => {
    const exp = expected[i];
    return sum + ((obs - exp) ** 2) / exp;
  }, 0);

  return {
    chiSquareValue,
    significant: chiSquareValue > 3.84, // Critical value for p = 0.05, df = 1
  };
};

// ✅ Linear Regression Function (Enhanced)
const performLinearRegression = (answers, questionId) => {
  const data = answers
    .filter((a) => a.question_id === questionId)
    .map((answer, index) => [index + 1, parseFloat(answer.answer_value) || 0]);

  if (data.length < 2) return { slope: null, intercept: null, message: "Insufficient data for regression." };

  const regression = linearRegression(data);
  const regressionLine = linearRegressionLine(regression);

  return {
    slope: regression.m,
    intercept: regression.b,
    predict: (value) => regressionLine(value),
  };
};

// ✅ Correlation Analysis (Improved Validation)
const performCorrelation = (answers, questionId) => {
  const values = answers
    .filter((a) => a.question_id === questionId)
    .map((answer) => parseFloat(answer.answer_value) || 0);

  if (values.length < 2) {
    return {
      correlationValue: null,
      strongCorrelation: false,
      message: "Not enough data for correlation analysis.",
    };
  }

  const x = Array.from({ length: values.length }, (_, i) => i + 1);
  try {
    const correlationValue = sampleCorrelation(x, values);
    return {
      correlationValue,
      strongCorrelation: Math.abs(correlationValue) > 0.7,
    };
  } catch (error) {
    console.error("Correlation Error:", error);
    return {
      correlationValue: null,
      strongCorrelation: false,
      message: "Error calculating correlation.",
    };
  }
};

// ✅ Generate Advanced AI Report (Improved and Professional)
export const generateAdvancedAIReport = async (questions, answers) => {
  // Formatting survey data for AI analysis
  const formattedData = questions
    .map((q) => {
      const relatedAnswers = answers.filter((a) => a.question_id === q.id);
      return `${q.question_text}: ${relatedAnswers.map((a) => a.answer_value).join(", ")}`;
    })
    .join("\n");

  // Perform statistical analysis for each question
  const analysisResult = questions.map((q) => {
    const chiSquare = performChiSquareTest(answers, q.id);
    const regression = performLinearRegression(answers, q.id);
    const correlationResult = performCorrelation(answers, q.id);

    return {
      question: q.question_text,
      chiSquare,
      regression,
      correlation: correlationResult,
    };
  });

  // Generating AI Report
  const prompt = `
  Analyze this survey data in detail. Include the following:
  - Trends and patterns.
  - Most common answers and distributions.
  - Significance of responses.
  - Suggestions for improving future surveys based on the data.
  Survey Data:\n${formattedData}`;

  const aiResponse = await AIChatSession.sendMessage(prompt);

  // Returning AI and Statistical Analysis Results
  return {
    aiText: aiResponse.response.text,
    analysisResult,
  };
};
