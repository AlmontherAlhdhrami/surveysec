import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../assets/createClient";
import { useUser } from "@clerk/clerk-react";
import { Bar, Pie, Line, Radar, Doughnut, PolarArea } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale } from 'chart.js';
import { AIChatSession } from "../service/AIAnalysis";

// Import statistical functions and tests
import { calculateSummaryStatistics } from "../utils/statisticalFunctions";
import { performChiSquare, performTTest, performAnova } from "../utils/statisticalTests";

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale);

const SurveyAnalysisPage = () => {
  const { user } = useUser();
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [aiReport, setAiReport] = useState("");
  const [summaryStats, setSummaryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("Bar");
  const chartInstances = useRef({});

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("surveys")
        .select("id, title, user_id")
        .eq("user_id", user.id);

      if (error) {
        setError("Failed to fetch surveys.");
      } else {
        setSurveys(data || []);
      }
    };
    fetchSurveys();
  }, [user]);

  const fetchSurveyData = async (surveyId) => {
    setLoading(true);
    try {
      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyId);

      setQuestions(questionsData || []);

      const { data: answersData } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questionsData.map((q) => q.id));

      setAnswers(answersData || []);

      // Calculate statistics
      const stats = calculateSummaryStatistics(answersData);
      setSummaryStats(stats);

      await generateAIReport(questionsData, answersData);
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSurveySelection = (survey) => {
    setSelectedSurvey(survey);
    fetchSurveyData(survey.id);
  };

  const generateAIReport = async (questions, answers) => {
    try {
      const formattedData = questions.map((q) => {
        const relatedAnswers = answers.filter((a) => a.question_id === q.id);
        return `${q.question_text}: ${relatedAnswers.map((a) => a.answer_value).join(", ")}`;
      }).join("\n");

      const prompt = `Provide a detailed survey analysis. Highlight response trends, most frequent answers, and suggest areas for improvement:\n${formattedData}`;
      const aiResponse = await AIChatSession.sendMessage(prompt);
      setAiReport(aiResponse.response.text);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    }
  };

  const generateChartData = (questionId) => {
    const answerCount = {};
    answers
      .filter((a) => a.question_id === questionId)
      .forEach((answer) => {
        answerCount[answer.answer_value] = (answerCount[answer.answer_value] || 0) + 1;
      });

    return {
      labels: Object.keys(answerCount),
      datasets: [{
        label: "Responses",
        data: Object.values(answerCount),
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 205, 86, 0.6)"
        ],
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
      }],
    };
  };

  const generateStatisticsChartData = () => {
    if (!summaryStats) return null;

    return {
      labels: ["Minimum", "Average", "Maximum"],
      datasets: [
        {
          label: "Statistical Summary",
          data: [summaryStats.min, summaryStats.mean, summaryStats.max],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          borderColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          borderWidth: 2,
        },
      ],
    };
  };

  const ChartComponent = ({ data, questionId }) => {
    useEffect(() => {
      return () => {
        if (chartInstances.current[questionId]) {
          chartInstances.current[questionId].destroy();
        }
      };
    }, [questionId]);

    const ChartTypeComponent = {
      Bar: Bar,
      Pie: Pie,
      Line: Line,
      Radar: Radar,
      Doughnut: Doughnut,
      PolarArea: PolarArea,
    }[chartType] || Bar;

    return <ChartTypeComponent data={data} />;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Survey Analysis</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!selectedSurvey ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {surveys.map((survey) => (
            <button
              key={survey.id}
              onClick={() => handleSurveySelection(survey)}
              className="p-4 bg-purple-500 shadow rounded hover:bg-purple-300 transition size-40 w-2xs"
            >
              {survey.title}
            </button>
          ))}
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Analysis for: {selectedSurvey.title}
          </h2>

          <div className="text-center mb-4">
            <label className="mr-2">Select Chart Type: </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="p-2 rounded bg-white shadow"
            >
              <option value="Bar">Bar Chart</option>
              <option value="Pie">Pie Chart</option>
              <option value="Line">Line Chart</option>
              <option value="Radar">Radar Chart</option>
              <option value="Doughnut">Doughnut Chart</option>
              <option value="PolarArea">Polar Area Chart</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-white rounded shadow">
                    <h3 className="text-lg font-medium mb-2">{q.question_text}</h3>
                    <div className="h-48">
                      <ChartComponent data={generateChartData(q.id)} questionId={q.id} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white rounded shadow">
                <h3 className="text-lg font-semibold mb-2">Overall Statistical Summary</h3>
                {summaryStats && (
                  <div className="h-64">
                    <Bar data={generateStatisticsChartData()} />
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-white rounded shadow">
                <h3 className="text-lg font-semibold mb-2">AI Report Summary</h3>
                <p>{aiReport || "No AI analysis available."}</p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyAnalysisPage;
