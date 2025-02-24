// src/pages/SurveyPreview.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../assets/createClient";

const SurveyPreview = () => {
  const {
    surveyDBId,
    title,
    description,
    frameColor,
    answerColor
  } = useSurveyContext();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [shareLink, setShareLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate the share link
  useEffect(() => {
    if (surveyDBId) {
      setShareLink(`${window.location.origin}/view/${surveyDBId}`);
      fetchQuestions();
    }
  }, [surveyDBId]);

  // Fetch questions from Supabase
  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyDBId);

      if (error) {
        console.error("Error fetching questions:", error);
        return;
      }

      // Remove duplicate questions using Map
      const uniqueQuestions = [...new Map(data.map((q) => [q.id, q])).values()];
      setQuestions(uniqueQuestions);
    } catch (err) {
      console.error("Unexpected error fetching questions:", err);
    }
  };

  // Input Handlers for all question types
  const handleInputChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleMultipleChoiceChange = (qIndex, opt) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: [opt] }));
  };

  const handleCheckboxChange = (qIndex, opt) => {
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      return current.includes(opt)
        ? { ...prev, [qIndex]: current.filter((o) => o !== opt) }
        : { ...prev, [qIndex]: [...current, opt] };
    });
  };

  const handleStarChange = (qIndex, starValue) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: starValue }));
  };

  // Submit and save answers to Supabase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!surveyDBId) {
      alert("Survey ID missing!");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyDBId })
        .select()
        .single();

      if (responseError) {
        console.error("Error creating response row:", responseError);
        alert("Failed to save response.");
        setIsSubmitting(false);
        return;
      }

      const responseId = responseData.id;

      // Save each answer
      const answerRows = questions.map((q, i) => ({
        response_id: responseId,
        question_id: q.id,
        answer_value: answers[i] || "",
      }));

      const { error: answersError } = await supabase
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        console.error("Error saving answers:", answersError);
        alert("Failed to save answers.");
        setIsSubmitting(false);
        return;
      }

      alert("Survey responses saved successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred while saving your responses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Survey Header */}
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">Survey Preview</h1>
      </header>

      {/* Survey Content */}
      <div className="container mx-auto px-4 pb-10">
        <div className="max-w-4xl mx-auto rounded-lg shadow-lg" style={{ backgroundColor: frameColor }}>
          <div className="p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">{title}</h2>
            <p className="text-gray-700 text-center">{description}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="mb-6">
                <label className="block font-medium text-gray-800 mb-2">
                  {q.question_text}
                  {q.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Render input field based on question type */}
                {q.question_type === "shortAnswer" && (
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleInputChange(qIndex, e.target.value)}
                  />
                )}

                {q.question_type === "paragraph" && (
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleInputChange(qIndex, e.target.value)}
                  />
                )}

                {q.question_type === "multipleChoice" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label key={oIndex} className="flex items-center text-gray-700">
                        <input
                          type="radio"
                          name={`radio-${qIndex}`}
                          className="mr-2"
                          onChange={() => handleMultipleChoiceChange(qIndex, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === "checkboxes" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label key={oIndex} className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => handleCheckboxChange(qIndex, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {q.question_type === "dropdown" && (
                  <select
                    className="w-full p-2 border rounded"
                    onChange={(e) => handleInputChange(qIndex, e.target.value)}
                  >
                    <option value="">-- Select an option --</option>
                    {q.options.map((opt, oIndex) => (
                      <option key={oIndex} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {q.question_type === "rating" && (
                  <div>
                    <p className="text-sm text-gray-600">Rate your experience:</p>
                    <div className="mt-2 flex justify-center">
                      <StarRating
                        value={answers[qIndex] || 0}
                        onChange={(starValue) => handleStarChange(qIndex, starValue)}
                        maxStars={5}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-4 text-white p-3 rounded ${
                isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-600 hover:opacity-90"
              } transition-opacity`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 max-w-4xl mx-auto text-center bg-white p-6 rounded shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Share Survey</h2>
          <QRCodeCanvas value={shareLink} size={150} className="mx-auto" />
          <input
            type="text"
            value={shareLink}
            readOnly
            className="mt-4 p-2 border rounded w-full text-center"
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareLink)}
            className="mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Copy Link
          </button>
          <Link
            to={`/view/${surveyDBId}`}
            className="mt-4 inline-block px-4 py-2 text-white rounded bg-blue-600 hover:opacity-90 text-center"
          >
            Go to View Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
