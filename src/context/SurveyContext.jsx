import { createContext, useContext, useState } from "react";

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [surveyDBId, setSurveyDBId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);  // Ensure this is properly set
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [buttonColor, setButtonColor] = useState("#4F46E5");
  const [answerColor, setAnswerColor] = useState("#F59E0B");


  return (
    <SurveyContext.Provider
      value={{
        surveyDBId,
        setSurveyDBId,
        title,
        setTitle,
        description,
        setDescription,
        questions,
        setQuestions,  // Ensure questions are correctly updated
        frameColor,
        setFrameColor,
        buttonColor,
        setButtonColor,
        answerColor,
        setAnswerColor,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveyContext = () => useContext(SurveyContext);
