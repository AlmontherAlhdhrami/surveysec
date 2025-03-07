import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSurveyContext } from "../context/SurveyContext";
import StarRating from "../components/StarRating";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../assets/createClient";
import { CheckIcon, ClipboardDocumentIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

const SurveyPreview = () => {
  const { surveyDBId, title, description, frameColor, answerColor } = useSurveyContext();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [shareLink, setShareLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add form validation state
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    if (surveyDBId) {
      setShareLink(`${window.location.origin}/view/${surveyDBId}`);
      fetchQuestions();
    }
  }, [surveyDBId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("survey_id", surveyDBId)
        .order("created_at", { ascending: true });
  
      if (error) throw error;
  
      // Convert rows & columns from JSON string to array
      const processedQuestions = data.map(q => ({
        ...q,
        options: parseSurveyField(q.options),
        rows: parseSurveyField(q.rows),
        columns: parseSurveyField(q.columns)
      }));
  
      setQuestions(processedQuestions);
    } catch (err) {
      console.error("Error fetching questions:", err);
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
  // Enhanced validation check
  const validateForm = () => {
    const errors = questions.reduce((acc, q, index) => {
      if (q.is_required && !answers[index]?.length) {
        acc.push(`Question ${index + 1} is required`);
      }
      return acc;
    }, []);
    
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleGridChange = (qIndex, rIndex, cIndex, checked) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (!newAnswers[qIndex]) newAnswers[qIndex] = {};
  
      if (checked) {
        if (questions[qIndex].type === "multipleChoiceGrid") {
          newAnswers[qIndex][rIndex] = [cIndex];
        } else {
          newAnswers[qIndex][rIndex] = [
            ...(newAnswers[qIndex][rIndex] || []),
            cIndex
          ];
        }
      } else {
        newAnswers[qIndex][rIndex] = (newAnswers[qIndex][rIndex] || [])
          .filter(c => c !== cIndex);
      }
      
      return newAnswers;
    });
  };
  const handleInputChange = (qIndex, value) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };
  
  const handleMultipleChoiceChange = (qIndex, value) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };
  
  const handleCheckboxChange = (qIndex, value) => {
    setAnswers(prev => {
      const current = prev[qIndex] || [];
      return {
        ...prev,
        [qIndex]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    try {
      const { data: responseData, error: responseError } = await supabase
        .from("responses")
        .insert({ survey_id: surveyDBId })
        .select()
        .single();
  
      if (responseError) throw responseError;
  
      // Convert grid answers
      const answerRows = questions.flatMap((q, qIndex) => {
        if (["multipleChoiceGrid", "checkboxGrid"].includes(q.question_type)) {
          return Object.entries(answers[qIndex] || {}).flatMap(([rowIndex, selectedCols]) =>
            selectedCols.map((colIndex) => ({
              response_id: responseData.id,
              question_id: q.id,
              answer_value: `Row: ${q.rows[rowIndex]}, Col: ${q.columns[colIndex]}`
            }))
          );
        } else {
          return [{
            response_id: responseData.id,
            question_id: q.id,
            answer_value: answers[qIndex] || "",
          }];
        }
      });
  
      const { error: answersError } = await supabase.from("answers").insert(answerRows);
      if (answersError) throw answersError;
  
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setAnswers({});
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Download QR code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById("qrcode");
    const pngUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "survey-qrcode.png";
    link.href = pngUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow py-25 mb-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700 flex items-center gap-2">
            <SparklesIcon className="h-8 w-8 text-indigo-500" />
            Survey Preview
          </h1>
          <Link
            to="/builder"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Back to Builder
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-10">
        {/* Success Message */}
        {showSuccess && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-3">
            <CheckIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold">Thank you for your response!</p>
              <p className="text-sm">Your answers have been saved successfully.</p>
            </div>
          </div>
        )}

        {/* Form Errors */}
        {formErrors.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Survey Card */}
        <div 
          className="max-w-4xl mx-auto rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl"
          style={{ backgroundColor: frameColor }}
        >
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">{title}</h2>
              <p className="text-gray-700 text-lg">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {questions.map((q, qIndex) => (
                <div 
                  key={q.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                >
                  <label className="block text-lg font-medium text-gray-900 mb-4">
                    {q.question_text}
                    {q.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {/* Input Fields */}
                  {q.question_type === "shortAnswer" && (
                    <input
                      type="text"
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        borderColor: answerColor,
                        focusRingColor: answerColor
                      }}
                      onChange={(e) => handleInputChange(qIndex, e.target.value)}
                    />
                  )}

                  {q.question_type === "paragraph" && (
                    <textarea
                      rows={4}
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        borderColor: answerColor,
                        focusRingColor: answerColor
                      }}
                      onChange={(e) => handleInputChange(qIndex, e.target.value)}
                    />
                  )}

                  {["multipleChoice", "checkboxes"].includes(q.question_type) && (
                    <div className="space-y-3">
                      {q.options.map((opt, oIndex) => (
                        <label
                          key={oIndex}
                          className="inline-grid grid-cols-3  items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type={q.question_type === "multipleChoice" ? "radio" : "checkbox"}
                            name={`question-${qIndex}`}
                            className="h-5 w-5"
                            style={{
                              accentColor: answerColor
                            }}
                            onChange={() =>
                              q.question_type === "multipleChoice"
                                ? handleMultipleChoiceChange(qIndex, opt)
                                : handleCheckboxChange(qIndex, opt)
                            }
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

{["multipleChoiceGrid", "checkboxGrid"].includes(q.question_type) && (
  <div className="overflow-auto">
    <table className=" border w-full">
      <thead>
        <tr>
          <th className="border px-4 py-2"></th> {/* Empty top-left cell */}
          {(q.columns || []).map((col, cIndex) => (
            <th key={cIndex} className="border px-4 py-2 ">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(q.rows || []).map((row, rIndex) => (
          <tr key={rIndex}>
            <td className="border px-4 py-2 font-medium">{row}</td>
            {(q.columns || []).map((_, cIndex) => (
              <td key={cIndex} className="border px-4 py-2 text-center">
                <input
                  type={q.question_type === "multipleChoiceGrid" ? "radio" : "checkbox"}
                  name={`grid-${qIndex}-row${rIndex}`}
                  onChange={(e) => handleGridChange(qIndex, rIndex, cIndex, e.target.checked)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


                  {q.question_type === "dropdown" && (
                    <select
                      className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:outline-none"
                      style={{
                        borderColor: answerColor,
                        focusRingColor: answerColor
                      }}
                      onChange={(e) => handleInputChange(qIndex, e.target.value)}
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
                    <div className="flex flex-col items-center space-y-4">
                      <StarRating
                        value={answers[qIndex] || 0}
                        onChange={(starValue) => handleStarChange(qIndex, starValue)}
                        maxStars={5}
                        starSize="2.5rem"
                        activeColor={answerColor}
                      />
                      <span className="text-sm text-gray-600">
                        {answers[qIndex] ? `${answers[qIndex]} stars` : "Select rating"}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 text-lg font-semibold text-white rounded-lg transition-all ${
                  isSubmitting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Responses"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-10 max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <SparklesIcon className="h-6 w-6 text-indigo-500" />
              Share Your Survey
            </h3>
            
            <div className="flex flex-col items-center space-y-6">
              <QRCodeCanvas
                id="qrcode"
                value={shareLink}
                size={200}
                bgColor="#ffffff"
                fgColor={answerColor}
                level="H"
                className="p-4 bg-white rounded-lg border-2"
                style={{ borderColor: answerColor }}
              />

              <div className="w-full max-w-md space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="w-full p-3 border-2 rounded-lg text-center truncate"
                    style={{ borderColor: answerColor }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copy link"
                  >
                    <ClipboardDocumentIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                {copied && (
                  <div className="text-green-600 flex items-center gap-2 justify-center">
                    <CheckIcon className="h-5 w-5" />
                    Link copied to clipboard!
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={downloadQRCode}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 justify-center"
                >
                  Download QR Code
                </button>
                <Link
                  to={`/view/${surveyDBId}`}
                  target="_blank"
                  className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center gap-2 justify-center"
                >
                  Open Survey Page
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview;