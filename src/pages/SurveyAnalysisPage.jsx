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

// Register Chart.js components
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

const SurveyAnalysisPage = () => {
  const { user } = useUser();
  const [state, setState] = useState({
    surveys: [],
    selectedSurvey: null,
    questions: [],
    answers: [],
    aiReport: "",
    loading: false,
    error: null,
    chartType: "Bar",
    activeAnalysisTab: "descriptive"
  });

  // Chart configuration
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

  // Fetch surveys on mount
  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("surveys")
          .select("id, title")
          .eq("user_id", user.id);

        if (error) throw error;
        setState(prev => ({ ...prev, surveys: data || [], error: null }));
      } catch (error) {
        setState(prev => ({ ...prev, error: "Failed to load surveys" }));
      }
    };
    fetchSurveys();
  }, [user]);

  // Process survey data
  const processSurveyData = useCallback(async (surveyId) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch questions
      const { data: questions, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyId);

      if (qError) throw qError;
      if (!questions.length) throw new Error("No questions found");

      // Fetch answers
      const questionIds = questions.map(q => q.id);
      const { data: answers, error: aError } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questionIds);

      if (aError) throw aError;

      // Process questions with statistics
      const processedQuestions = questions.map(question => {
        const qAnswers = answers.filter(a => a.question_id === question.id);
        const values = qAnswers.map(a => parseFloat(a.answer_value)).filter(v => !isNaN(v));
        const isNumerical = values.length > 0;

        return {
          ...question,
          answers: qAnswers,
          isNumerical,
          stats: calculateSummaryStatistics(values),
          tests: isNumerical ? calculateNumericalTests(values) : calculateCategoricalTests(qAnswers)
        };
      });

      // Generate AI report
      const aiReport = await generateAIReport(questions, answers);

      setState(prev => ({
        ...prev,
        questions: processedQuestions,
        answers,
        loading: false,
        aiReport
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  }, []);

  // Statistical calculations
  const calculateSummaryStatistics = (values) => {
    if (values.length === 0) return {};
    return {
      mean: ss.mean(values),
      median: ss.median(values),
      min: ss.min(values),
      max: ss.max(values),
      variance: ss.variance(values),
      stdDev: ss.standardDeviation(values),
      count: values.length
    };
  };

  const calculateNumericalTests = (values) => ({
    correlation: performCorrelation(values, Array.from({ length: values.length }, (_, i) => i)),
    regression: performLinearRegression(Array.from({ length: values.length }, (_, i) => i), values),
    tTest: performTTest(values, Array(values.length).fill(0)),
    anova: performAnova([values, Array(values.length).fill(0)])
  });

  const calculateCategoricalTests = (answers) => {
    const counts = answers.reduce((acc, { answer_value }) => {
      acc[answer_value] = (acc[answer_value] || 0) + 1;
      return acc;
    }, {});
    const observed = Object.values(counts);
    const expected = Array(observed.length).fill(answers.length / observed.length);
    
    return {
      chiSquare: performChiSquare(observed, expected),
      frequencyDistribution: counts
    };
  };

  // Chart data generators
  const generateChartData = (question) => {
    if (!question.answers.length) return { labels: [], datasets: [] };

    const answerCount = question.answers.reduce((acc, { answer_value }) => {
      acc[answer_value] = (acc[answer_value] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(answerCount),
      datasets: [{
        label: 'Responses',
        data: Object.values(answerCount),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: 'white',
        borderWidth: 1
      }]
    };
  };

  const generateRegressionChart = (question) => {
    const indices = Array.from({ length: question.answers.length }, (_, i) => i);
    return {
      datasets: [{
        type: 'scatter',
        label: 'Responses',
        data: indices.map((i) => ({ 
          x: i, 
          y: parseFloat(question.answers[i].answer_value) 
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }, {
        type: 'line',
        label: 'Trend Line',
        data: indices.map(i => ({
          x: i,
          y: question.tests.regression.predict(i)
        })),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.1
      }]
    };
  };

  // Statistical functions
  const performChiSquare = (observed, expected) => {
    const chiSquareValue = observed.reduce((sum, obs, i) => sum + ((obs - expected[i]) ** 2) / expected[i], 0);
    const degreesOfFreedom = observed.length - 1;
    return {
      chiSquareValue,
      degreesOfFreedom,
      pValue: 1 - jStat.chisquare.cdf(chiSquareValue, degreesOfFreedom),
      significant: chiSquareValue > jStat.chisquare.inv(0.95, degreesOfFreedom)
    };
  };

  const performLinearRegression = (x, y) => {
    try {
      const regression = ss.linearRegression(x.map((xi, i) => [xi, y[i]]));
      return {
        slope: regression.m,
        intercept: regression.b,
        predict: (value) => ss.linearRegressionLine(regression)(value)
      };
    } catch {
      return { slope: null, intercept: null, predict: () => null };
    }
  };

  const performCorrelation = (x, y) => {
    try {
      const correlationValue = ss.sampleCorrelation(x, y);
      return {
        correlationValue,
        significant: Math.abs(correlationValue) > 0.5
      };
    } catch {
      return { correlationValue: null, significant: false };
    }
  };

  const performTTest = (group1, group2) => {
    try {
      const tValue = jStat.ttest(group1, group2);
      return {
        tValue,
        significant: Math.abs(tValue) > 1.96 // 95% confidence
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

  // AI Report Generation
  const generateAIReport = async (questions, answers) => {
    try {
      const prompt = questions.map(q => {
        const qAnswers = answers.filter(a => a.question_id === q.id);
        return `${q.question_text}: ${qAnswers.map(a => a.answer_value).join(", ")}`;
      }).join("\n");

      // Simulated AI response - replace with actual API call
      return "AI Analysis:\n- Strong correlation found between question 1 and response times\n- Significant variance in answers for question 2\n- Recommendation: Consider simplifying complex questions";
    } catch {
      return "AI analysis unavailable at this time";
    }
  };

  // Render components
  const ChartComponent = ({ question }) => (
    <div className="h-64">
      {state.chartType === 'Scatter' && question.isNumerical ? (
        <Scatter data={generateRegressionChart(question)} options={chartOptions} />
      ) : (
        {
          'Bar': <Bar data={generateChartData(question)} options={chartOptions} />,
          'Pie': <Pie data={generateChartData(question)} options={chartOptions} />,
          'Line': <Line data={generateChartData(question)} options={chartOptions} />,
          'Radar': <Radar data={generateChartData(question)} options={chartOptions} />,
          'Doughnut': <Doughnut data={generateChartData(question)} options={chartOptions} />,
          'PolarArea': <PolarArea data={generateChartData(question)} options={chartOptions} />
        }[state.chartType]
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Advanced Survey Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive statistical analysis and visualization</p>
      </header>

      {state.error && (
        <div className="bg-red-100 p-4 rounded-lg mb-6 text-red-700">
          {state.error}
        </div>
      )}

      {!state.selectedSurvey ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.surveys.map((survey) => (
            <button
              key={survey.id}
              onClick={() => {
                setState(prev => ({ ...prev, selectedSurvey: survey }));
                processSurveyData(survey.id);
              }}
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <h3 className="text-lg font-semibold text-gray-800">{survey.title}</h3>
              <p className="text-sm text-gray-600 mt-2">Click to analyze</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
            <h2 className="text-2xl font-semibold">{state.selectedSurvey.title}</h2>
            <div className="flex gap-4">
              <select
                value={state.chartType}
                onChange={(e) => setState(prev => ({ ...prev, chartType: e.target.value }))}
                className="p-2 border rounded"
              >
                {['Bar', 'Line', 'Pie', 'Radar', 'Doughnut', 'PolarArea', 'Scatter'].map((type) => (
                  <option key={type} value={type}>{type} Chart</option>
                ))}
              </select>
              <button
                onClick={() => setState(prev => ({ ...prev, selectedSurvey: null }))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
              >
                Back to Surveys
              </button>
            </div>
          </div>

          {state.loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {state.questions.map((question) => (
                  <div key={question.id} className="bg-white p-6 rounded-xl shadow">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">{question.question_text}</h3>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Responses: {question.answers.length}</p>
                        <p>Type: {question.isNumerical ? 'Numerical' : 'Categorical'}</p>
                      </div>
                    </div>

                    <ChartComponent question={question} />

                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div className="p-3 bg-blue-50 rounded">
                        <p>Mean: {question.stats.mean?.toFixed(2)}</p>
                        <p>Std Dev: {question.stats.stdDev?.toFixed(2)}</p>
                        {question.isNumerical && (
                          <p>Correlation: {question.tests.correlation.correlationValue?.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <p>Min: {question.stats.min}</p>
                        <p>Max: {question.stats.max}</p>
                        <p>Significant: {question.tests.chiSquare?.significant ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold mb-4">Advanced Insights</h3>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {state.aiReport}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SurveyAnalysisPage;