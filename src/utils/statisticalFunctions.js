export const calculateSummaryStatistics = (answers) => {
  // Filter valid numeric values
  const values = answers
    .map((a) => parseFloat(a.answer_value))
    .filter((v) => !isNaN(v));

  // Handle empty data set
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: null,
      min: null,
      max: null,
      variance: 0,
      stdDev: 0,
    };
  }

  // Calculate Mean
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  // Calculate Variance and Standard Deviation
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Calculate Median
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[middle - 1] + sortedValues[middle]) / 2
    : sortedValues[middle];

  // Calculate Mode
  const frequency = {};
  let mode = [];
  let maxFreq = 0;
  values.forEach((value) => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = [value];
    } else if (frequency[value] === maxFreq && !mode.includes(value)) {
      mode.push(value);
    }
  });
  mode = mode.length === values.length ? null : mode; // No mode if all numbers occur equally

  // Find Minimum and Maximum
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Return all statistics
  return { mean, median, mode, min, max, variance, stdDev };
};
