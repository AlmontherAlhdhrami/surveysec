/*
                             (((v1 laith/almonther)))


import { useState } from "react";
import React from 'react'; // <-- This import is necessary for JSX to work

const CreateSurvey = () => {
  const [questions, setQuestions] = useState([]);

  // إضافة سؤال جديد
  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "text", options: [] }]);
  };

  // تحديث نص السؤال
  const updateQuestionText = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  // تغيير نوع السؤال
  const updateQuestionType = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;
    if (value === "text") {
      updatedQuestions[index].options = [];
    } else {
      updatedQuestions[index].options = [""];
    }
    setQuestions(updatedQuestions);
  };

  // تحديث خيارات السؤال
  const updateOption = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  // إضافة خيار جديد للسؤال
  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create a Survey</h2>
      <p className="text-gray-600 text-center mt-2">Add questions and select response types.</p>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
          <input
            type="text"
            placeholder="Enter your question..."
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
          />

          <select
            value={q.type}
            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
            className="mt-3 w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
          >
            <option value="text">Textbox (User Types Answer)</option>
            <option value="radio">Radio Button (Single Choice)</option>
            <option value="checkbox">Checkbox (Multiple Choices)</option>
          </select>

          {q.type !== "text" && (
            <div className="mt-4">
              <h4 className="text-gray-700">Options:</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter option..."
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                  />
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

*/




// (((v2 add short answer, paragraph, MC, check boxes and drop down + paragaraph)))

/*
import { useState } from "react";
import React from 'react';

const CreateSurvey = () => {
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    // Adds a new question with default type 'shortAnswer'
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
      case 'multipleChoice':
      case 'checkboxes':
      case 'dropdown':
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

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create a Survey</h2>
      <p className="text-gray-600 text-center mt-2">Add questions and select response types.</p>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
          <input
            type="text"
            placeholder="Enter your question..."
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
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

          {['multipleChoice', 'checkboxes', 'dropdown'].includes(q.type) && (
            <div className="mt-4">
              <h4 className="text-gray-700">Options:</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter option..."
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                  />
                  <button onClick={() => { // Add remove option button
                      let updatedOptions = [...questions];
                      updatedOptions[qIndex].options.splice(oIndex, 1);
                      setQuestions(updatedOptions);
                    }}
                    className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Remove
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
*/


// Im trying here to add a create button at the end 
/*
import React, { useState } from 'react';

const CreateSurvey = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    if (value === 'multipleChoice' || value === 'checkboxes' || value === 'dropdown') {
      updatedQuestions[index].options = [""];
    } else {
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

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create a Survey</h2>
      
      <input
        type="text"
        placeholder="Enter Survey Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-2xl font-bold"
      />

      <textarea
        placeholder="Enter Survey Description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-base"
      />

      <p className="text-gray-600 text-center mt-2">Add questions and select response types.</p>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
          <input
            type="text"
            placeholder="Enter your question..."
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
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

          {['multipleChoice', 'checkboxes', 'dropdown'].includes(q.type) && (
            <div className="mt-4">
              <h4 className="text-gray-700">Options:</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter option..."
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                  />
                  <button onClick={() => {
                      let updatedOptions = [...questions];
                      updatedOptions[qIndex].options.splice(oIndex, 1);
                      setQuestions(updatedOptions);
                    }}
                    className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    X
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
      <button
        //onClick={function to finalize and possibly save the survey}
        className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        ☑️ Create Survey
      </button>
    </div>
  );
};

export default CreateSurvey;
*/

// here I added two features 1.remove question 2.requerd button
import React, { useState } from 'react';

const CreateSurvey = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "shortAnswer", options: [], required: false }]);
  };

  const updateQuestionText = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const updateQuestionType = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;
    if (['multipleChoice', 'checkboxes', 'dropdown'].includes(value)) {
      updatedQuestions[index].options = [""];
    } else {
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

  const toggleRequired = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].required = !updatedQuestions[qIndex].required;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (qIndex) => {
    const updatedQuestions = questions.filter((_, index) => index !== qIndex);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create a Survey</h2>
      <input
        type="text"
        placeholder="Enter Survey Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-2xl font-bold"
      />
      <textarea
        placeholder="Enter Survey Description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-base"
      />

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100">
          <input
            type="text"
            placeholder="Enter your question..."
            value={q.text}
            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
            className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
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
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={q.required}
                onChange={() => toggleRequired(qIndex)}
                className="mr-2"
              />
              Required
            </label>
            <button
              onClick={() => removeQuestion(qIndex)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Remove Question
            </button>
          </div>
          {['multipleChoice', 'checkboxes', 'dropdown'].includes(q.type) && (
            <div className="mt-4">
              <h4 className="text-gray-700">Options:</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Enter option..."
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                  />
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
      <button
        className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        ☑️ Create Survey
      </button>
    </div>
  );
};

export default CreateSurvey;



//this is for ddrag end drop freature 
/* 
//if you want to add drag and drop feature you have to do this first
//npm install react-beautiful-dnd

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const CreateSurvey = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "shortAnswer", options: [], required: false }]);
  };

  const updateQuestionText = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = value;
    setQuestions(updatedQuestions);
  };

  const updateQuestionType = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = value;
    if (['multipleChoice', 'checkboxes', 'dropdown'].includes(value)) {
      updatedQuestions[index].options = [""];
    } else {
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

  const toggleRequired = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].required = !updatedQuestions[qIndex].required;
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (qIndex) => {
    const updatedQuestions = questions.filter((_, index) => index !== qIndex);
    setQuestions(updatedQuestions);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (source.index === destination.index) {
      return;
    }
    const items = Array.from(questions);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setQuestions(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6 max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-lg">
        <input
          type="text"
          placeholder="Enter Survey Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-2xl font-bold"
        />
        <textarea
          placeholder="Enter Survey Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mt-4 border rounded-lg focus:ring focus:ring-indigo-200 text-base"
        />

        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((q, index) => (
                <Draggable key={index} draggableId={`item-${index}`} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="mt-6 p-4 border rounded-lg shadow-md bg-gray-100"
                    >
                      <input
                        type="text"
                        placeholder="Enter your question..."
                        value={q.text}
                        onChange={(e) => updateQuestionText(index, e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      />
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestionType(index, e.target.value)}
                        className="mt-3 w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                      >
                        <option value="shortAnswer">Short Answer</option>
                        <option value="paragraph">Paragraph</option>
                        <option value="multipleChoice">Multiple Choice</option>
                        <option value="checkboxes">Checkboxes</option>
                        <option value="dropdown">Dropdown</option>
                      </select>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={() => toggleRequired(index)}
                          className="mr-2"
                        />
                        <span>Required</span>
                      </label>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Remove Question
                      </button>
                      {['multipleChoice', 'checkboxes', 'dropdown'].includes(q.type) && (
                        q.options.map((option, oIndex) => (
                          <div key={oIndex} className="mt-2">
                            <input
                              type="text"
                              placeholder="Enter option..."
                              value={option}
                              onChange={(e) => updateOption(index, oIndex, e.target.value)}
                              className="w-full p-2 border rounded-lg focus:ring focus:ring-indigo-200"
                            />
                          </div>
                        ))
                      )}
                      {['multipleChoice', 'checkboxes', 'dropdown'].includes(q.type) && (
                        <button
                          onClick={() => addOption(index)}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          ➕ Add Option
                        </button>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <button
          onClick={addQuestion}
          className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ➕ Add Question
        </button>
        <button
          className="mt-6 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ☑️ Create Survey
        </button>
      </div>
    </DragDropContext>
  );
};

export default CreateSurvey;
*/