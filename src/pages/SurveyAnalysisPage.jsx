import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../assets/createClient";
import { useUser } from "@clerk/clerk-react";
import { Bar, Pie, Line } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { AIChatSession } from "../service/AIAnalysis";

const SurveyAnalysisPage = () => {
  const { user } = useUser();
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("Bar"); // New chart selection state
  const reportRef = useRef();

  useEffect(() => {
    const fetchSurveys = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("surveys")
        .select("id, title, user_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching surveys:", error);
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

      await generateAIReport(questionsData, answersData);
    } catch (err) {
      console.error("Unexpected error:", err);
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

      const prompt = `Provide a detailed survey analysis. Highlight response trends, most frequent answers, and suggest areas for improvement based on this data:\n${formattedData}`;
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
        const value = answer.answer_value;
        answerCount[value] = (answerCount[value] || 0) + 1;
      });

    return {
      labels: Object.keys(answerCount),
      datasets: [
        {
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
        },
      ],
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const ChartComponent = ({ data }) => {
    switch (chartType) {
      case "Bar":
        return <Bar data={data} />;
      case "Pie":
        return <Pie data={data} />;
      case "Line":
        return <Line data={data} />;
      default:
        return <Bar data={data} />;
    }
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
              className="p-4 bg-white shadow rounded hover:bg-blue-200 transition"
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
            </select>
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <div ref={reportRef} className="printable-section">
                {/* Charts for each question */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {questions.map((q) => (
                    <div key={q.id} className="p-3 bg-white rounded shadow">
                      <h3 className="text-lg font-medium mb-2">{q.question_text}</h3>
                      <div className="h-48">
                        <ChartComponent data={generateChartData(q.id)} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Report Section */}
                <div className="mt-6 p-4 bg-white rounded shadow">
                  <h3 className="text-lg font-semibold mb-2">AI Report Summary</h3>
                  <p>{aiReport || "No AI analysis available."}</p>
                </div>
              </div>

              {/* Print or Save as PDF Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Print / Save as PDF
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SurveyAnalysisPage;
