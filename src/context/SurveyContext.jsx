// context/SurveyContext.jsx
import React, { createContext, useContext, useState } from "react";

const SurveyContext = createContext(null);

export const SurveyProvider = ({ children }) => {
  // 1) تعريف الحقلين:
  const [surveyDBId, setSurveyDBId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  // Example color states
  const [frameColor, setFrameColor] = useState("#ffffff");   // Outer/container
  const [buttonColor, setButtonColor] = useState("#4F46E5"); // Buttons
  const [answerColor, setAnswerColor] = useState("#4F46E5"); // Radio/checkbox accent color

  // 2) إضافة setSurveyDBId إلى كائن value
  const value = {
    surveyDBId,
    setSurveyDBId,   // <-- لابد من تصدير الدالة
    title, setTitle,
    description, setDescription,
    questions, setQuestions,
    frameColor, setFrameColor,
    buttonColor, setButtonColor,
    answerColor, setAnswerColor
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => useContext(SurveyContext);
