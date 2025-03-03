import { useSurveyContext } from "../context/SurveyContext";
import { supabase } from "../assets/createClient";

// Custom hook to access context safely
export const useSurveyHelper = () => {
  const {
    surveyDBId,
    setSurveyDBId,
    title,
    setTitle,
    description,
    setDescription,
    questions,
    setQuestions,
  } = useSurveyContext();

  // Function to add a new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", type: "shortAnswer", options: [], required: false },
    ]);
  };

  // Function to update question text
  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  // Function to update question type
  const updateQuestionType = (index, value) => {
    const updated = [...questions];
    updated[index].type = value;
    updated[index].options = ["multipleChoice", "checkboxes", "dropdown"].includes(value)
      ? [""]
      : [];
    setQuestions(updated);
  };

  // Function to toggle the required field of a question
  const toggleRequired = (index) => {
    const updated = [...questions];
    updated[index].required = !updated[index].required;
    setQuestions(updated);
  };

  // Function to update an option of a question
  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  // Function to add an option to a question
  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  // Function to remove an option from a question
  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  // Function to remove a question
  const removeQuestion = (qIndex) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(updated);
  };

  // Function to handle survey saving (create or update)
  const handleSaveSurvey = async () => {
    try {
      let finalSurveyId = surveyDBId;

      if (!finalSurveyId) {
        // Insert new survey
        const { data: newSurvey, error: surveyError } = await supabase
          .from("surveys")
          .insert({ title, description })
          .select()
          .single();

        if (surveyError) throw surveyError;
        finalSurveyId = newSurvey.id;
        setSurveyDBId(newSurvey.id);
      } else {
        // Update existing survey
        const { error: updateError } = await supabase
          .from("surveys")
          .update({ title, description })
          .eq("id", finalSurveyId);

        if (updateError) throw updateError;
      }

      // Insert or update questions
      for (const q of questions) {
        if (q.id) {
          await supabase
            .from("questions")
            .update({
              question_text: q.text,
              question_type: q.type,
              is_required: q.required,
              options: q.options,
            })
            .eq("id", q.id);
        } else {
          await supabase.from("questions").insert({
            survey_id: finalSurveyId,
            question_text: q.text,
            question_type: q.type,
            is_required: q.required,
            options: q.options,
          });
        }
      }

      alert("Survey saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving survey");
    }
  };

  return {
    addQuestion,
    updateQuestionText,
    updateQuestionType,
    toggleRequired,
    updateOption,
    addOption,
    removeOption,
    removeQuestion,
    handleSaveSurvey,
  };
};
