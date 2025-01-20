import React, { useEffect, useState } from "react";
import "./survey.css"; // Include styles for consistent design
import { Supabase } from "../assets/createClient";

const ViewQuestionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch questions from the Supabase database
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const { data, error } = await Supabase.from("questionnaires").select("*");

        if (error) throw error;

        setQuestions(data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>View Saved Questionnaires</h1>

      {loading ? (
        <p>Loading, please wait...</p>
      ) : questions.length === 0 ? (
        <p>No questionnaires found. Please create one!</p>
      ) : (
        <div className="questions-list">
          {questions.map((question, index) => (
            <div key={index} className="question-item">
              <h3>Question {index + 1}</h3>
              <p>
                <strong>Label:</strong> {question.question_label}
              </p>
              <p>
                <strong>Type:</strong> {question.question_type}
              </p>

              {question.options && question.options.length > 0 && (
                <div>
                  <strong>Options:</strong>
                  <ul>
                    {question.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p>
                <strong>Required:</strong> {question.required ? "Yes" : "No"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewQuestionnaire;
