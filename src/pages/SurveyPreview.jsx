// src/pages/SurveyPreview.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";

// 1) Import your Supabase client
import { supabase } from "../assets/createClient"; // <-- Adjust path as needed

const SurveyPreview = () => {
  const {
    // We assume you're storing a real "surveyId" in context
    // so we know which survey ID in the database to reference.
    surveyId,  
    title,
    description,
    questions,
    frameColor,
    buttonColor,
    answerColor
  } = useSurveyContext();

  // We'll store the user's "answers" locally.
  const [answers, setAnswers] = useState({});

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
        // Remove if already selected
        return { ...prev, [qIndex]: current.filter((o) => o !== opt) };
      } else {
        // Add if not selected
        return { ...prev, [qIndex]: [...current, opt] };
      }
    });
  };

  // 2) Handle the form submission -> save to DB
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate we have a real surveyId (if needed)
    if (!surveyId) {
      alert("No surveyId found. Cannot save to DB.");
      return;
    }

    try {
      // 2.1) Insert a new row in "responses" to represent this submission
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyId }) // We rely on "surveyId" from context
        .single();

      if (responseError) {
        console.error(responseError);
        alert("Error creating new response row");
        return;
      }

      // 2.2) Insert each answer into "answers"
      // We assume each question in "questions" has a question "id" from DB
      const responseId = responseData.id;

      // Build an array of { response_id, question_id, answer_value }
      const answerRows = questions.map((q, i) => {
        // The user’s answer is in "answers[i]"
        // For a safe approach, let's store it in JSON (like: {"value": ...}).
        // Or we can store it directly if it's already an array/string.
        // For demonstration, let's wrap in an object "{"userAnswer": ...}"
        const userAnswer = answers[i];
        return {
          response_id: responseId,
          question_id: q.id, // we expect q.id is from DB
          // cast to JSON if needed
          answer_value: userAnswer
            ? { userAnswer } // will be inserted as a JSON object
            : {}
        };
      });

      // Insert the array of answers
      const { error: answersError } = await supabase
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        console.error(answersError);
        alert("Error inserting answers");
        return;
      }

      // If we reach here, it means everything was saved successfully
      alert("Survey responses saved successfully!");
      console.log("User answers:", answers);

      // (Optional) Provide a link or do something to share the survey
      // e.g., redirect to a "thanks" page or show a link
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred while saving your answers");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          Survey Preview
        </h1>
      </header>

      <div className="container mx-auto px-4 pb-10">
        <div
          className="max-w-4xl mx-auto rounded shadow"
          style={{ backgroundColor: frameColor }}
        >
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {title || "Preview Title"}
            </h2>
            <p className="text-gray-700">
              {description || "Preview description..."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="mb-6">
                <label className="block font-medium text-gray-800 mb-2">
                  {q.text || "Untitled Question"}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {/* Short Answer */}
                {q.type === "shortAnswer" && (
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) =>
                      handleShortAnswerChange(qIndex, e.target.value)
                    }
                  />
                )}

                {/* Paragraph */}
                {q.type === "paragraph" && (
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) => handleParagraphChange(qIndex, e.target.value)}
                  />
                )}

                {/* Multiple Choice (Radio) */}
                {q.type === "multipleChoice" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label
                        key={oIndex}
                        className="flex items-center text-gray-700"
                      >
                        <input
                          type="radio"
                          name={`radio-${qIndex}`}
                          className="mr-2"
                          style={{ accentColor: answerColor }}
                          onChange={() =>
                            handleMultipleChoiceChange(qIndex, opt)
                          }
                        />
                        <span>{opt || "Option"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkboxes */}
                {q.type === "checkboxes" && (
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => (
                      <label
                        key={oIndex}
                        className="flex items-center text-gray-700"
                      >
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

                {/* Dropdown */}
                {q.type === "dropdown" && (
                  <select
                    className="p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) =>
                      handleDropdownChange(qIndex, e.target.value)
                    }
                  >
                    <option value="">-- Select an option --</option>
                    {q.options.map((opt, oIndex) => (
                      <option key={oIndex} value={opt}>
                        {opt || "Option"}
                      </option>
                    ))}
                  </select>
                )}

                {/* Star Rating */}
                {q.type === "rating" && (
                  <div>
                    <p className="text-sm text-gray-600">Click a star to rate:</p>
                    <div className="mt-2">
                      <StarRating
                        value={answers[qIndex] || 0}
                        onChange={(val) => handleStarChange(qIndex, val)}
                        maxStars={5}
                      />
                    </div>
                  </div>
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

        <div className="mt-6 max-w-4xl mx-auto text-center">
          <Link
            to="/builder"
            style={{ backgroundColor: buttonColor }}
            className="inline-block px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
          >
            Back to Builder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
