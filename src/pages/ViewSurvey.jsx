import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../assets/createClient";

// Simple Star Rating Component
const StarRating = ({ value, onChange, maxStars = 5 }) => {
  return (
    <div className="flex">
      {Array.from({ length: maxStars }, (_, index) => (
        <span
          key={index}
          className={`cursor-pointer text-2xl ${index < value ? "text-yellow-500" : "text-gray-300"}`}
          onClick={() => onChange(index + 1)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ViewSurvey = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (surveyId) {
      fetchSurveyFromDB(surveyId);
    }
  }, [surveyId]);

  // Fetch survey and questions from Supabase
  const fetchSurveyFromDB = async (id) => {
    setLoading(true);
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", id)
        .single();

      if (surveyError) {
        console.error("Error fetching survey:", surveyError);
        return;
      }

      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", id);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return;
      }

      // Parse options if they are stored as a string
      const processedQuestions = questionsData.map((q) => ({
        ...q,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options || [],
      }));

      setSurvey(surveyData);
      setQuestions(processedQuestions);
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (qIndex, value) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: value }));
    setErrors((prev) => ({ ...prev, [qIndex]: "" })); // Clear error when user inputs
  };

  // **Validation before submission**
  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    questions.forEach((q, index) => {
      if (q.is_required && (!answers[index] || answers[index].length === 0)) {
        newErrors[index] = "This question is required.";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    if (!surveyId) {
      alert("No survey ID found!");
      return;
    }

    try {
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyId })
        .select()
        .single();

      if (responseError) {
        console.error("Error creating response:", responseError);
        alert("Failed to submit survey.");
        return;
      }

      const responseId = responseData.id;

      const answerRows = questions.map((q, index) => ({
        response_id: responseId,
        question_id: q.id,
        answer_value: answers[index] || "",
      }));

      const { error: answersError } = await supabase
        .from("answers")
        .insert(answerRows);

      if (answersError) {
        console.error("Error inserting answers:", answersError);
        alert("Failed to save answers.");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An error occurred while submitting the survey.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading survey...</p>;
  if (!survey) return <p className="text-center mt-10">Survey not found.</p>;
  if (submitted) return <h1 className="text-center mt-10 text-green-600 text-2xl">Thank you for your response!</h1>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700">{survey.title}</h1>
        <p className="text-center text-gray-600 mb-6">{survey.description}</p>

        <form onSubmit={handleSubmit}>
          {questions.map((q, qIndex) => (
            <div key={q.id} className="mb-6">
              <label className="block font-medium text-gray-800 mb-2">
                {q.question_text}
                {q.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.question_type === "shortAnswer" && (
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                />
              )}

              {q.question_type === "paragraph" && (
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                />
              )}

              {q.question_type === "multipleChoice" && (
                <div>
                  {q.options.map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`radio-${qIndex}`}
                        className="mr-2"
                        onChange={() => handleChange(qIndex, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "checkboxes" && (
                <div>
                  {q.options.map((opt, oIndex) => (
                    <label key={oIndex} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [qIndex]: prev[qIndex] ? [...prev[qIndex], opt] : [opt],
                          }))
                        }
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === "dropdown" && (
                <select
                  className="w-full p-2 border rounded"
                  onChange={(e) => handleChange(qIndex, e.target.value)}
                >
                  <option value="">Select an option</option>
                  {q.options.map((opt, oIndex) => (
                    <option key={oIndex} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {q.question_type === "rating" && (
                <StarRating
                  value={answers[qIndex] || 0}
                  onChange={(starValue) => handleChange(qIndex, starValue)}
                  maxStars={5}
                />
              )}

              {errors[qIndex] && <p className="text-red-500 text-sm">{errors[qIndex]}</p>}
            </div>
          ))}

          <button
            type="submit"
            className="w-full p-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ViewSurvey;
