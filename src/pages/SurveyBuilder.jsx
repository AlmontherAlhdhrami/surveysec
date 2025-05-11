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
import {encrypt,decrypt} from "../service/cryptoHelper"


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
      // Encrypting the title and description before setting
      setTitle(decrypt(survey.title) || "");
      setDescription(survey.description|| ""); 
  
      const mappedQuestions = qData.map((dbQ) => ({
        id: dbQ.id,
        text: decrypt(dbQ.question_text),  // Encrypting question text
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
    <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-sm py-20 mb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-white text-center">
          Survey Builder
        </h1>
       
      </div>
    </header>

    <div className="container mx-auto px-4 pb-10">
      <div className="bg-white p-6 shadow rounded">
        {/* Survey Settings Section */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <SwatchIcon className="h-5 w-5 text-indigo-600" />
            Survey Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Survey Title
              </label>
              <input
                type="text"
                placeholder="Survey Title..."
                className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Survey Description
              </label>
              <textarea
                placeholder="Survey Description..."
                className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
                rows={2}
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs">
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
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-indigo-600">
            Questions
          </h2>
          
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Question text..."
                    className="w-full p-2 border-b-2 border-transparent focus:border-indigo-500 focus:outline-none font-medium bg-transparent"
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
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
                  <option value="multipleChoiceGrid">Multiple Choice Grid</option>
                  <option value="checkboxGrid">Checkbox Grid</option>
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

              {/* Options Management */}
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
                        className="text-red-500 hover:text-red-600 p-2 rounded hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
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

              {/* Grid Management */}
              {["multipleChoiceGrid", "checkboxGrid"].includes(q.type) && (
                <div className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
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
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Columns</h4>
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
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-6"
          >
            <PlusIcon className="h-6 w-6 text-indigo-600" />
            <span className="text-indigo-600 font-medium">Add Question</span>
          </button>
        </div>
      </div>
    </div>
    <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleSaveSurvey}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            Save Survey
          </button>
          <Link
            to="/preview"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            Preview
          </Link>
        </div>
  </div>
);
};

export default SurveyBuilder;