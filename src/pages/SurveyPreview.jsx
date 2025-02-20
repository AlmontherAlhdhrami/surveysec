// src/pages/SurveyPreview.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";

const SurveyPreview = () => {
  // Destructure needed state from the SurveyContext
  const {
    title,
    description,
    questions,
    frameColor,    // Applied to container background
    buttonColor,   // Applied to buttons
    answerColor    // Applied to radio/checkbox accents
  } = useSurveyContext();

  // We'll store the user's "answers" locally in this component
  // so we can demonstrate interactive controls without overwriting the builder's data.
  // The keys in "answers" will match the question index (qIndex).
  const [answers, setAnswers] = useState({});

  // -- Handlers for each question type --

  // Short Answer
  const handleShortAnswerChange = (qIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: value
    }));
  };

  // Paragraph
  const handleParagraphChange = (qIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: value
    }));
  };

  // Dropdown
  const handleDropdownChange = (qIndex, value) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: [value] // store selected item in an array of length 1
    }));
  };

  // Star Rating
  const handleStarChange = (qIndex, starValue) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: starValue // store rating as a number
    }));
  };

  // Multiple Choice (Radio)
  const handleMultipleChoiceChange = (qIndex, opt) => {
    // For radio, we only store one selected option in an array of length 1
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: [opt]
    }));
  };

  // Checkboxes
  const handleCheckboxChange = (qIndex, opt) => {
    // For checkboxes, we store an array of selected options
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (current.includes(opt)) {
        // Remove if already selected
        return {
          ...prev,
          [qIndex]: current.filter((o) => o !== opt)
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [qIndex]: [...current, opt]
        };
      }
    });
  };

  // On form submit, we just log the answers to console
  // In a real app, you'd likely validate required fields and store them in a backend or DB.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User answers:", answers);
    alert("Form submitted! Check the console for answers.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          Survey Preview
        </h1>
      </header>

      <div className="container mx-auto px-4 pb-10">
        {/* Outer container uses frameColor */}
        <div
          className="max-w-4xl mx-auto rounded shadow"
          style={{ backgroundColor: frameColor }}
        >
          {/* Title/Description */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {title || "Preview Title"}
            </h2>
            <p className="text-gray-700">
              {description || "Preview description..."}
            </p>
          </div>

          {/* Survey Form */}
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
                    onChange={(e) =>
                      handleParagraphChange(qIndex, e.target.value)
                    }
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
                          onChange={() => handleMultipleChoiceChange(qIndex, opt)}
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
                        // If user hasn't selected a rating yet, default to 0
                        value={answers[qIndex] || 0}
                        onChange={(val) => handleStarChange(qIndex, val)}
                        maxStars={5}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Submit Button */}
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
