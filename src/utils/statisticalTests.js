import { jStat } from "jstat";
import * as ss from "simple-statistics";

// ✅ Chi-Square Test
export const performChiSquare = (observed, expected) => {
  if (observed.length !== expected.length) {
    throw new Error("Observed and Expected arrays must have the same length.");
  }

  // Check for valid expected frequencies
  if (expected.some((exp) => exp === 0)) {
    throw new Error("Expected frequencies must be non-zero.");
  }

  // Manually calculate chi-square statistic
  const chiSquareValue = observed.reduce((sum, obs, i) => {
    const exp = expected[i];
    return sum + ((obs - exp) ** 2) / exp;
  }, 0);

  // Assuming a significance level of 0.05 with (n-1) degrees of freedom
  const degreesOfFreedom = observed.length - 1;
  const criticalValue = jStat.chisquare.inv(0.95, degreesOfFreedom); // p = 0.05

  return {
    chiSquareValue,
    degreesOfFreedom,
    significant: chiSquareValue > criticalValue,
  };
};

// ✅ Linear Regression
export const performLinearRegression = (x, y) => {
  if (x.length !== y.length || x.length < 2) {
    return { slope: null, intercept: null, message: "Insufficient data for regression." };
  }

  const regression = ss.linearRegression(x.map((xi, index) => [xi, y[index]]));
  const line = ss.linearRegressionLine(regression);

  return {
    slope: regression.m,
    intercept: regression.b,
    predict: (value) => line(value),
  };
};

// ✅ Correlation Analysis (Pearson)
export const performCorrelation = (x, y) => {
  if (x.length < 2 || y.length < 2) {
    return {
      correlationValue: null,
      strongCorrelation: false,
      message: "Insufficient data for correlation analysis",
    };
  }

  try {
    const correlationValue = ss.sampleCorrelation(x, y);
    return {
      correlationValue,
      strongCorrelation: Math.abs(correlationValue) > 0.7,
    };
  } catch (error) {
    console.error("Correlation Error:", error);
    return {
      correlationValue: null,
      strongCorrelation: false,
      message: "Error during correlation calculation",
    };
  }
};

// ✅ T-Test between two groups
export const performTTest = (group1, group2) => {
  if (group1.length < 2 || group2.length < 2) {
    return {
      tValue: null,
      significant: false,
      message: "Insufficient data for T-Test",
    };
  }

  const mean1 = jStat.mean(group1);
  const mean2 = jStat.mean(group2);
  const pooledVariance =
    ((jStat.variance(group1, true) * (group1.length - 1)) +
      (jStat.variance(group2, true) * (group2.length - 1))) /
    (group1.length + group2.length - 2);

  const standardError = Math.sqrt(pooledVariance * (1 / group1.length + 1 / group2.length));
  const tValue = (mean1 - mean2) / standardError;

  const degreesOfFreedom = group1.length + group2.length - 2;
  const criticalValue = jStat.studentt.inv(0.975, degreesOfFreedom); // Two-tailed at 95% confidence

  return {
    tValue,
    significant: Math.abs(tValue) > criticalValue,
  };
};

// ✅ ANOVA for multiple groups
export const performAnova = (groups) => {
  if (groups.some((group) => group.length < 2)) {
    return {
      fValue: null,
      significant: false,
      message: "All groups must have at least two data points for ANOVA.",
    };
  }

  try {
    const fValue = jStat.anovaftest(...groups);
    const pValue = 1 - jStat.centralF.cdf(fValue, groups.length - 1, groups.flat().length - groups.length);
    return {
      fValue,
      pValue,
      significant: pValue < 0.05, // p-value < 0.05 means significant
    };
  } catch (error) {
    console.error("ANOVA Error:", error);
    return {
      fValue: null,
      pValue: null,
      significant: false,
      message: "Error during ANOVA calculation.",
    };
  }
};
