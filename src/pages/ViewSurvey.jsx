import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../assets/createClient";
import { PencilSquareIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import StarRating from "../components/StarRating";

const ViewSurvey = () => {
  const { surveyId, responseId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (surveyId) fetchSurveyData();
  }, [surveyId, responseId]);

  const fetchSurveyData = async () => {
    try {
      setLoading(true);
      const [surveyData, questionsData] = await Promise.all([
        fetchSurvey(),
        fetchQuestions(),
      ]);

      if (responseId) await fetchResponse(surveyData, questionsData);
      else setAnswers(initializeEmptyAnswers(questionsData));

      setSurvey(surveyData);
      setQuestions(questionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      navigate("/error", { state: { message: "Failed to load survey" } });
    } finally {
      setLoading(false);
    }
  };

  const fetchSurvey = async () => {
    const { data, error } = await supabase
      .from("surveys")
      .select("*")
      .eq("id", surveyId)
      .single();
    if (error) throw error;
    return data;
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("survey_id", surveyId)
      .order("created_at");
    if (error) throw error;
    return data.map(processQuestion);
  };

  const processQuestion = (q) => ({
    ...q,
    options: typeof q.options === "string" ? JSON.parse(q.options) : q.options || [],
  });

  const initializeEmptyAnswers = (questions) =>
    questions.reduce((acc, q) => ({ ...acc, [q.id]: q.question_type === "checkboxes" ? [] : "" }), {});

  const fetchResponse = async (surveyData, questionsData) => {
    const { data: responseData, error } = await supabase
      .from("responses")
      .select("*, answers(*)")
      .eq("id", responseId)
      .single();
    if (error) throw error;

    setAnswers(responseData.answers.reduce((acc, answer) => ({
      ...acc,
      [answer.question_id]: answer.answer_value
    }), initializeEmptyAnswers(questionsData)));
    setIsEditing(true);
  };

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => ({ ...prev, [questionId]: "" }));
  };

  const validateForm = () => {
    const newErrors = questions.reduce((acc, q) => {
      if (!q.is_required) return acc;
      const answer = answers[q.id];
      const isEmpty = Array.isArray(answer) 
        ? answer.length === 0
        : !answer?.toString().trim();
      return isEmpty ? { ...acc, [q.id]: "This question is required" } : acc;
    }, {});

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const responseIdToUse = await handleResponseUpdate();
      await handleAnswersUpdate(responseIdToUse);

      setSubmitted(true);
      if (isEditing) navigate(`/view/${surveyId}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message || "An error occurred while saving your response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseUpdate = async () => {
    if (isEditing) {
      await supabase
        .from("responses")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", responseId);
      await supabase
        .from("answers")
        .delete()
        .eq("response_id", responseId);
      return responseId;
    }

    const { data: newResponse } = await supabase
      .from("responses")
      .insert({ survey_id: surveyId })
      .select()
      .single();
    return newResponse.id;
  };

  const handleAnswersUpdate = async (responseId) => {
    const answerRows = questions.map(q => ({
      response_id: responseId,
      question_id: q.id,
      answer_value: answers[q.id] ?? "",
    }));

    const { error } = await supabase
      .from("answers")
      .insert(answerRows);
    if (error) throw error;
  };

  const renderQuestionInput = (q) => {
    const value = answers[q.id] ?? "";
    const error = errors[q.id];
    const inputProps = {
      question: q,
      value,
      error,
      onChange: (val) => handleChange(q.id, val),
    };

    switch (q.question_type) {
      case "shortAnswer": return <ShortAnswerInput {...inputProps} />;
      case "paragraph": return <ParagraphInput {...inputProps} />;
      case "multipleChoice": return <MultipleChoiceInput {...inputProps} />;
      case "checkboxes": return <CheckboxInput {...inputProps} />;
      case "dropdown": return <DropdownInput {...inputProps} />;
      case "rating": return <RatingInput {...inputProps} />;
      default: return null;
    }
  };

  if (loading) return <LoadingIndicator />;
  if (!survey) return <NotFound message="Survey not found." />;
  if (submitted) return <SubmissionSuccess isEditing={isEditing} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <Header survey={survey} isEditing={isEditing} navigate={navigate} />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map(q => (
              <div key={q.id} className="space-y-3">
                <QuestionLabel q={q} />
                {renderQuestionInput(q)}
                {errors[q.id] && <ErrorDisplay message={errors[q.id]} />}
              </div>
            ))}

            <FormControls
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              navigate={navigate}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const LoadingIndicator = () => (
  <div className="text-center mt-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
    <p className="mt-4 text-gray-600">Loading survey...</p>
  </div>
);

const NotFound = ({ message }) => (
  <p className="text-center mt-10">{message}</p>
);

const SubmissionSuccess = ({ isEditing }) => (
  <div className="text-center mt-10">
    <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />
    <h1 className="text-2xl font-bold mt-4 text-gray-800">
      {isEditing ? "Response updated successfully!" : "Thank you for your response!"}
    </h1>
  </div>
);

const Header = ({ survey, isEditing, navigate }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">
        {survey.title}
      </h1>
      <p className="text-gray-600 mt-2">{survey.description}</p>
    </div>
    {isEditing && (
      <button
        onClick={() => navigate(-1)}
        className="text-gray-500 hover:text-gray-700"
      >
        <XCircleIcon className="h-6 w-6" />
      </button>
    )}
  </div>
);

const QuestionLabel = ({ q }) => (
  <label className="block text-lg font-medium text-gray-900">
    {q.question_text}
    {q.is_required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorDisplay = ({ message }) => (
  <p className="text-red-500 text-sm">{message}</p>
);

const ShortAnswerInput = ({ value, onChange }) => (
  <input
    type="text"
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

const ParagraphInput = ({ value, onChange }) => (
  <textarea
    rows={4}
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

const MultipleChoiceInput = ({ question, value, onChange }) => (
  <div className="space-y-2">
    {question.options.map((opt) => (
      <label key={opt} className="inline-grid grid-cols-3 items-center space-x-3">
        <input
          type="radio"
          name={`radio-${question.id}`}
          className="h-5 w-5 text-indigo-600"
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        <span className="text-gray-700">{opt}</span>
      </label>
    ))}
  </div>
);

const CheckboxInput = ({ question, value = [], onChange }) => (
  <div className="space-y-2">
    {question.options.map((opt) => (
      <label key={opt} className="inline-grid grid-cols-3 items-center space-x-3">
        <input
          type="checkbox"
          className="h-5 w-5 text-indigo-600"
          checked={value.includes(opt)}
          onChange={(e) => 
            onChange(e.target.checked 
              ? [...value, opt] 
              : value.filter(item => item !== opt)
            )
          }
        />
        <span className="text-gray-700">{opt}</span>
      </label>
    ))}
  </div>
);

const DropdownInput = ({ question, value, onChange }) => (
  <select
    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">Select an option</option>
    {question.options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const RatingInput = ({ value, onChange }) => (
  <StarRating
    value={value || 0}
    onChange={onChange}
    maxStars={5}
    editable={true}
    activeColor="#4F46E5"
  />
);

const FormControls = ({ isEditing, isSubmitting, navigate }) => (
  <div className="mt-8 flex gap-4">
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
      {isEditing ? (
        <div className="flex items-center justify-center gap-2">
          <PencilSquareIcon className="h-5 w-5" />
          {isSubmitting ? "Updating..." : "Update Response"}
        </div>
      ) : (
        isSubmitting ? "Submitting..." : "Submit Response"
      )}
    </button>
    
    {isEditing && (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Cancel
      </button>
    )}
  </div>
);

export default ViewSurvey;