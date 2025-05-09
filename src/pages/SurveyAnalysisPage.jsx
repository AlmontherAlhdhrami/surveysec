import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../assets/createClient";
import { useUser } from "@clerk/clerk-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
} from "chart.js";
import { ChartBarIcon } from "@heroicons/react/24/outline";

import {
  Bar,
  Pie,
  Line,
  Radar,
  Doughnut,
  PolarArea,
  Scatter
} from "react-chartjs-2";
import { jStat } from "jstat";
import * as ss from "simple-statistics";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateAdvancedAIReport } from "../service/AIreport";
import {encrypt,decrypt} from "../service/cryptoHelper"


// Register all chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

/**
 * Error boundary for charting errors. 
 */
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-700 rounded-lg my-4">
          <h2 className="text-xl font-bold mb-2">⚠️ Analysis Error</h2>
          <p>{this.state.error.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Generate chart data for grid questions: multipleChoiceGrid or checkboxGrid.
 * @param {Object} question - The question object with rows, columns, answers, etc.
 * @param {string} chartType - One of "Bar", "Line", "Radar", "Doughnut", "Pie", "PolarArea", "Scatter", etc.
 * @returns {Object} { labels, datasets } for use with Chart.js
 */
function generateGridChartData(question, chartType) {
  // 1) Ensure rows/columns are arrays
  const rows = Array.isArray(question.rows) ? question.rows : [];
  const columns = Array.isArray(question.columns) ? question.columns : [];

  // 2) Prepare a 2D array to count how many times rowIndex/colIndex was selected
  const rowDist = rows.map(() => columns.map(() => 0));

  // 3) Parse each answer's JSON for rowIndex + (single or multiple) col selections
  question.answers?.forEach((answer) => {
    try {
      const parsed = JSON.parse(answer.answer_value);
      // Expect { rowIndex, selections } 
      // "selections" can be a single number or an array of numbers
      if (!parsed || typeof parsed.rowIndex !== "number") return;

      const { rowIndex, selections } = parsed;
      if (Array.isArray(selections)) {
        // CHECKBOX GRID: multiple columns selected
        selections.forEach((colIndex) => {
          if (colIndex >= 0 && colIndex < columns.length) {
            rowDist[rowIndex][colIndex] += 1;
          }
        });
      } else if (typeof selections === "number") {
        // MULTIPLE-CHOICE GRID: single column
        const colIndex = selections;
        if (colIndex >= 0 && colIndex < columns.length) {
          rowDist[rowIndex][colIndex] += 1;
        }
      }
    } catch (err) {
      // skip invalid JSON
    }
  });

  // 4) Depending on chartType, produce different dataset structures

  const type = chartType?.toLowerCase() || "";
  // A) For "Scatter" or unknown chart types, return empty
  if (type === "scatter") {
    // Grid data doesn't translate well to scatter points:
    return { labels: [], datasets: [] };
  }

  // B) For "Pie", "Doughnut", "PolarArea", we typically have ONE dataset with columns as labels
  if (["pie", "doughnut", "polararea"].includes(type)) {
    // Combine all rows so each column's value = sum of that column across all rows
    const combinedByColumn = columns.map((_, colIndex) => {
      let sum = 0;
      for (let r = 0; r < rows.length; r++) {
        sum += rowDist[r][colIndex];
      }
      return sum;
    });

    return {
      labels: columns,
      datasets: [
        {
          label: question.question_text ?? "Grid Results",
          data: combinedByColumn,
          backgroundColor: [
            // Provide as many color entries as you want
            "rgba(75,192,192,0.6)",
            "rgba(255,99,132,0.6)",
            "rgba(54,162,235,0.6)",
            "rgba(255,206,86,0.6)",
            "rgba(153,102,255,0.6)",
            "rgba(255,159,64,0.6)"
          ]
        }
      ]
    };
  }

  // C) For "Bar", "Line", "Radar", etc.: multiple datasets, one per row
  const datasets = rows.map((rowLabel, rowIndex) => ({
    label: rowLabel,
    data: rowDist[rowIndex],
    backgroundColor: [
      // Provide as many color entries as you want
      "rgba(75,192,192,0.6)",
      "rgba(255,99,132,0.6)",
      "rgba(54,162,235,0.6)",
      "rgba(255,206,86,0.6)",
      "rgba(153,102,255,0.6)",
      "rgba(255,159,64,0.6)"
    ]
  }));

  return {
    labels: columns,
    datasets
  };
}

const SurveyAnalysisPage = () => {
  const { user } = useUser();
  const [state, setState] = useState({
    surveys: [],
    selectedSurvey: null,
    questions: [],
    answers: [],
    aiReport: "",
    statsResults: [],
    loading: false,
    error: null,
    chartType: "Bar"
  });

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Response Distribution" }
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    }
  };

  // Fetch surveys for the logged-in user
  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("surveys")
          .select("id, title, description")
          .eq("user_id", user.id);

          const decryptedSurveys = (data || []).map(s => {
            try {
              return {
                ...s,
                title: decrypt(s.title),
                description: decrypt(s.description)
              };
            } catch (err) {
              console.error("Decryption failed:", err);
              return s; // fallback to original
            }
          });
          
          setState(prev => ({
            ...prev,
            surveys: decryptedSurveys,
            error: error ? "Failed to load surveys" : null
          }));
          
      } catch (error) {
        setState(prev => ({ ...prev, error: "Network error loading surveys" }));
      }
    };
    fetchSurveys();
  }, [user]);

  /**
   * Fetches questions/answers for the chosen survey,
   * builds an AI report, and marks grid questions.
   */
  const processSurveyData = useCallback(async surveyId => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 1) Fetch questions
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyId);

      if (qError || !questions?.length) {
        throw new Error(qError?.message || "No questions found");
      }

      // 2) Fetch answers
      const questionIds = questions.map(q => q.id);
      const { data: answers, error: aError } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questionIds);

      if (aError) throw new Error(aError.message);

      // 3) Generate AI Report
      const report = await generateAdvancedAIReport(questions, answers, setState);

      // 4) Process questions -> mark isGrid, compute stats if not a grid
      const processedQuestions = questions.map(question => {
        const qAnswers = answers.filter(a => a.question_id === question.id);
        const numericValues = qAnswers
          .map(a => parseFloat(a.answer_value))
          .filter(v => !isNaN(v));

        // Check if grid
        const isGrid = ["multipleChoiceGrid", "checkboxGrid"].includes(
          question.question_type
        );

        return {
          ...question,
          answers: qAnswers,
          isGrid,
          isNumerical: !isGrid && numericValues.length > 0,
          stats: !isGrid ? calculateSummaryStatistics(numericValues) : {},
          tests: !isGrid
            ? numericValues.length > 0
              ? calculateNumericalTests(numericValues)
              : calculateCategoricalTests(qAnswers)
            : {}
        };
      });

      setState(prev => ({
        ...prev,
        questions: processedQuestions,
        answers,
        statsResults: report?.analysisResult || [],
        aiReport: report?.aiReport || "⚠️ No AI report available.",
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        aiReport: "⚠️ AI report generation failed."
      }));
    }
  }, []);

  // ========== STATISTICAL FUNCTIONS (Unchanged) ==========
  const calculateSummaryStatistics = values => {
    if (!values?.length) return {};
    try {
      return {
        mean: ss.mean(values),
        median: ss.median(values),
        min: ss.min(values),
        max: ss.max(values),
        variance: ss.variance(values),
        stdDev: ss.standardDeviation(values),
        count: values.length
      };
    } catch {
      return {};
    }
  };

  const calculateNumericalTests = values => {
    try {
      const xValues = Array.from({ length: values.length }, (_, i) => i);
      return {
        correlation: performCorrelation(xValues, values),
        regression: performLinearRegression(xValues, values),
        tTest: performTTest(values, []),
        anova: performAnova([values, []])
      };
    } catch {
      return {
        correlation: { correlationValue: null, significant: false },
        regression: { slope: null, intercept: null, predict: () => null },
        tTest: { tValue: null, significant: false },
        anova: { fValue: null, significant: false }
      };
    }
  };

  const calculateCategoricalTests = answers => {
    try {
      const counts =
        answers?.reduce((acc, { answer_value }) => {
          acc[answer_value] = (acc[answer_value] || 0) + 1;
          return acc;
        }, {}) || {};

      const observed = Object.values(counts);
      const total = observed.reduce((sum, val) => sum + val, 0);
      const expected = observed.map(() => total / observed.length);

      return {
        chiSquare: performChiSquare(observed, expected),
        frequencyDistribution: counts
      };
    } catch {
      return {
        chiSquare: { chiSquareValue: null, significant: false },
        frequencyDistribution: {}
      };
    }
  };

  const performChiSquare = (observed, expected) => {
    try {
      const chiSquareValue = observed.reduce(
        (sum, obs, i) => sum + Math.pow(obs - expected[i], 2) / expected[i],
        0
      );
      const df = observed.length - 1;
      return {
        chiSquareValue,
        degreesOfFreedom: df,
        pValue: 1 - jStat.chisquare.cdf(chiSquareValue, df),
        significant: chiSquareValue > jStat.chisquare.inv(0.95, df)
      };
    } catch {
      return { chiSquareValue: null, significant: false };
    }
  };

  const performLinearRegression = (x, y) => {
    try {
      const regression = ss.linearRegression(x.map((xi, i) => [xi, y[i]]));
      return {
        slope: regression.m,
        intercept: regression.b,
        predict: ss.linearRegressionLine(regression)
      };
    } catch {
      return { slope: null, intercept: null, predict: () => null };
    }
  };

  const performCorrelation = (x, y) => {
    try {
      return {
        correlationValue: ss.sampleCorrelation(x, y),
        significant: Math.abs(ss.sampleCorrelation(x, y)) > 0.5
      };
    } catch {
      return { correlationValue: null, significant: false };
    }
  };

  const performTTest = (group1, group2) => {
    try {
      return {
        tValue: jStat.ttest(group1, group2),
        significant: Math.abs(jStat.ttest(group1, group2)) > 1.96
      };
    } catch {
      return { tValue: null, significant: false };
    }
  };

  const performAnova = groups => {
    try {
      const fValue = jStat.anovaftest(...groups);
      return {
        fValue,
        significant:
          fValue > jStat.ftest(0.95, groups.length - 1, groups.flat().length - groups.length)
      };
    } catch {
      return { fValue: null, significant: false };
    }
  };

  // ========== CHART DATA FUNCTIONS ==========

  /**
   * Non-grid chart data generator
   */
  const generateChartData = question => {
    const answerCount =
      question?.answers?.reduce((acc, { answer_value }) => {
        acc[answer_value] = (acc[answer_value] || 0) + 1;
        return acc;
      }, {}) || {};

    return {
      labels: Object.keys(answerCount),
      datasets: [
        {
          label: "Responses",
          data: Object.values(answerCount),
          backgroundColor: [
            "rgba(116, 4, 29, 0.6)",
            "rgba(0, 121, 202, 0.6)",
            "rgba(218, 156, 0, 0.6)",
            "rgba(4, 78, 78, 0.6)",
            "rgba(19, 0, 57, 0.6)",
            "rgba(128, 64, 0, 0.6)"
          ],
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 2
        }
      ]
    };
  };

  /**
   * Regression data for scatter + line
   */
  const generateRegressionChart = question => {
    try {
      const dataPoints =
        question.answers
          ?.map((a, i) => ({ x: i, y: parseFloat(a.answer_value) }))
          ?.filter(p => !isNaN(p.y)) || [];

      return {
        datasets: [
          {
            type: "scatter",
            label: "Responses",
            data: dataPoints,
            backgroundColor: "#EF4444"
          },
          {
            type: "line",
            label: "Trend",
            data: dataPoints.map(p => ({
              x: p.x,
              y: question.tests.regression?.predict?.(p.x)
            })),
            borderColor: "#3B82F6",
            borderWidth: 2,
            tension: 0.1
          }
        ]
      };
    } catch {
      return { datasets: [] };
    }
  };

  // ========== CHART COMPONENT SWITCHER ==========

  const ChartComponent = ({ question }) => {
    // 1) If it's a grid question, generate grid data with the *selected* chartType
    if (question.isGrid) {
      const gridData = generateGridChartData(question, state.chartType);

      // Return the chart that matches state.chartType
      return (
        <div className="h-64">
          {
            {
              Bar: <Bar data={gridData} options={chartOptions} />,
              Pie: <Pie data={gridData} options={chartOptions} />,
              Line: <Line data={gridData} options={chartOptions} />,
              Radar: <Radar data={gridData} options={chartOptions} />,
              Doughnut: <Doughnut data={gridData} options={chartOptions} />,
              PolarArea: <PolarArea data={gridData} options={chartOptions} />,
              Scatter: <Scatter data={gridData} options={chartOptions} />
            }[state.chartType] || (
              // default if not recognized:
              <Bar data={gridData} options={chartOptions} />
            )
          }
        </div>
      );
    }

    // 2) Otherwise, non-grid question => use existing logic
    if (state.chartType === "Scatter" && question.isNumerical) {
      // numeric => scatter regression
      return (
        <div className="h-64">
          <Scatter
            data={generateRegressionChart(question)}
            options={chartOptions}
          />
        </div>
      );
    }

    // 3) Non-grid, non-scatter
    const chartData = generateChartData(question);

    return (
      <div className="h-64">
        {
          {
            Bar: <Bar data={chartData} options={chartOptions} />,
            Pie: <Pie data={chartData} options={chartOptions} />,
            Line: <Line data={chartData} options={chartOptions} />,
            Radar: <Radar data={chartData} options={chartOptions} />,
            Doughnut: <Doughnut data={chartData} options={chartOptions} />,
            PolarArea: <PolarArea data={chartData} options={chartOptions} />
          }[state.chartType] || (
            <Bar data={chartData} options={chartOptions} />
          )
        }
      </div>
    );
  };

  /**
   * Renders the AI-generated professional report
   */
  const renderProfessionalReport = () => {
    if (!state.aiReport || state.aiReport.trim() === "⚠️ No AI report available.") {
      return (
        <div className="bg-yellow-50 p-6 rounded-xl shadow text-yellow-700 mb-8">
          <h3 className="text-xl font-semibold mb-4">⚠️ AI Report Not Available</h3>
          <p>Ensure the survey has enough responses to generate meaningful insights.</p>
        </div>
      );
    }

    const reportContent = String(state.aiReport);
    const reportLines = reportContent.split("\n").filter(line => line.trim());

    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Survey Analysis Report</h2>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-50 p-6 rounded-xl mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📌 Executive Summary</h3>
          <p className="text-gray-600">
            {reportLines.length > 0 ? reportLines[0] : "No summary available"}
          </p>
        </div>

        {/* Key Findings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Key Findings
          </h3>

          {state.questions.map((question, index) => (
            <div key={question.id} className="bg-gray-50 p-5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">Question {index + 1}</h4>
                <span className="text-sm px-2 py-1 rounded bg-white text-gray-600">
                  {question.isGrid
                    ? "Grid"
                    : question.isNumerical
                    ? "Numerical"
                    : "Multiple Choice"}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{question.question_text}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded">
                  <p className="text-gray-500">Responses</p>
                  <p className="font-semibold">{question.answers?.length || 0}</p>
                </div>
                <div className="bg-white p-3 rounded">
                  <p className="text-gray-500">Most Common</p>
                  <p className="font-semibold">
                    {question.isGrid
                      ? "N/A" // or logic to show most-chosen row/column if you want
                      : question.isNumerical
                      ? question.stats?.mean?.toFixed(2)
                      : Object.entries(question.tests?.frequencyDistribution || {})
                          .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations Section */}
        <div className="bg-green-50 p-6 rounded-xl mt-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
            Action Plan & Recommendations
          </h3>

          <div className="space-y-4">
            {reportLines
              .filter(line => line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3."))
              .map((rec, i) => (
                <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                  <div className="flex-shrink-0 mt-1 text-green-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600">{rec}</p>
                </div>
              ))}

            {/* If no numbered recommendations in the AI text */}
            {reportLines.filter(line => line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3."))
              .length === 0 && (
              <p className="text-gray-600 italic">
                No recommendations generated. Ensure the survey has enough responses for insights.
              </p>
            )}
          </div>
        </div>

        {/* Full Report */}
        <div className="bg-gray-100 p-6 rounded-xl mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 Full Report</h3>
          <div className="text-gray-700 space-y-2">
            {reportLines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Survey Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Data-Driven Insights Platform</p>
        </header>

        {state.error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-700">
            ⚠️ {state.error}
          </div>
        )}

        {!state.selectedSurvey ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.surveys?.map(survey => (
              <button
                key={survey.id}
                onClick={() => {
                  setState(prev => ({ ...prev, selectedSurvey: survey }));
                  processSurveyData(survey.id);
                }}
                className="p-6 bg-gradient-to-r from-violet-900 to-indigo-600 rounded-xl shadow-md hover:shadow-lg transition-all text-left flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  <ChartBarIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{survey.title}</h3>
                  <p className="text-lg font-semibold text-white overflow-hidden line-clamp-2">
                    {survey.description}
                  </p>
                  <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition duration-300 ease-in-out mt-2">
                    <span>Analyze</span>
                    <i className="fas fa-arrow-right text-white"></i>
                  </button>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Survey Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-semibold">{state.selectedSurvey.title}</h2>
              <div className="flex gap-4 w-full sm:w-auto">
                <select
                  value={state.chartType}
                  onChange={e => setState(prev => ({ ...prev, chartType: e.target.value }))}
                  className="p-2 border rounded w-full sm:w-48"
                >
                  {["Bar", "Line", "Pie", "Radar", "Doughnut", "PolarArea", "Scatter"].map(type => (
                    <option key={type} value={type}>
                      {type} Chart
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setState(prev => ({ ...prev, selectedSurvey: null }))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded whitespace-nowrap"
                >
                  ← Back to Surveys
                </button>
              </div>
            </div>

            {/* Main Content */}
            {state.loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* Question Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {state.questions?.map(question => (
                    <div key={question.id} className="bg-white p-6 rounded-xl shadow">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">{question.question_text}</h3>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{question.answers?.length || 0} responses</p>
                          <p>
                            {question.isGrid
                              ? "Grid Question"
                              : question.isNumerical
                              ? "Numerical data"
                              : "Categorical data"}
                          </p>
                        </div>
                      </div>

                      <ChartComponent question={question} />

                      {/* For non-grid, show stats */}
                      {question.isGrid ? null : (
                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                          <div className="p-3 bg-blue-50 rounded">
                            <p className="font-medium">Central Tendency</p>
                            <p>Mean: {question.stats?.mean?.toFixed(2) || "N/A"}</p>
                            <p>Median: {question.stats?.median?.toFixed(2) || "N/A"}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded">
                            <p className="font-medium">Spread</p>
                            <p>
                              Range: {question.stats?.min ?? "N/A"} - {question.stats?.max ?? "N/A"}
                            </p>
                            <p>Std Dev: {question.stats?.stdDev?.toFixed(2) || "N/A"}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* AI Report */}
                {renderProfessionalReport()}
              </>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SurveyAnalysisPage;
