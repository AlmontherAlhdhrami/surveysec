// src/pages/SurveyPreview.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";

const SurveyPreview = () => {
  const {
    title,
    description,
    questions,
    frameColor,
    buttonColor,
    answerColor
  } = useSurveyContext();

  const [answers, setAnswers] = useState({});

  // ... your existing handlers (handleTextChange, etc.) ...

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("User answers:", answers);
    alert("Form submitted! Check console for answers.");
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

                {/* Example for multipleChoice + accentColor */}
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
                            setAnswers({ ...answers, [qIndex]: [opt] })
                          }
                        />
                        <span>{opt || "Option"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Checkboxes with accentColor */}
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
                          onChange={() => {
                            // checkbox logic
                            const current = answers[qIndex] || [];
                            if (current.includes(opt)) {
                              // remove
                              setAnswers({
                                ...answers,
                                [qIndex]: current.filter((o) => o !== opt),
                              });
                            } else {
                              // add
                              setAnswers({
                                ...answers,
                                [qIndex]: [...current, opt],
                              });
                            }
                          }}
                        />
                        <span>{opt || "Option"}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* ... shortAnswer, paragraph, dropdown, starRating similarly ... */}
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
