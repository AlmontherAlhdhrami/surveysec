// context/SurveyContext.jsx
import React, { createContext, useContext, useState } from 'react';

const SurveyContext = createContext(null);

export const SurveyProvider = ({ children }) => {
  // Example state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#ffffff');
  const [questions, setQuestions] = useState([]);

  const value = {
    title,
    setTitle,
    description,
    setDescription,
    themeColor,
    setThemeColor,
    questions,
    setQuestions,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => {
  return useContext(SurveyContext);
};
