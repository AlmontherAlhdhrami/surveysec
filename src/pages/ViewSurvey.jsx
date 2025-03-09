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
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [answerColor, setAnswerColor] = useState('#4f46e5');
  

  useEffect(() => {
    if (surveyId) fetchSurveyData();
  }, [surveyId, responseId]);

  const safeJsonParse = (value, fallback) => {
    try {
      if (typeof value === 'string') return JSON.parse(value);
      return Array.isArray(value) ? value : fallback;
    } catch {
      return fallback;
    }
  };

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
      .select("*, frame_color, answer_color")
      .eq("id", surveyId)
      .single();

    if (error) throw error;
    
    setFrameColor(data.frame_color || '#ffffff');
    setAnswerColor(data.answer_color || '#4f46e5');
    
    return data;
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("survey_id", surveyId)
      .order("created_at");

    if (error) throw error;
    
    return data.map(q => ({
      ...q,
      options: safeJsonParse(q.options, []),
      rows: safeJsonParse(q.rows, []),
      columns: safeJsonParse(q.columns, []),
    }));
  };

  const initializeEmptyAnswers = (questions) =>
    questions.reduce((acc, q) => ({
      ...acc, 
      [q.id]: ["checkboxes", "checkboxGrid"].includes(q.question_type) ? [] :
              q.question_type === "multipleChoiceGrid" ? {} : 
              ""
    }), {});

  const fetchResponse = async (surveyData, questionsData) => {
    const { data: responseData, error } = await supabase
      .from("responses")
      .select("*, answers(*)")
      .eq("id", responseId)
      .single();

    if (error) throw error;

    const parsedAnswers = responseData.answers.reduce((acc, answer) => {
      try {
        const question = questionsData.find(q => q.id === answer.question_id);
        let value = safeJsonParse(answer.answer_value, answer.answer_value);

        if (question?.question_type.endsWith("Grid")) {
          value = Object.entries(value).reduce((gridAcc, [key, val]) => ({
            ...gridAcc,
            [key]: val
          }), {});
        }

        return { ...acc, [answer.question_id]: value };
      } catch (e) {
        return acc;
      }
    }, {});

    setAnswers(parsedAnswers);
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
      let isValid = true;

      if (q.question_type === "multipleChoiceGrid") {
        isValid = Object.keys(answer || {}).length === q.rows.length;
      } else if (q.question_type === "checkboxGrid") {
        isValid = Object.values(answer || {}).every(
          selections => selections.length > 0
        );
      } else if (Array.isArray(answer)) {
        isValid = answer.length > 0;
      } else {
        isValid = !!answer?.toString().trim();
      }

      return isValid ? acc : { ...acc, [q.id]: "This question is required" };
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
    const answerRows = questions.flatMap(q => {
      const answer = answers[q.id];
      
      if (["multipleChoiceGrid", "checkboxGrid"].includes(q.question_type)) {
        return Object.entries(answer || {}).map(([rowIndex, colValue]) => ({
          response_id: responseId,
          question_id: q.id,
          answer_value: JSON.stringify({
            type: q.question_type,
            rowIndex: parseInt(rowIndex),
            selections: colValue
          })
        }));
      }
      
      return {
        response_id: responseId,
        question_id: q.id,
        answer_value: Array.isArray(answer) ? JSON.stringify(answer) : answer
      };
    });

    const { error } = await supabase.from("answers").insert(answerRows);
    if (error) throw error;
  };

  const renderQuestionInput = (q) => {
    const value = answers[q.id] ?? "";
    const error = errors[q.id];
    const inputProps = {
      question: q,
      value,
      error,
      answerColor,
      onChange: (val) => handleChange(q.id, val),
    };

    switch (q.question_type) {
      case "shortAnswer": return <ShortAnswerInput {...inputProps} />;
      case "paragraph": return <ParagraphInput {...inputProps} />;
      case "multipleChoice": return <MultipleChoiceInput {...inputProps} />;
      case "checkboxes": return <CheckboxInput {...inputProps} />;
      case "dropdown": return <DropdownInput {...inputProps} />;
      case "rating": return <RatingInput {...inputProps} />;
      case "multipleChoiceGrid": return <GridRadioInput {...inputProps} />;
      case "checkboxGrid": return <GridCheckboxInput {...inputProps} />;
      default: return null;
    }
  };

  if (loading) return <LoadingIndicator />;
  if (!survey) return <NotFound message="Survey not found." />;
  if (submitted) return <SubmissionSuccess isEditing={isEditing} />;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: frameColor }}>
      <div className="max-w-2xl mx-auto px-4">
        <div 
          className="bg-white rounded-xl shadow-lg p-6 sm:p-8"
          style={{
            border: `2px solid ${answerColor}`,
            boxShadow: `0 4px 6px ${answerColor}33`
          }}
        >
          <Header survey={survey} isEditing={isEditing} navigate={navigate} answerColor={answerColor} />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map(q => (
              <div key={q.id} className="space-y-3">
                <QuestionLabel q={q} answerColor={answerColor} />
                {renderQuestionInput(q)}
                {errors[q.id] && <ErrorDisplay message={errors[q.id]} />}
              </div>
            ))}

            <FormControls
              isEditing={isEditing}
              isSubmitting={isSubmitting}
              navigate={navigate}
              answerColor={answerColor}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

