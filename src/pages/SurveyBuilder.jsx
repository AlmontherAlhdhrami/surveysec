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
    addRow,
    updateRow,
    removeRow,
    addColumn,
    updateColumn,
    removeColumn
  } = useSurveyHelper();

  // Existing useEffect and data fetching logic remains the same
  useEffect(() => {
    if (surveyId) {
      fetchSurveyFromDB(surveyId);
      setFrameColor('#ffffff');
    setAnswerColor('#4f46e5');
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
        options: parseSurveyField(dbQ.options),
      rows: parseSurveyField(dbQ.rows),
      columns: parseSurveyField(dbQ.columns)
      }));
      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Error loading survey:", err);
      alert("Failed to load survey data");
    }
  };

  // Add this utility function to both SurveyBuilder and SurveyPreview
const parseSurveyField = (value) => {
  // If value is already an array, return it
  if (Array.isArray(value)) return value;
  
  try {
    // Try to parse as JSON first
    return JSON.parse(value);
  } catch (jsonError) {
    try {
      // Fallback to CSV parsing
      return value.split(',').map(item => item.trim());
    } catch (csvError) {
      console.warn('Failed to parse field:', value);
      return [];
    }
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
                    <option value="multipleChoiceGrid">Multiple Choice Grid</option> {/* NEW */}
                    <option value="checkboxGrid">Checkbox Grid</option> {/* NEW */}
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
                {/* Render Grid Rows */}
               {/* In the editor section where grid rows/columns are rendered */}
{["multipleChoiceGrid", "checkboxGrid"].includes(q.type) && (
  <div className="mt-3 space-y-2">
    {/* Rows Section */}
    <h4 className="font-medium text-gray-700">Rows</h4>
    {(q.rows || []).map((row, rIndex) => (
      <div key={rIndex} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder={`Row ${rIndex + 1}`}
          value={row}
          onChange={(e) => updateRow(qIndex, rIndex, e.target.value)}
        />
        <button 
          onClick={() => removeRow(qIndex, rIndex)} 
          className="text-red-500 hover:text-red-600"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    ))}
    <button
      onClick={() => addRow(qIndex)}
      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
    >
      <PlusIcon className="h-4 w-4" />
      Add Row
    </button>

    {/* Columns Section */}
    <h4 className="font-medium text-gray-700 mt-4">Columns</h4>
    {(q.columns || []).map((col, cIndex) => (
      <div key={cIndex} className="flex items-center gap-2">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder={`Column ${cIndex + 1}`}
          value={col}
          onChange={(e) => updateColumn(qIndex, cIndex, e.target.value)}
        />
        <button
          onClick={() => removeColumn(qIndex, cIndex)}
          className="text-red-500 hover:text-red-600"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    ))}
    <button
      onClick={() => addColumn(qIndex)}
      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1"
    >
      <PlusIcon className="h-4 w-4" />
      Add Column
    </button>
  </div>
)}

{/* In the preview section grid rendering */}
{/* Multiple Choice Grid & Checkbox Grid */}
{["multipleChoiceGrid", "checkboxGrid"].includes(q.type) && (
  <div className="overflow-auto mt-4">
    <table className="border-collapse w-full">
      {/* Table Header */}
      <thead>
        <tr>
          <th className="border px-4 py-2"></th>
          {Array.isArray(q.columns) &&
            q.columns.map((col, cIndex) => (
              <th key={cIndex} className="border px-4 py-2">{col || `Column ${cIndex + 1}`}</th>
            ))}
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {Array.isArray(q.rows) && q.rows.length > 0 ? (
          q.rows.map((row, rIndex) => (
            <tr key={rIndex}>
              <td className="border px-4 py-2 font-medium">{row || `Row ${rIndex + 1}`}</td>
              {Array.isArray(q.columns) &&
                q.columns.map((_, cIndex) => (
                  <td key={cIndex} className="border px-4 py-2 text-center">
                    <input
                      type={q.type === "multipleChoiceGrid" ? "radio" : "checkbox"}
                      name={`grid-${qIndex}-row${rIndex}`}
                      disabled
                    />
                  </td>
                ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={q.columns?.length + 1} className="border px-4 py-2 text-center text-gray-500">
              No rows available
            </td>
          </tr>
        )}
      </tbody>
    </table>
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
  style={{
    backgroundColor: frameColor,
    border: `2px solid ${frameColor}`
  }}
>
  <h2 
    className="text-xl font-bold mb-4"
    style={{ color: answerColor }}
  >
    Design Preview
  </h2>
  <div className="space-y-6" >
    {/* Survey Title and Description */}
    <div className="text-center">
      <h1 className="text-2xl font-bold" style={{ color: answerColor }}>
        {title || "Untitled Survey"}
      </h1>
      <p className="mt-2" style={{ color: answerColor }}>
        {description || "No description provided"}
      </p>
    </div>

    {/* Loop through each question */}
    {questions.map((q, i) => (
      <div 
        key={i} 
        className="p-4 rounded shadow-sm"
        style={{
          backgroundColor: `${answerColor}10`,
          border: `1px solid ${answerColor}`
        }}
      >
        {/* Question Title */}
        <p className="font-medium">
          {q.text || "New Question"}
          {q.required && <span className="text-red-500 ml-1">*</span>}
        </p>

        {/* Short Answer */}
        {q.type === "shortAnswer" && (
          <input
            type="text"
            className="w-full p-2 mt-2 rounded"
            style={{
              border: `1px solid ${answerColor}`,
              backgroundColor: `${answerColor}08`
            }}
            placeholder="Short answer..."
            disabled
          />
        )}

        {/* Paragraph Answer */}
        {q.type === "paragraph" && (
          <textarea
            className="w-full p-2 mt-2 rounded"
            style={{
              border: `1px solid ${answerColor}`,
              backgroundColor: `${answerColor}08`
            }}
            placeholder="Long answer..."
            rows={3}
            disabled
          />
        )}

        {/* Multiple Choice */}
        {q.type === "multipleChoice" && (
          <div className="mt-2 space-y-2">
            {Array.isArray(q.options) &&
              q.options.map((opt, idx) => (
                <label key={idx} className="inline-flex items-center gap-2">
                  <input 
                    type="radio" 
                    disabled 
                    style={{ 
                      accentColor: answerColor,
                      borderColor: answerColor
                    }} 
                  />
                  <span>{opt || `Option ${idx + 1}`}</span>
                </label>
              ))}
          </div>
        )}

        {/* Checkboxes */}
        {q.type === "checkboxes" && (
          <div className="mt-2 space-y-2">
            {Array.isArray(q.options) &&
              q.options.map((opt, idx) => (
                <label key={idx} className="inline-flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    disabled 
                    style={{ 
                      accentColor: answerColor,
                      borderColor: answerColor
                    }} 
                  />
                  <span>{opt || `Option ${idx + 1}`}</span>
                </label>
              ))}
          </div>
        )}

        {/* Dropdown */}
        {q.type === "dropdown" && (
          <select 
            className="w-full p-2 mt-2 rounded"
            style={{
              border: `1px solid ${answerColor}`,
              backgroundColor: `${answerColor}08`
            }}
            disabled
          >
            <option>Select an option</option>
            {Array.isArray(q.options) &&
              q.options.map((opt, idx) => (
                <option key={idx}>{opt || `Option ${idx + 1}`}</option>
              ))}
          </select>
        )}

        {/* Star Rating */}
        {q.type === "rating" && (
          <div className="mt-2 flex gap-1" style={{ color: answerColor }}>
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-6 w-6" />
            ))}
          </div>
        )}

        {/* Multiple Choice Grid & Checkbox Grid */}
        {["multipleChoiceGrid", "checkboxGrid"].includes(q.type) && (
          <div className="overflow-auto mt-4">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2" style={{ borderColor: answerColor }}></th>
                  {Array.isArray(q.columns) &&
                    q.columns.map((col, cIndex) => (
                      <th 
                        key={cIndex} 
                        className="border px-4 py-2"
                        style={{ borderColor: answerColor }}
                      >
                        {col || `Column ${cIndex + 1}`}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(q.rows) && q.rows.length > 0 ? (
                  q.rows.map((row, rIndex) => (
                    <tr key={rIndex}>
                      <td 
                        className="border px-4 py-2 font-medium"
                        style={{ borderColor: answerColor }}
                      >
                        {row || `Row ${rIndex + 1}`}
                      </td>
                      {Array.isArray(q.columns) &&
                        q.columns.map((_, cIndex) => (
                          <td 
                            key={cIndex} 
                            className="border px-4 py-2 text-center"
                            style={{ borderColor: answerColor }}
                          >
                            <input
                              type={q.type === "multipleChoiceGrid" ? "radio" : "checkbox"}
                              name={`grid-${i}-row${rIndex}`}
                              disabled
                              style={{ 
                                accentColor: answerColor,
                                borderColor: answerColor
                              }}
                            />
                          </td>
                        ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td 
                      colSpan={q.columns?.length + 1} 
                      className="border px-4 py-2 text-center text-gray-500"
                      style={{ borderColor: answerColor }}
                    >
                      No rows available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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