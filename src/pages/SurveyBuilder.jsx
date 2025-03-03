import React, { useEffect } from "react";
import { useSurveyContext } from "../context/SurveyContext";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../assets/createClient";
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { SwatchIcon } from "@heroicons/react/24/solid";
import { useSurveyHelper } from "../utils/sureveyhepler";


const SurveyBuilder = () => {
  const { surveyId } = useParams();
  const {
    surveyDBId,
    setSurveyDBId,
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
  const {
    addQuestion,
    updateQuestionText,
    updateQuestionType,
    toggleRequired,
    updateOption,
    addOption,
    removeOption,
    removeQuestion,
    handleSaveSurvey,
  } = useSurveyHelper();

  // Existing useEffect and data fetching logic remains the same
  useEffect(() => {
    if (surveyId) {
      fetchSurveyFromDB(surveyId);
    }
  }, [surveyId]);

  
  const fetchSurveyFromDB = async (id) => {
    try {
      const { data: survey, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (surveyError) throw surveyError;

      const { data: qData, error: qError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", id);

      if (qError) throw qError;

      setSurveyDBId(survey.id);
      setTitle(survey.title || "");
      setDescription(survey.description || ""); 

      const mappedQuestions = qData.map((dbQ) => ({
        id: dbQ.id,
        text: dbQ.question_text,
        type: dbQ.question_type,
        required: dbQ.is_required,
        options: dbQ.options || [],
      }));
      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Error loading survey:", err);
      alert("Failed to load survey data");
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-sm py-20 mb-20">
        <h1 className="text-3xl font-bold text-white text-center py-10 ">
          Survey Builder
        </h1>
      </header>

      <div className="container mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Editor Controls */}
          <div className="bg-white p-6 shadow rounded">
            <h2 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
              <SwatchIcon className="h-5 w-5 text-indigo-600" />
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
  value={description || ""} // Additional safety check
  onChange={(e) => setDescription(e.target.value)}
/>

            {/* Color Customization */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frame Color
                </label>
                <input
                  type="color"
                  value={frameColor}
                  onChange={(e) => setFrameColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer Color
                </label>
                <input
                  type="color"
                  value={answerColor}
                  onChange={(e) => setAnswerColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <hr className="my-6" />

            {/* Questions Section */}
            <h2 className="text-lg font-bold text-indigo-600 mb-2">
              Questions
            </h2>
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="mt-3 p-4 border rounded bg-gray-50 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Question {qIndex + 1}
                  </label>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Question text..."
                  className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                  value={q.text}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                />

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <select
                    className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                    value={q.type}
                    onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                  >
                    <option value="shortAnswer">Short Answer</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="rating">Star Rating</option>
                  </select>
                  <label className="flex items-center justify-end space-x-2">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={() => toggleRequired(qIndex)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>

                {["multipleChoice", "checkboxes", "dropdown"].includes(q.type) && (
                  <div className="mt-3 space-y-2">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Option ${oIndex + 1}`}
                          className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        />
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Question
            </button>

            <div className="mt-4 space-y-3">
              <button
                onClick={handleSaveSurvey}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Save Survey
              </button>
              <Link
                to="/preview"
                className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Preview Survey
              </Link>
            </div>
          </div>

          {/* Right Column: Preview */}
          <div
            className="rounded p-6 shadow"
            style={{ backgroundColor: frameColor }}
          >
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Design Preview
            </h2>
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-600 mt-2">{description}</p>
              </div>

              {questions.map((q, i) => (
                <div key={i} className="bg-white p-4 rounded shadow-sm">
                  <p className="font-medium text-gray-800">
                    {q.text || "New Question"}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </p>

                  {q.type === "shortAnswer" && (
                    <input
                      type="text"
                      className="w-full p-2 mt-2 border rounded"
                      placeholder="Short answer..."
                      disabled
                    />
                  )}

                  {q.type === "paragraph" && (
                    <textarea
                      className="w-full p-2 mt-2 border rounded"
                      placeholder="Long answer..."
                      rows={3}
                      disabled
                    />
                  )}

                  {q.type === "multipleChoice" && (
                    <div className="mt-2 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label key={idx} className="inline-grid grid-cols-3 items-center gap-2">
                          <input
                            type="radio"
                            disabled
                            style={{ accentColor: answerColor }}
                          />
                          <span>{opt || `Option ${idx + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "checkboxes" && (
                    <div className="mt-2 space-y-2">
                      {q.options.map((opt, idx) => (
                        <label key={idx} className="inline-grid grid-cols-3 items-center gap-2">
                          <input
                            type="checkbox"
                            disabled
                            style={{ accentColor: answerColor }}
                          />
                          <span>{opt || `Option ${idx + 1}`}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "dropdown" && (
                    <select className="w-full p-2 mt-2 border rounded" disabled>
                      <option>Select an option</option>
                      {q.options.map((opt, idx) => (
                        <option key={idx}>{opt || `Option ${idx + 1}`}</option>
                      ))}
                    </select>
                  )}

                  {q.type === "rating" && (
                    <div className="mt-2 flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="h-6 w-6" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;