const GridRadioInput = ({ question, value = {}, onChange, error, answerColor }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="p-2 border" style={{ borderColor: answerColor }}></th>
          {question.columns.map((col, cIndex) => (
            <th 
              key={cIndex} 
              className="p-2 border font-medium"
              style={{ borderColor: answerColor }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {question.rows.map((row, rIndex) => (
          <tr key={rIndex}>
            <td 
              className="p-2 border font-medium"
              style={{ borderColor: answerColor }}
            >
              {row}
            </td>
            {question.columns.map((_, cIndex) => (
              <td 
                key={cIndex} 
                className="p-2 border text-center"
                style={{ borderColor: answerColor }}
              >
                <input
                  type="radio"
                  name={`row-${question.id}-${rIndex}`}
                  checked={value[rIndex] === cIndex}
                  onChange={() => onChange({
                    ...value,
                    [rIndex]: value[rIndex] === cIndex ? null : cIndex
                  })}
                  style={{ 
                    accentColor: answerColor,
                    borderColor: answerColor
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {error && <ErrorDisplay message={error} />}
  </div>
);

const GridCheckboxInput = ({ question, value = {}, onChange, error, answerColor }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="p-2 border" style={{ borderColor: answerColor }}></th>
          {question.columns.map((col, cIndex) => (
            <th 
              key={cIndex} 
              className="p-2 border font-medium"
              style={{ borderColor: answerColor }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {question.rows.map((row, rIndex) => (
          <tr key={rIndex}>
            <td 
              className="p-2 border font-medium"
              style={{ borderColor: answerColor }}
            >
              {row}
            </td>
            {question.columns.map((_, cIndex) => (
              <td 
                key={cIndex} 
                className="p-2 border text-center"
                style={{ borderColor: answerColor }}
              >
                <input
                  type="checkbox"
                  checked={(value[rIndex] || []).includes(cIndex)}
                  onChange={(e) => {
                    const current = value[rIndex] || [];
                    const newValue = e.target.checked
                      ? [...current, cIndex]
                      : current.filter(item => item !== cIndex);
                    
                    onChange({
                      ...value,
                      [rIndex]: newValue
                    });
                  }}
                  style={{ 
                    accentColor: answerColor,
                    borderColor: answerColor
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {error && <ErrorDisplay message={error} />}
  </div>
);

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

const Header = ({ survey, isEditing, navigate, answerColor }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: answerColor }}>
        {survey.title}
      </h1>
      <p className="mt-2" style={{ color: answerColor }}>{survey.description}</p>
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

const QuestionLabel = ({ q, answerColor }) => (
  <label className="block text-lg font-medium" style={{ color: answerColor }}>
    {q.question_text}
    {q.is_required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const ErrorDisplay = ({ message }) => (
  <p className="text-red-500 text-sm">{message}</p>
);

const ShortAnswerInput = ({ value, onChange, answerColor }) => (
  <input
    type="text"
    className="w-full p-3 rounded-lg focus:ring-2"
    style={{
      border: `2px solid ${answerColor}`,
      focusRingColor: answerColor
    }}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

const ParagraphInput = ({ value, onChange, answerColor }) => (
  <textarea
    rows={4}
    className="w-full p-3 rounded-lg focus:ring-2"
    style={{
      border: `2px solid ${answerColor}`,
      focusRingColor: answerColor
    }}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);

const MultipleChoiceInput = ({ question, value, onChange, answerColor }) => (
  <div className="space-y-2">
    {question.options.map((opt) => (
      <label key={opt} className="inline-grid grid-cols-3 items-center space-x-3">
        <input
          type="radio"
          name={`radio-${question.id}`}
          className="h-5 w-5"
          style={{ 
            accentColor: answerColor,
            borderColor: answerColor 
          }}
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        <span style={{ color: answerColor }}>{opt}</span>
      </label>
    ))}
  </div>
);

const CheckboxInput = ({ question, value = [], onChange, answerColor }) => (
  <div className="space-y-2">
    {question.options.map((opt) => (
      <label key={opt} className="inline-grid grid-cols-3 items-center space-x-3">
        <input
          type="checkbox"
          className="h-5 w-5"
          style={{ 
            accentColor: answerColor,
            borderColor: answerColor 
          }}
          checked={value.includes(opt)}
          onChange={(e) => 
            onChange(e.target.checked 
              ? [...value, opt] 
              : value.filter(item => item !== opt)
            )
          }
        />
        <span style={{ color: answerColor }}>{opt}</span>
      </label>
    ))}
  </div>
);

const DropdownInput = ({ question, value, onChange, answerColor }) => (
  <select
    className="w-full p-3 rounded-lg focus:ring-2"
    style={{
      border: `2px solid ${answerColor}`,
      focusRingColor: answerColor
    }}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">Select an option</option>
    {question.options.map((opt) => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const RatingInput = ({ value, onChange, answerColor }) => (
  <StarRating
    value={value || 0}
    onChange={onChange}
    maxStars={5}
    editable={true}
    activeColor={answerColor}
  />
);

const FormControls = ({ isEditing, isSubmitting, navigate, answerColor }) => (
  <div className="mt-8 flex gap-4">
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex-1 py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
      style={{
        backgroundColor: answerColor,
        color: '#ffffff',
        hoverBg: `${answerColor}dd`
      }}
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