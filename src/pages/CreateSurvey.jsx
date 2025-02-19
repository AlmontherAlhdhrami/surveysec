import { useState } from "react";
import React from "react";

const CreateSurvey = () => {
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "shortAnswer", options: [] }]);
  };

  const updateQuestionText = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const updateQuestionType = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;
    switch (value) {
      case "multipleChoice":
      case "checkboxes":
      case "dropdown":
        updatedQuestions[index].options = [""];
        break;
      default:
        updatedQuestions[index].options = [];
    }
    setQuestions(updatedQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions([...updatedQuestions]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-[150px] bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create a Survey</h2>
      <p className="text-gray-600 text-center mt-2">Add questions and select response types.</p>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
          <input
            type="text"
            placeholder="Enter your question..."
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            className="w-full max-w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200 overflow-hidden"
          />

          <select
            value={q.type}
            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
            className="mt-3 w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
          >
            <option value="shortAnswer">Short Answer</option>
            <option value="paragraph">Paragraph</option>
            <option value="multipleChoice">Multiple Choice</option>
            <option value="checkboxes">Checkboxes</option>
            <option value="dropdown">Dropdown</option>
          </select>

          {["multipleChoice", "checkboxes", "dropdown"].includes(q.type) && (
            <div className="mt-4">
              <h4 className="text-gray-700">Options:</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter option..."
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="w-full max-w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                  />
                  <button
                    onClick={() => removeOption(qIndex, oIndex)}
                    className="ml-2 w-[80px] bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(qIndex)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                ➕ Add Option
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={addQuestion}
        className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        ➕ Add Question
      </button>
    </div>
  );
};

export default CreateSurvey;
