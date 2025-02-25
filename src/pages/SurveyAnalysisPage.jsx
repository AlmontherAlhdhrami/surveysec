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
} from 'chart.js';
import { Bar, Pie, Line, Radar, Doughnut, PolarArea, Scatter } from 'react-chartjs-2';
import { jStat } from "jstat";
import * as ss from "simple-statistics";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateAdvancedAIReport } from "../service/AIreport";

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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Response Distribution' }
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } }
    }
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("surveys")
          .select("id, title")
          .eq("user_id", user.id);

        setState(prev => ({
          ...prev,
          surveys: error ? [] : data || [],
          error: error ? "Failed to load surveys" : null
        }));
      } catch (error) {
        setState(prev => ({ ...prev, error: "Network error loading surveys" }));
      }
    };
    fetchSurveys();
  }, [user]);

  const processSurveyData = useCallback(async (surveyId) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyId);

      if (qError || !questions?.length) throw new Error(qError?.message || "No questions found");

      // Fetch answers
      const questionIds = questions.map(q => q.id);
      const { data: answers, error: aError } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questionIds);

      if (aError) throw new Error(aError.message);

      // Generate AI Report
      let aiText = "Analyzing responses...";
      let analysisResult = [];
      try {
        const report = await generateAdvancedAIReport(questions, answers);
        aiText = typeof report?.aiText === 'string' ? report.aiText : "Analysis unavailable";
        analysisResult = Array.isArray(report?.analysisResult) ? report.analysisResult : [];
      } catch (aiError) {
        console.error("AI Analysis error:", aiError);
        aiText = "AI insights temporarily unavailable";
      }

      // Process questions
      const processedQuestions = questions.map(question => {
        const qAnswers = answers.filter(a => a.question_id === question.id);
        const numericValues = qAnswers
          .map(a => parseFloat(a.answer_value))
          .filter(v => !isNaN(v));

        return {
          ...question,
          answers: qAnswers,
          isNumerical: numericValues.length > 0,
          stats: calculateSummaryStatistics(numericValues),
          tests: numericValues.length > 0 
            ? calculateNumericalTests(numericValues)
            : calculateCategoricalTests(qAnswers)
        };
      });

      setState(prev => ({
        ...prev,
        questions: processedQuestions,
        answers,
        statsResults: analysisResult,
        aiReport: aiText,
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false,
        aiReport: "Error generating report: " + error.message
      }));
    }
  }, []);

  const calculateSummaryStatistics = (values) => {
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

  const calculateNumericalTests = (values) => {
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

  const calculateCategoricalTests = (answers) => {
    try {
      const counts = answers?.reduce((acc, { answer_value }) => ({
        ...acc,
        [answer_value]: (acc[answer_value] || 0) + 1
      }), {}) || {};
      
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
        (sum, obs, i) => sum + (Math.pow(obs - expected[i], 2) / expected[i]),
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

  const performAnova = (groups) => {
    try {
      const fValue = jStat.anovaftest(...groups);
      return {
        fValue,
        significant: fValue > jStat.ftest(0.95, groups.length - 1, groups.flat().length - groups.length)
      };
    } catch {
      return { fValue: null, significant: false };
    }
  };

  const generateChartData = (question) => {
    const answerCount = question?.answers?.reduce((acc, { answer_value }) => ({
      ...acc,
      [answer_value]: (acc[answer_value] || 0) + 1
    }), {}) || {};

    return {
      labels: Object.keys(answerCount),
      datasets: [{
        label: 'Responses',
        data: Object.values(answerCount),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
        ],
        borderColor: 'white',
        borderWidth: 1
      }]
    };
  };

  const generateRegressionChart = (question) => {
    try {
      const dataPoints = question.answers
        ?.map((a, i) => ({ x: i, y: parseFloat(a.answer_value) }))
        ?.filter(p => !isNaN(p.y)) || [];

      return {
        datasets: [{
          type: 'scatter',
          label: 'Responses',
          data: dataPoints,
          backgroundColor: '#EF4444'
        }, {
          type: 'line',
          label: 'Trend',
          data: dataPoints.map(p => ({
            x: p.x,
            y: question.tests.regression?.predict?.(p.x)
          })),
          borderColor: '#3B82F6',
          borderWidth: 2,
          tension: 0.1
        }]
      };
    } catch {
      return { datasets: [] };
    }
  };

  const ChartComponent = ({ question }) => (
    <div className="h-64">
      {state.chartType === 'Scatter' && question.isNumerical ? (
        <Scatter data={generateRegressionChart(question)} options={chartOptions} />
      ) : (
        {
          Bar: <Bar data={generateChartData(question)} options={chartOptions} />,
          Pie: <Pie data={generateChartData(question)} options={chartOptions} />,
          Line: <Line data={generateChartData(question)} options={chartOptions} />,
          Radar: <Radar data={generateChartData(question)} options={chartOptions} />,
          Doughnut: <Doughnut data={generateChartData(question)} options={chartOptions} />,
          PolarArea: <PolarArea data={generateChartData(question)} options={chartOptions} />
        }[state.chartType]
      )}
    </div>
  );

  const renderProfessionalReport = () => {
    const reportContent = String(state.aiReport || '');
    const reportLines = reportContent.split('\n').filter(line => line.trim());

    return (
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Professional Analysis Report</h3>
        <div className="prose max-w-none">
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Executive Summary</h4>
            <p className="text-gray-600">
              {reportLines[0] || 'No summary available'}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Question Analysis</h4>
            {state.statsResults?.map((result, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded">
                <h5 className="font-medium mb-2">
                  {result.question || `Question ${index + 1}`}
                </h5>
                <ul className="list-disc pl-6">
                  <li>Statistical Significance: {result.chiSquare?.significant ? 'Yes' : 'No'}</li>
                  <li>Correlation Strength: {result.correlation?.correlationValue?.toFixed(2) || 'N/A'}</li>
                  <li>Trend Slope: {result.regression?.slope?.toFixed(2) || 'N/A'}</li>
                </ul>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Key Insights</h4>
            <div className="space-y-2">
              {reportLines.slice(1, -1).map((line, index) => (
                <p key={index} className="text-gray-600">{line}</p>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold mb-2">Recommendations</h4>
            <ul className="list-disc pl-6 text-gray-600">
              {reportLines.filter(line => line.startsWith('Recommendation:')).map((rec, i) => (
                <li key={i}>{rec.replace('Recommendation: ', '')}</li>
              ))}
            </ul>
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
                className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800">{survey.title}</h3>
                <p className="text-sm text-gray-600 mt-2">Analyze →</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow">
              <h2 className="text-2xl font-semibold">{state.selectedSurvey.title}</h2>
              <div className="flex gap-4 w-full sm:w-auto">
                <select
                  value={state.chartType}
                  onChange={(e) => setState(prev => ({ ...prev, chartType: e.target.value }))}
                  className="p-2 border rounded w-full sm:w-48"
                >
                  {['Bar', 'Line', 'Pie', 'Radar', 'Doughnut', 'PolarArea', 'Scatter'].map(type => (
                    <option key={type} value={type}>{type} Chart</option>
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

            {state.loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {state.questions?.map(question => (
                    <div key={question.id} className="bg-white p-6 rounded-xl shadow">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">{question.question_text}</h3>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>{question.answers?.length || 0} responses</p>
                          <p>{question.isNumerical ? 'Numerical' : 'Categorical'} data</p>
                        </div>
                      </div>

                      <ChartComponent question={question} />

                      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="font-medium">Central Tendency</p>
                          <p>Mean: {question.stats?.mean?.toFixed(2) || 'N/A'}</p>
                          <p>Median: {question.stats?.median?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="font-medium">Spread</p>
                          <p>Range: {question.stats?.min ?? 'N/A'} - {question.stats?.max ?? 'N/A'}</p>
                          <p>Std Dev: {question.stats?.stdDev?.toFixed(2) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

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