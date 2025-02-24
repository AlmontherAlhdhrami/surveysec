import React from "react";
import ChartComponent from "../pages/ChartComponent";

const SurveyQuestionAnalysis = ({ question, responses }) => {
  const questionResponses = responses
    .flatMap((response) => response.answers)
    .filter((answer) => answer.question_id === question.id);

  const answerCount = {};
  questionResponses.forEach((response) => {
    const value = response.answer_value;
    answerCount[value] = (answerCount[value] || 0) + 1;
  });

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold">{question.question_text}</h2>
      <ChartComponent data={answerCount} question={question} />
    </div>
  );
};

export default SurveyQuestionAnalysis;
