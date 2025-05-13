import React, { createContext, useState, useContext } from 'react';

const SurveyContext = createContext();

export const useSurveyContext = () => useContext(SurveyContext);

export const SurveyProvider = ({ children }) => {
  const [surveyDBId, setSurveyDBId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([{ id: `temp-${Date.now()}`, title: "Default Section", description: "", order: 1 }]); // Initialize with a default section for new surveys
  const [frameColor, setFrameColor] = useState('#ffffff'); // Default frame color
  const [answerColor, setAnswerColor] = useState('#4f46e5'); // Default answer/highlight color

  const value = {
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
  };

  return <SurveyContext.Provider value={value}>{children}</SurveyContext.Provider>;
};
