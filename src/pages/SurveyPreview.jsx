// src/pages/SurveyPreview.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";

const SurveyPreview = () => {
  const { title, description, themeColor, questions } = useSurveyContext();

  // We'll store the user's "answers" locally, so we can demonstrate
  // interactive controls without overwriting the builder's data.
  const [answers, setAnswers] = useState({});

  // Handlers for updating local answers
  const handleTextChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
  };

  const handleMultipleChoiceChange = (qIndex, value) => {
    // For radio, we only store one value
    setAnswers((prev) => ({ ...prev, [qIndex]: [value] }));
  };

  const handleCheckboxChange = (qIndex, option) => {
    // For checkboxes, store an array of selected options
    setAnswers((prev) => {
      const currentSelections = prev[qIndex] || [];
      const updated = currentSelections.includes(option)
        ? currentSelections.filter((o) => o !== option) // remove if selected
        : [...currentSelections, option]; // add if not selected

      return { ...prev, [qIndex]: updated };
    });
  };

  const handleDropdownChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: [value] }));
  };

  const handleStarChange = (qIndex, starValue) => {
    // For rating, store a single numeric value
    setAnswers((prev) => ({ ...prev, [qIndex]: starValue }));
  };

  // In a real app, you'd do form validation for "required" fields, etc.
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User answers:", answers);
    alert("Form submitted! Check the console for answers.");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          Survey Preview
        </h1>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 pb-10">
        <div
          className="max-w-4xl mx-auto rounded shadow"
          style={{ backgroundColor: themeColor }}
        >
          {/* Title & Description */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {title || "Preview Title"}
            </h2>
            <p className="text-gray-700">
              {description || "Preview description..."}
            </p>
          </div>

          {/* Form Section */}
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
                    onChange={(e) => handleTextChange(qIndex, e.target.value)}
                  />
                )}

                {/* Paragraph */}
                {q.type === "paragraph" && (
                  <textarea
                    rows={3}
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    onChange={(e) => handleTextChange(qIndex, e.target.value)}
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
                    onChange={(e) => handleDropdownChange(qIndex, e.target.value)}
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
              className="w-full mt-4 bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="mt-6 max-w-4xl mx-auto text-center">
          <Link
            to="/builder"
            className="inline-block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Builder
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;
