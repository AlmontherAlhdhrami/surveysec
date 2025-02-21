// src/pages/ViewSurvey.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../assets/createClient";
import { QRCodeCanvas } from "qrcode.react";
 // Ensure this is installed with `npm install qrcode.react`

const ViewSurvey = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    if (surveyId) {
      fetchSurveyFromDB(surveyId);
      setShareLink(`${window.location.origin}/view/${surveyId}`);
    }
  }, [surveyId]);

  const fetchSurveyFromDB = async (id) => {
    setLoading(true);
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (surveyError) {
        console.error("Error fetching survey:", surveyError);
        return;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", id);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      setSurvey(surveyData);
      setQuestions(questionsData);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surveyId) {
      alert("No survey ID found!");
      return;
    }

    try {
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyId })
        .select()
        .single();

      if (responseError) {
        console.error("Error creating response:", responseError);
        alert("Failed to submit survey.");
        return;
      }

      const responseId = responseData.id;

      const answerRows = questions.map((q, index) => ({
        response_id: responseId,
        question_id: q.id,
        answer_value: answers[index] || "",
      }));

      const { error: answersError } = await supabase
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        console.error("Error inserting answers:", answersError);
        alert("Failed to save answers.");
        return;
      }

      alert("Survey submitted successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred while submitting the survey.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading survey...</p>;
  if (!survey) return <p className="text-center mt-10">Survey not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          {survey.title}
        </h1>
        <p className="text-center text-gray-600">{survey.description}</p>
      </header>

      <div className="container mx-auto px-4 pb-10 max-w-4xl">
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded">
          {questions.map((q, qIndex) => (
            <div key={q.id} className="mb-6">
              <label className="block font-medium text-gray-800 mb-2">
                {q.question_text}
                {q.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.question_type === "shortAnswer" && (
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                />
              )}

              {q.question_type === "paragraph" && (
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                />
              )}

              {q.question_type === "multipleChoice" && (
                <div>
                  {q.options.map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`radio-${qIndex}`}
                        className="mr-2"
                        onChange={() => handleChange(qIndex, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "checkboxes" && (
                <div>
                  {q.options.map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [qIndex]: prev[qIndex]
                              ? [...prev[qIndex], opt]
                              : [opt],
                          }))
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "dropdown" && (
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {q.options.map((opt, oIndex) => (
                    <option key={oIndex} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white rounded mt-4 hover:bg-indigo-700"
          >
            Submit
          </button>
        </form>
      </div>

      <div className="container mx-auto px-4 pb-10 max-w-4xl text-center">
        <h2 className="text-xl font-bold text-gray-800 mt-6">Share Survey</h2>
        <p className="text-gray-600">Copy the link or scan the QR code:</p>
        <div className="flex flex-col items-center mt-4">
          <QRCodeCanvas value={shareLink} size={150} />
          <input
            type="text"
            value={shareLink}
            readOnly
            className="mt-2 p-2 border rounded text-center w-72"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSurvey;
