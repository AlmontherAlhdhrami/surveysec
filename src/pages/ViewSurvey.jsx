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
  const [sections, setSections] = useState([]);
const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
const goToNextSection = (e) => {
  e?.preventDefault(); // Add this to prevent form submission
  if (currentSectionIndex < sections.length - 1) {
    setCurrentSectionIndex(currentSectionIndex + 1);
  }
};

const goToPrevSection = (e) => {
  e?.preventDefault(); // Add this to prevent form submission
  if (currentSectionIndex > 0) {
    setCurrentSectionIndex(currentSectionIndex - 1);
  }
};
const isLastSection = currentSectionIndex === sections.length - 1;

const fetchSections = async () => {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("survey_id", surveyId)
    .order("order", { ascending: true });

  if (error) throw error;
  return data;
};


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
     const [surveyData, questionsData, sectionData] = await Promise.all([
  fetchSurvey(),
  fetchQuestions(),
  fetchSections(),
]);

setSurvey(surveyData);
setQuestions(questionsData);
setSections(sectionData); 


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
         {sections.length > 0 && (
  <div key={sections[currentSectionIndex].id} className="mb-10">
    <h2 className="text-xl font-bold mb-2" style={{ color: answerColor }}>
      {sections[currentSectionIndex].title}
    </h2>
    {sections[currentSectionIndex].description && (
      <p className="text-gray-700 mb-4">{sections[currentSectionIndex].description}</p>
    )}

    {questions
      .filter(q => q.section_id === sections[currentSectionIndex].id)
      .map(q => (
        <div key={q.id} className="space-y-3 mb-6">
          <QuestionLabel q={q} answerColor={answerColor} />
          {renderQuestionInput(q)}
          {errors[q.id] && <ErrorDisplay message={errors[q.id]} />}
        </div>
      ))}
  </div>
)}

<FormControls
  isEditing={isEditing}
  isSubmitting={isSubmitting}
  navigate={navigate}
  answerColor={answerColor}
  currentSectionIndex={currentSectionIndex}
  isLastSection={isLastSection}
  goToNextSection={goToNextSection}
  goToPrevSection={goToPrevSection}
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
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {question.options.map((opt) => (
      <label
        key={opt}
        className="flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all hover:bg-gray-50"
        style={{
          borderColor: value === opt ? answerColor : "#e5e7eb",
          backgroundColor: value === opt ? `${answerColor}22` : "white",
        }}
      >
        <input
          type="radio"
          name={`radio-${question.id}`}
          className="h-5 w-5"
          style={{ accentColor: answerColor }}
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        <span className="text-gray-800">{opt}</span>
      </label>
    ))}
  </div>
);

const CheckboxInput = ({ question, value = [], onChange, answerColor }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {question.options.map((opt) => (
      <label
        key={opt}
        className="flex items-center gap-2 p-3 border rounded-md cursor-pointer transition-all hover:bg-gray-50"
        style={{
          borderColor: value.includes(opt) ? answerColor : "#e5e7eb",
          backgroundColor: value.includes(opt) ? `${answerColor}22` : "white",
        }}
      >
        <input
          type="checkbox"
          className="h-5 w-5"
          style={{ accentColor: answerColor }}
          checked={value.includes(opt)}
          onChange={(e) =>
            onChange(
              e.target.checked
                ? [...value, opt]
                : value.filter((item) => item !== opt)
            )
          }
        />
        <span className="text-gray-800">{opt}</span>
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

const FormControls = ({
  isEditing,
  isSubmitting,
  navigate,
  answerColor,
  currentSectionIndex,
  isLastSection,
  goToNextSection,
  goToPrevSection
}) => (
  <div className="flex justify-between items-center gap-4 mt-6">
    {/* Previous Section Button */}
    {currentSectionIndex > 0 && (
      <button
        type="button" // ✅ Prevent form submission
        onClick={goToPrevSection}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
      >
        Previous Section
      </button>
    )}

    {/* Next or Submit Button */}
    {!isLastSection ? (
      <button
        type="button" // ✅ Prevent form submission
        onClick={goToNextSection}
        className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Next Section
      </button>
    ) : (
      <button
        type="submit"
        disabled={isSubmitting}
        className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-60"
      >
        {isEditing
          ? (isSubmitting ? "Updating..." : "Update Response")
          : (isSubmitting ? "Submitting..." : "Submit Response")}
      </button>
    )}
  </div>
);





export default ViewSurvey;