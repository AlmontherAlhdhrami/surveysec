import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you are using React Router
import "./survey.css";
import { Supabase } from "../assets/createClient";

const Dashboard = () => {
  const [questions, setQuestions] = useState([]);
  const [questionnaireTitle, setQuestionnaireTitle] = useState("");
  const [questionnaireDescription, setQuestionnaireDescription] = useState("");
  const [newQuestionType, setNewQuestionType] = useState("text");
  const navigate = useNavigate(); // For navigation

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      label: "",
      type: newQuestionType,
      options: newQuestionType === "single-choice" || newQuestionType === "multi-choice" ? [""] : [],
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id, key, value) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  const deleteQuestion = (id) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
  };

  const saveQuestionnaire = async () => {
    if (!questionnaireTitle.trim()) {
      alert("Please enter a questionnaire title.");
      return;
    }

    if (questions.some((q) => !q.label.trim())) {
      alert("Please fill in all question labels.");
      return;
    }

    try {
      // Step 1: Save questionnaire
      const { data: questionnaire, error: questionnaireError } = await Supabase.from("questionnaires").insert({
        title: questionnaireTitle,
        description: questionnaireDescription,
      }).select();

      if (questionnaireError) throw questionnaireError;

      const questionnaireId = questionnaire[0]?.id;

      // Step 2: Save questions
      const formattedQuestions = questions.map((q) => ({
        questionnaire_id: questionnaireId,
        question_label: q.label,
        question_type: q.type,
        options: q.type === "single-choice" || q.type === "multi-choice" ? q.options : null,
        required: q.required,
      }));

      const { error: questionsError } = await Supabase.from("questions").insert(formattedQuestions);

      if (questionsError) throw questionsError;

      alert("Questionnaire saved successfully!");
      // Reset form
      setQuestionnaireTitle("");
      setQuestionnaireDescription("");
      setQuestions([]);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      alert("Failed to save questionnaire. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Questionnaire Dashboard</h1>

      {/* Questionnaire Info */}
      <div className="questionnaire-info">
        <label>
          Title:
          <input
            type="text"
            value={questionnaireTitle}
            onChange={(e) => setQuestionnaireTitle(e.target.value)}
            placeholder="Enter questionnaire title"
          />
        </label>
        <label>
          Description:
          <textarea
            value={questionnaireDescription}
            onChange={(e) => setQuestionnaireDescription(e.target.value)}
            placeholder="Enter questionnaire description (optional)"
          />
        </label>
      </div>

      {/* Add Questions */}
      <div className="question-options">
        <select
          value={newQuestionType}
          onChange={(e) => setNewQuestionType(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="single-choice">Single Choice</option>
          <option value="multi-choice">Multiple Choice</option>
          <option value="rating">Rating</option>
          <option value="number">Number</option>
        </select>
        <button onClick={addQuestion}>Add Question</button>
      </div>

      {/* List of Questions */}
      <div className="questions-list">
        {questions.map((q) => (
          <div key={q.id} className="question-item">
            <label>
              Question Label:
              <input
                type="text"
                value={q.label}
                onChange={(e) => updateQuestion(q.id, "label", e.target.value)}
                placeholder="Enter question label"
              />
            </label>

            {q.type === "single-choice" || q.type === "multi-choice" ? (
              <div>
                <label>Options:</label>
                {q.options.map((option, index) => (
                  <div key={index}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...q.options];
                        updatedOptions[index] = e.target.value;
                        updateQuestion(q.id, "options", updatedOptions);
                      }}
                      placeholder="Enter option"
                    />
                    <button
                      onClick={() => {
                        const updatedOptions = q.options.filter((_, i) => i !== index);
                        updateQuestion(q.id, "options", updatedOptions);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => updateQuestion(q.id, "options", [...q.options, ""])}
                >
                  Add Option
                </button>
              </div>
            ) : null}

            <label>
              Required:
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => updateQuestion(q.id, "required", e.target.checked)}
              />
            </label>

            <button onClick={() => deleteQuestion(q.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Save and View Buttons */}
      <div className="button-group">
        <button className="save-button" onClick={saveQuestionnaire}>
          Save Questionnaire
        </button>
        <button className="view-button" onClick={() => navigate("/viewquestionnaire")}>
          View Questionnaires
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
