// src/pages/SurveyBuilder.jsx
import React from "react";
import { useSurveyContext } from "../context/SurveyContext";
import { Link } from "react-router-dom";

const SurveyBuilder = () => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    questions,
    setQuestions,
    frameColor,
    setFrameColor,
    buttonColor,
    setButtonColor,
    answerColor,
    setAnswerColor,
  } = useSurveyContext();

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "shortAnswer",
        options: [],
        required: false,
        ratingValue: 0,
      },
    ]);
  };

  // Update question text
  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  // Update question type
  const updateQuestionType = (index, value) => {
    const updated = [...questions];
    updated[index].type = value;
    if (["multipleChoice", "checkboxes", "dropdown"].includes(value)) {
      updated[index].options = [""];
    } else {
      updated[index].options = [];
    }
    setQuestions(updated);
  };

  // Toggle required
  const toggleRequired = (index) => {
    const updated = [...questions];
    updated[index].required = !updated[index].required;
    setQuestions(updated);
  };

  // Update an individual option
  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  // Add a new option
  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  // Remove a specific option
  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  // Remove entire question
  const removeQuestion = (qIndex) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow py-6 mb-8">
        <h1 className="text-3xl font-bold text-indigo-700 text-center">
          Survey Builder
        </h1>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Editor Controls */}
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">
              Survey Settings
            </h2>

            {/* Survey Title */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Survey Title
            </label>
            <input
              type="text"
              placeholder="Survey Title..."
              className="w-full p-2 mb-4 border rounded focus:ring focus:ring-indigo-200 text-xl font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Survey Description */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Survey Description
            </label>
            <textarea
              placeholder="Survey Description..."
              className="w-full p-2 mb-4 border rounded focus:ring focus:ring-indigo-200"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Frame Color */}
            <h3 className="text-md font-semibold text-indigo-600 mt-2">
              Outer Frame / Page Background
            </h3>
            <input
              type="color"
              value={frameColor}
              onChange={(e) => setFrameColor(e.target.value)}
              className="cursor-pointer w-16 h-10 p-1 border rounded mb-4 mt-1"
            />

            {/* Button Color */}
            <h3 className="text-md font-semibold text-indigo-600">
              Button Color
            </h3>
            <input
              type="color"
              value={buttonColor}
              onChange={(e) => setButtonColor(e.target.value)}
              className="cursor-pointer w-16 h-10 p-1 border rounded mb-4 mt-1"
            />

            {/* Answer Accent Color (radio/checkbox) */}
            <h3 className="text-md font-semibold text-indigo-600">
              Answer Accent Color
            </h3>
            <input
              type="color"
              value={answerColor}
              onChange={(e) => setAnswerColor(e.target.value)}
              className="cursor-pointer w-16 h-10 p-1 border rounded mb-6 mt-1"
            />

            <hr className="mb-6" />

            {/* Questions */}
            <h2 className="text-lg font-bold text-indigo-600 mb-2">
              Questions
            </h2>
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="mt-3 p-4 border rounded bg-gray-50 shadow-sm"
              >
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  placeholder="Question text..."
                  className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  value={q.text}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                />

                <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
                  Question Type
                </label>
                <select
                  className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  value={q.type}
                  onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                >
                  <option value="shortAnswer">Short Answer</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="multipleChoice">Radio (Single Choice)</option>
                  <option value="checkboxes">Checkboxes (Multiple Select)</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="rating">Star Rating</option>
                </select>

                {/* Required / Remove */}
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={q.required}
                      onChange={() => toggleRequired(qIndex)}
                    />
                    Required
                  </label>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
                  >
                    Remove
                  </button>
                </div>

                {/* Options: Only for multipleChoice, checkboxes, dropdown */}
                {["multipleChoice", "checkboxes", "dropdown"].includes(q.type) && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Options:
                    </p>
                    {q.options.map((option, oIndex) => (
                      <div
                        className="flex items-center mt-2"
                        key={oIndex}
                      >
                        <input
                          type="text"
                          placeholder="Enter option..."
                          className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        />
                        {/* Remove Option Button */}
                        <button
                          className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-sm rounded"
                          onClick={() => removeOption(qIndex, oIndex)}
                        >
                          X
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(qIndex)}
                      className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      ➕ Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Question */}
            <button
              onClick={addQuestion}
              style={{ backgroundColor: buttonColor }}
              className="mt-6 w-full px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
            >
              ➕ Add Question
            </button>

            {/* Link to full interactive preview page */}
            <Link
              to="/preview"
              style={{ backgroundColor: buttonColor }}
              className="mt-3 inline-block w-full text-center px-4 py-2 text-white rounded hover:opacity-90 transition-opacity"
            >
              Go to Full Interactive Preview
            </Link>
          </div>

          {/* Right Column: "Design" Preview (read-only or partial) */}
          <div
            className="rounded p-6 shadow"
            style={{ backgroundColor: frameColor }}
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4">Design Preview</h2>
            <h3 className="text-2xl font-semibold text-gray-800">
              {title || "Survey Title"}
            </h3>
            <p className="text-gray-700 mt-2">
              {description || "Survey description here..."}
            </p>

            {/* List questions in a read-only style */}
            <div className="mt-6 space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="bg-white p-4 rounded border shadow-sm">
                  <p className="font-medium text-gray-800">
                    {q.text || "Untitled Question"}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </p>

                  {q.type === "shortAnswer" && (
                    <input
                      type="text"
                      className="mt-2 w-full p-2 border rounded"
                      placeholder="Short answer..."
                      disabled
                    />
                  )}
                  {q.type === "paragraph" && (
                    <textarea
                      className="mt-2 w-full p-2 border rounded"
                      placeholder="Long answer..."
                      rows={3}
                      disabled
                    />
                  )}
                  {q.type === "multipleChoice" && (
                    <div className="mt-2 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center text-gray-700"
                        >
                          <input
                            type="radio"
                            className="mr-2"
                            disabled
                            // Apply accent color to radio
                            style={{ accentColor: answerColor }}
                          />
                          <span>{opt || "Option"}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "checkboxes" && (
                    <div className="mt-2 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label
                          key={idx}
                          className="flex items-center text-gray-700"
                        >
                          <input
                            type="checkbox"
                            className="mr-2"
                            disabled
                            // Apply accent color to checkbox
                            style={{ accentColor: answerColor }}
                          />
                          <span>{opt || "Option"}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "dropdown" && (
                    <select className="mt-2 p-2 border rounded w-full" disabled>
                      <option>-- Select an option --</option>
                      {q.options.map((opt, idx) => (
                        <option key={idx}>{opt || "Option"}</option>
                      ))}
                    </select>
                  )}
                  {q.type === "rating" && (
                    <div className="mt-2 text-gray-400">
                      ⭐ ⭐ ⭐ ⭐ ⭐ (Preview - disabled)
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Example button preview (just to show your buttonColor) */}
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;
