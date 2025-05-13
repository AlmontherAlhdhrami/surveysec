import React, { useEffect, useState, useCallback } from "react";
import { useSurveyContext } from "../context/surveycontexts";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "../assets/createClient";
import { QRCodeCanvas } from "qrcode.react";
import "../App.css"

import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon, // For completed steps
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon, // For Save Survey (updated icon)
  SquaresPlusIcon, // For Sections (updated icon)
  PaintBrushIcon, // For Appearance (updated icon)
  PaperAirplaneIcon // For Share/Preview (updated icon)
} from "@heroicons/react/24/outline";
import { SwatchIcon } from "@heroicons/react/24/solid";
import { useSurveyHelper } from "../utils/sureveyhepler";
import { decrypt } from "../service/cryptoHelper"; // Adjusted path

const SurveyBuilder = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  
  const {
    surveyDBId,
    setSurveyDBId,
    title,
    setTitle,
    description,
    setDescription,
    questions,
    setQuestions,
    sections,
    setSections,
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
    removeColumn,
  } = useSurveyHelper();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const parseSurveyField = useCallback((value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (jsonError) {
            try {
                return value.split(",").map(item => item.trim()).filter(item => item); // Filter out empty strings from split
            } catch (csvError) {
                console.warn('Failed to parse field as CSV:', value, csvError);
                return [];
            }
        }
    }
    return []; // Default to empty array if not string or array
  }, []);

  useEffect(() => {
    const fetchSurveyData = async (id) => {
      setLoading(true);
      try {
        const { data: survey, error: surveyError } = await supabase
          .from("surveys")
          .select("*")
          .eq("id", id)
          .single();
    
        if (surveyError) throw surveyError;
    
        const { data: dbSections, error: sectionsError } = await supabase
          .from("sections")
          .select("*")
          .eq("survey_id", id)
          .order("order", { ascending: true });
  
        if (sectionsError) throw sectionsError;
  
        const { data: qData, error: qError } = await supabase
          .from("questions")
          .select("*")
          .eq("survey_id", id)
          .order("created_at", { ascending: true });
    
        if (qError) throw qError;
    
        setSurveyDBId(survey.id);
        setTitle(decrypt(survey.title) || "");
        setDescription(survey.description || ""); 
        setFrameColor(survey.frame_color || "#ffffff");
        setAnswerColor(survey.answer_color || "#4f46e5");
  
        const processedSections = dbSections.map(s => ({...s, title: decrypt(s.title || ""), description: decrypt(s.description || "") }));
        
        if (processedSections.length > 0) {
            setSections(processedSections);
            setActiveSectionId(processedSections[0].id);
        } else {
            const defaultSection = { id: `temp-${Date.now()}`, title: "Default Section", description: "", order: 1 };
            setSections([defaultSection]);
            setActiveSectionId(defaultSection.id);
        }
    
        const mappedQuestions = qData.map((dbQ) => ({
          id: dbQ.id,
          text: decrypt(dbQ.question_text),
          type: dbQ.question_type,
          required: dbQ.is_required,
          options: parseSurveyField(dbQ.options),
          rows: parseSurveyField(dbQ.rows),
          columns: parseSurveyField(dbQ.columns),
          section_id: dbQ.section_id
        }));
        setQuestions(mappedQuestions);
      } catch (err) {
        console.error("Error loading survey:", err);
        alert("Failed to load survey data. Redirecting to dashboard.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurveyData(surveyId);
    } else {
      // Initialize for a new survey
      setTitle("");
      setDescription("");
      setQuestions([]);
      const initialSection = { id: `temp-${Date.now()}`, title: "Section 1", description: "", order: 1 };
      setSections([initialSection]);
      setActiveSectionId(initialSection.id);
      setFrameColor("#ffffff");
      setAnswerColor("#4f46e5");
      setLoading(false);
    }
  }, [surveyId, setSurveyDBId, setTitle, setDescription, setQuestions, setSections, setFrameColor, setAnswerColor, navigate, parseSurveyField]);

  const handleAddSection = () => {
    const newSection = {
      id: `temp-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: "",
      order: sections.length + 1,
    };
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
  };

  const handleUpdateSection = (sectionId, field, value) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    );
  };

  const handleRemoveSection = (sectionIdToRemove) => {
    if (sections.length <= 1) {
        alert("A survey must have at least one section.");
        return;
    }
    setQuestions(questions.filter(q => q.section_id !== sectionIdToRemove));
    const remainingSections = sections.filter((s) => s.id !== sectionIdToRemove);
    setSections(remainingSections);
    if (activeSectionId === sectionIdToRemove) {
      setActiveSectionId(remainingSections.length > 0 ? remainingSections[0].id : null);
    }
  };

  const totalSteps = 5;
  const stepNames = ["Details", "Sections", "Questions", "Appearance", "Share & Preview"];

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSaveSurvey = async () => {
    setIsSaving(true);
    try {
      await handleSaveSurvey(); // This now handles sections internally
      // The handleSaveSurvey in useSurveyHelper shows an alert on success/error
      // If surveyDBId was null and is now set, we might want to update the URL or enable preview
    } catch (error) {
      // Error is handled by alert in useSurveyHelper
      console.error("Error during save operation in component:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div><p className="mt-4 text-lg text-gray-700">Loading Survey Builder...</p></div>;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Survey Info
        return (
          <div className="space-y-6 p-2">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Survey Details</h3>
            <div>
              <label htmlFor="surveyTitle" className="block text-md font-medium text-gray-800 mb-1">Survey Title</label>
              <input id="surveyTitle" type="text" placeholder="Enter the main title of your survey" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="surveyDescription" className="block text-md font-medium text-gray-800 mb-1">Survey Description</label>
              <textarea id="surveyDescription" placeholder="Provide a brief description for your survey" className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" rows={4} value={description || ""} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
        );
      case 2: // Sections
        return (
          <div className="space-y-6 p-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-indigo-700">Manage Sections</h3>
                <button onClick={handleAddSection} className="px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"><PlusIcon className="h-5 w-5"/>Add New Section</button>
            </div>
            {sections.map((section, index) => (
              <div key={section.id || index} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                    <input type="text" placeholder={`Section ${index + 1} Title`} className="flex-grow p-2.5 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-lg font-medium bg-transparent transition-colors" value={section.title} onChange={(e) => handleUpdateSection(section.id, "title", e.target.value)} />
                    <button onClick={() => handleRemoveSection(section.id)} className="ml-3 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="Remove Section"><TrashIcon className="h-5 w-5" /></button>
                </div>
                <textarea placeholder="Optional: Describe this section" className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow" rows={2} value={section.description|| ""} onChange={(e) => handleUpdateSection(section.id, "description", e.target.value)} />
              </div>
            ))}
          </div>
        );
      case 3: // Questions per Section
        return (
          <div className="space-y-8 p-2">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Add & Edit Questions</h3>
            <div className="mb-6">
              <label htmlFor="activeSectionSelect" className="block text-md font-medium text-gray-800 mb-1">Current Section:</label>
              <select id="activeSectionSelect" value={activeSectionId || ""} onChange={(e) => setActiveSectionId(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow">
                {sections.map(s => <option key={s.id} value={s.id}>{decrypt(s.title )|| "Untitled Section"}</option>)}
              </select>
            </div>
            {activeSectionId && questions.filter(q => q.section_id === activeSectionId).map((q, qIndexInSection) => {
              const originalQIndex = questions.findIndex(originalQ => originalQ === q);
              return (
                <div key={originalQIndex} className="p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm space-y-4">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <input type="text" placeholder="Enter your question here..." className="flex-grow p-2.5 border-b-2 border-gray-300 focus:border-indigo-500 focus:outline-none text-lg font-medium bg-transparent transition-colors" value={q.text} onChange={(e) => updateQuestionText(originalQIndex, e.target.value)} />
                    <button onClick={() => removeQuestion(originalQIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors" title="Remove Question"><TrashIcon className="h-5 w-5" /></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow" value={q.type} onChange={(e) => updateQuestionType(originalQIndex, e.target.value)}>
                      <option value="shortAnswer">Short Answer</option>
                      <option value="paragraph">Paragraph</option>
                      <option value="multipleChoice">Multiple Choice</option>
                      <option value="checkboxes">Checkboxes</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="rating">Star Rating (1-5)</option>
                      <option value="multipleChoiceGrid">Multiple Choice Grid</option>
                      <option value="checkboxGrid">Checkbox Grid</option>
                    </select>
                    <label className="flex items-center justify-end space-x-2 cursor-pointer p-2 hover:bg-indigo-50 rounded-md">
                        <input type="checkbox" checked={q.required || false} onChange={() => toggleRequired(originalQIndex)} className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-colors" />
                        <span className="text-sm font-medium text-gray-700">Required</span>
                    </label>
                  </div>
                  {["multipleChoice", "checkboxes", "dropdown"].includes(q.type) && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-600 mb-1">Options:</h4>
                      {(q.options || []).map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input type="text" placeholder={`Option ${oIndex + 1}`} className="flex-grow p-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow" value={option} onChange={(e) => updateOption(originalQIndex, oIndex, e.target.value)} />
                          <button onClick={() => removeOption(originalQIndex, oIndex)} className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-100 transition-colors" title="Remove Option"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => addOption(originalQIndex)} className="mt-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 py-1 px-2 rounded-md hover:bg-indigo-50 transition-colors"><PlusIcon className="h-4 w-4" />Add Option</button>
                    </div>
                  )}
                  {["multipleChoiceGrid", "checkboxGrid"].includes(q.type) && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Rows:</h4>
                          {(q.rows || []).map((row, rIndex) => (
                            <div key={rIndex} className="flex items-center gap-2">
                              <input type="text" className="flex-grow p-2.5 border border-gray-300 rounded-md" placeholder={`Row ${rIndex + 1}`} value={row} onChange={(e) => updateRow(originalQIndex, rIndex, e.target.value)} />
                              <button onClick={() => removeRow(originalQIndex, rIndex)} className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-100"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => addRow(originalQIndex)} className="mt-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 py-1 px-2 rounded-md hover:bg-indigo-50"><PlusIcon className="h-4 w-4" />Add Row</button>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-600 mb-1">Columns:</h4>
                          {(q.columns || []).map((col, cIndex) => (
                            <div key={cIndex} className="flex items-center gap-2">
                              <input type="text" className="flex-grow p-2.5 border border-gray-300 rounded-md" placeholder={`Column ${cIndex + 1}`} value={col} onChange={(e) => updateColumn(originalQIndex, cIndex, e.target.value)} />
                              <button onClick={() => removeColumn(originalQIndex, cIndex)} className="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-red-100"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => addColumn(originalQIndex)} className="mt-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 py-1 px-2 rounded-md hover:bg-indigo-50"><PlusIcon className="h-4 w-4" />Add Column</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {activeSectionId && (
              <button onClick={() => addQuestion(activeSectionId)} className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mt-6 shadow-sm hover:shadow-md">
                <PlusIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-indigo-600 font-semibold text-lg">Add Question to '{sections.find(s=>s.id === activeSectionId)?.title || "Current Section"}'</span>
              </button>
            )}
            {!activeSectionId && sections.length > 0 && <p className="text-center text-gray-500">Please select a section to add questions.</p>}
            {sections.length === 0 && <p className="text-center text-gray-500">Please add a section first to start adding questions.</p>}
          </div>
        );
      case 4: // Appearance
  return (
    <div className="space-y-6 p-4">
      <h3 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
        <PaintBrushIcon className="h-6 w-6" /> Customize Appearance
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Frame Color Section */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Survey Frame Color</h4>
          
          <div className="mb-4">
            <input 
              type="color" 
              value={frameColor} 
              onChange={(e) => setFrameColor(e.target.value)} 
              className="w-full h-12 rounded-md cursor-pointer border border-gray-300 mb-2"
            />
            <p className="text-xs text-gray-500">Current: <span className="font-mono">{frameColor}</span></p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              {['#ffffff', '#f3f4f6', '#fef2f2', '#ecfdf5', '#eff6ff', '#f5f3ff'].map((color) => (
                <button
                  key={color}
                  onClick={() => setFrameColor(color)}
                  className="h-8 w-8 rounded-full border-2 border-transparent hover:border-gray-300 transition-all"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Answer Color Section */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Highlight & Answer Color</h4>
          
          <div className="mb-4">
            <input 
              type="color" 
              value={answerColor} 
              onChange={(e) => setAnswerColor(e.target.value)} 
              className="w-full h-12 rounded-md cursor-pointer border border-gray-300 mb-2"
            />
            <p className="text-xs text-gray-500">Current: <span className="font-mono">{answerColor}</span></p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Theme Colors:</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: 'Indigo', value: '#4f46e5' },
                { name: 'Blue', value: '#3b82f6' },
                { name: 'Emerald', value: '#10b981' },
                { name: 'Rose', value: '#f43f5e' },
                { name: 'Amber', value: '#f59e0b' },
                { name: 'Purple', value: '#8b5cf6' },
                { name: 'Cyan', value: '#06b6d4' },
                { name: 'Pink', value: '#ec4899' },
                { name: 'Lime', value: '#84cc16' },
                { name: 'Stone', value: '#78716c' }
              ].map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAnswerColor(color.value)}
                  className="h-8 w-full rounded-md border-2 border-transparent hover:border-gray-300 transition-all flex flex-col items-center justify-center group"
                  style={{ backgroundColor: color.value }}
                  title={`${color.name} (${color.value})`}
                >
                  <span className="text-xs text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Live Preview</h4>
        <div 
          className="p-6 rounded-lg border" 
          style={{ backgroundColor: frameColor }}
        >
          <h3 className="text-xl font-semibold mb-2" style={{ color: answerColor }}>
            Survey Title Preview
          </h3>
          <p className="text-gray-700 mb-4">This is how your survey will look to respondents.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: answerColor }}>
                Sample Question
              </label>
              <input 
                type="text" 
                className="w-full p-2 border rounded focus:ring-2 focus:outline-none" 
                style={{ 
                  borderColor: answerColor,
                  focusRingColor: answerColor
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: answerColor }}>
                Sample Options
              </label>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <input 
                      type="radio" 
                      name="sample-option" 
                      className="h-4 w-4 mr-2"
                      style={{ color: answerColor }}
                    />
                    <span>Option {i}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="px-4 py-2 rounded-md text-white font-medium mt-4"
              style={{ backgroundColor: answerColor }}
            >
              Sample Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
     case 5: // Share & Preview
  return (
    <div className="space-y-6 p-4 text-center">
      <h3 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center justify-center gap-2">
        <PaperAirplaneIcon className="h-6 w-6" /> Share & Preview
      </h3>

      {surveyDBId ? (
        <>
          <p className="text-gray-700">Your survey is ready to be previewed and shared.</p>

          <div className="mt-6 space-y-6 max-w-2xl mx-auto">
            <QRCodeCanvas
              id="qrcode"
              value={`${window.location.origin}/view/${surveyDBId}`}
              size={180}
              bgColor={frameColor}
              fgColor={answerColor}
              level="H"
              className="p-4 rounded-lg border"
              style={{ borderColor: answerColor }}
            />

            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/view/${surveyDBId}`}
                className="w-full max-w-sm px-3 py-2 border rounded text-sm text-center"
                style={{ borderColor: answerColor }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/view/${surveyDBId}`);
                  alert("Link copied!");
                }}
                className="px-3 py-2 rounded text-sm bg-gray-100 hover:bg-gray-200 transition-colors"
                title="Copy link"
              >
                Copy
              </button>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => {
                  const canvas = document.getElementById("qrcode");
                  const pngUrl = canvas.toDataURL("image/png");
                  const link = document.createElement("a");
                  link.download = "survey-qrcode.png";
                  link.href = pngUrl;
                  link.click();
                }}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Download QR Code
              </button>

              <Link
                to={`/view/${surveyDBId}`}
                target="_blank"
                className="px-6 py-2 border rounded text-indigo-600 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Open Survey Page
              </Link>
            </div>
          </div>
        </>
      ) : (
        <p className="text-lg text-orange-600">Please save your survey to generate preview and sharing options.</p>
      )}
    </div>
  );

      default:
        return <div className="text-center text-red-500 p-4">Error: Unknown step. Please go back.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 shadow-lg py-8 mb-10">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Survey Builder</h1>
          <Link to="/" className="text-sm text-indigo-100 hover:text-white transition-colors py-2 px-3 rounded-md hover:bg-white/10"> Back to Dashboard</Link>
        </div>
      </header>

      <div className="container mx-auto px-6">
        {/* Step Indicators */}
        <div className="mb-10 p-4 bg-white rounded-lg shadow-md">
          <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 sm:text-base">
            {stepNames.map((stepName, index) => (
              <li key={stepName} 
                  className={`flex md:w-full items-center transition-colors duration-300 
                              ${currentStep > index + 1 ? 'text-indigo-600 font-semibold' : ''} 
                              ${currentStep === index + 1 ? 'text-indigo-700 font-bold' : ''}
                              ${index !== stepNames.length - 1 ? 'sm:after:content-[""] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700' : ''}`}>
                <button onClick={() => setCurrentStep(index + 1)} disabled={isSaving} className={`flex items-center p-2 rounded-md hover:bg-indigo-50 ${currentStep === index + 1 ? 'cursor-default' : 'cursor-pointer'}`}>
                  {currentStep > index + 1 ? 
                    <CheckIcon className="w-5 h-5 mr-2 sm:w-6 sm:h-6 text-indigo-500" /> : 
                    <span className={`mr-2 p-1.5 rounded-full w-7 h-7 flex items-center justify-center text-xs border-2 ${currentStep === index + 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-500 text-gray-600'}`}>{index + 1}</span>}
                  {stepName}
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white p-6 md:p-8 shadow-xl rounded-xl min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation and Save Buttons */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button onClick={prevStep} disabled={currentStep === 1 || isSaving} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
            <ChevronLeftIcon className="h-5 w-5"/> Previous Step
          </button>
          
          <button onClick={onSaveSurvey} disabled={isSaving} className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
            {isSaving ? <ArrowPathIcon className="h-5 w-5 animate-spin"/> : <ArrowPathIcon className="h-5 w-5" />}
            {isSaving ? "Saving..." : "Save Survey Progress"}
          </button>

          {currentStep < totalSteps ? (
            <button onClick={nextStep} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center">
              Next Step <ChevronRightIcon className="h-5 w-5"/>
            </button>
          ) : (
            <Link to={surveyDBId ? `/preview/${surveyDBId}` : "#"} target={surveyDBId ? "_blank" : "_self"} 
                  className={`px-8 py-3 text-white rounded-md flex items-center gap-2 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto justify-center ${surveyDBId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  onClick={(e) => !surveyDBId && e.preventDefault()} 
                  aria-disabled={!surveyDBId || isSaving}
                  disabled={isSaving} >
              <EyeIcon className="h-5 w-5" /> Finish & Preview
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilder;

