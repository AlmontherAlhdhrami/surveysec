// src/pages/SurveyPreview.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../assets/createClient"; // Import Supabase client

const SurveyPreview = () => {
  const {
    surveyDBId,
    title,
    description,
    questions,
    frameColor,
    buttonColor,
    answerColor
  } = useSurveyContext();

  const [answers, setAnswers] = useState({});
  const [shareLink, setShareLink] = useState("");

  // Generate the share link
  useEffect(() => {
    if (surveyDBId) {
      setShareLink(`${window.location.origin}/view/${surveyDBId}`);
    }
  }, [surveyDBId]);

  // Handlers for each question type
  const handleShortAnswerChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleParagraphChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleDropdownChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: [value] }));
  };

  const handleStarChange = (qIndex, starValue) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: starValue }));
  };

  const handleMultipleChoiceChange = (qIndex, opt) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: [opt] }));
  };

  const handleCheckboxChange = (qIndex, opt) => {
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (current.includes(opt)) {
        return { ...prev, [qIndex]: current.filter((o) => o !== opt) };
      } else {
        return { ...prev, [qIndex]: [...current, opt] };
      }
    });
  };

  // Handle form submission – save answers to DB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!surveyDBId) {
      alert("No surveyDBId found. Cannot save to DB.");
      return;
    }

    try {
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyDBId })
        .select()
        .single();

      if (responseError) {
        console.error("Error creating response row:", responseError);
        alert("Error creating response");
        return;
      }

      const responseId = responseData.id;

      const answerRows = questions
        .filter((q) => q && q.id)
        .map((q, i) => ({
          response_id: responseId,
          question_id: q.id,
          answer_value: answers[i] || "",
        }));

      const { error: answersError } = await supabase
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        console.error("Error inserting answers:", answersError);
        alert("Error saving answers");
        return;
      }

      alert("Survey responses saved successfully!");
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred while saving your responses");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          Survey Preview
        </h1>
      </header>

      {/* Survey Content */}
      <div className="container mx-auto px-4 pb-10">
        <div
          className="max-w-4xl mx-auto rounded-lg shadow-lg"
          style={{ backgroundColor: frameColor }}
        >
          <div className="p-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
              {title || "Survey Title"}
            </h2>
            <p className="text-gray-700 text-center">{description || "Survey description..."}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-6">
                <label className="block font-medium text-gray-800 mb-2">
                  {q.text || "Untitled Question"}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Input Fields Based on Question Type */}
                {q.type === "shortAnswer" && (
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) => handleShortAnswerChange(qIndex, e.target.value)}
                  />
                )}

                {q.type === "paragraph" && (
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) => handleParagraphChange(qIndex, e.target.value)}
                  />
                )}

                {q.type === "multipleChoice" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label key={oIndex} className="flex items-center text-gray-700">
                        <input
                          type="radio"
                          name={`radio-${qIndex}`}
                          className="mr-2"
                          style={{ accentColor: answerColor }}
                          onChange={() => handleMultipleChoiceChange(qIndex, opt)}
                        />
                        <span>{opt || "Option"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "checkboxes" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label key={oIndex} className="flex items-center text-gray-700">
                        <input
                          type="checkbox"
                          className="mr-2"
                          style={{ accentColor: answerColor }}
                          onChange={() => handleCheckboxChange(qIndex, opt)}
                        />
                        <span>{opt || "Option"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "dropdown" && (
                  <select
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) => handleDropdownChange(qIndex, e.target.value)}
                  >
                    <option value="">-- Select an option --</option>
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
              style={{ backgroundColor: buttonColor }}
              className="w-full mt-4 text-white p-3 rounded hover:opacity-90 transition-opacity"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Shareable QR Code and Link Section */}
        <div className="mt-6 max-w-4xl mx-auto text-center bg-white p-6 rounded shadow-lg flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Share Survey</h2>
            <QRCodeCanvas value={shareLink} size={150} className="mx-auto" />
          </div>

          <div className="flex flex-col w-full sm:w-1/2">
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
              style={{ backgroundColor: buttonColor }}
              className="mt-4 inline-block px-4 py-2 text-white rounded hover:opacity-90 transition-opacity text-center"
            >
              Go to View Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
