import { useState } from "react";

const CreateSurvey = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([...questions, { text: "" }]);
  };

  return (
    <div className="p-10 max-w-4xl mx-auto mt-20 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 Create Your Survey</h2>
      <input
        type="text"
        placeholder="Survey Title"
        className="w-full p-3 mt-4 border rounded-lg focus:ring focus:ring-indigo-200"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {questions.map((q, index) => (
        <input
          key={index}
          type="text"
          placeholder={`Question ${index + 1}`}
          className="w-full p-3 mt-2 border rounded-lg focus:ring focus:ring-indigo-200"
          onChange={(e) => {
            let newQuestions = [...questions];
            newQuestions[index].text = e.target.value;
            setQuestions(newQuestions);
          }}
        />
      ))}
      <div className="flex justify-between mt-6">
        <button onClick={addQuestion} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition transform hover:scale-105">
          ➕ Add Question
        </button>
        <button className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition transform hover:scale-105">
          ✅ Submit Survey
        </button>
      </div>
    </div>
  );
};

export default CreateSurvey;
