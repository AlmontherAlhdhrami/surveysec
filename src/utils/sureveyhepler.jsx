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
    frameColor,
    answerColor
  } = useSurveyContext();

  // Function to add a new question
  // Function to add a new question
const addQuestion = () => {
  setQuestions([
    ...questions,
    { 
      text: "", 
      type: "shortAnswer", 
      options: [], 
      required: false,
      rows: [], // 🛠 Ensure rows exist
      columns: [] // 🛠 Ensure columns exist
    },
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
    
    // Original options reset logic
    updated[index].options = ["multipleChoice", "checkboxes", "dropdown"].includes(value)
      ? [""]
      : [];
  
    // New grid type handling
    if (["multipleChoiceGrid", "checkboxGrid"].includes(value)) {
      updated[index].rows = [];  // Initialize empty rows array
      updated[index].columns = [];  // Initialize empty columns array
    } else {
      updated[index].rows = undefined;  // Clear rows for non-grid types
      updated[index].columns = undefined;  // Clear columns for non-grid types
    }
  
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

  // Function to update grid rows
  const addRow = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].rows.push("");
    setQuestions(updated);
  };
  
  const updateRow = (qIndex, rIndex, value) => {
    const updated = [...questions];
    updated[qIndex].rows[rIndex] = value;
    setQuestions(updated);
  };
  
  const removeRow = (qIndex, rIndex) => {
    const updated = [...questions];
    updated[qIndex].rows.splice(rIndex, 1);
    setQuestions(updated);
  };
  
  const addColumn = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].columns.push("");
    setQuestions(updated);
  };
  
  const updateColumn = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].columns[cIndex] = value;
    setQuestions(updated);
  };
  
  const removeColumn = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].columns.splice(cIndex, 1);
    setQuestions(updated);
  };
  
  const handleSaveSurvey = async () => {
    try {
      let finalSurveyId = surveyDBId;
  
      // 1. Handle Survey Creation/Update
      if (!finalSurveyId) {
        const { data: newSurvey, error: surveyError } = await supabase
          .from("surveys")
          .insert({ 
            title, 
            description,
            frame_color: frameColor, // Add if you have color settings
            answer_color: answerColor
          })
          .select()
          .single();
  
        if (surveyError) throw surveyError;
        finalSurveyId = newSurvey.id;
        setSurveyDBId(newSurvey.id);
      } else {
        const { error: updateError } = await supabase
          .from("surveys")
          .update({ 
            title, 
            description,
            frame_color: frameColor,
            answer_color: answerColor
          })
          .eq("id", finalSurveyId);
  
        if (updateError) throw updateError;
      }
  
      // 2. Handle Questions with Proper ID Management
      const updatedQuestions = await Promise.all(
        questions.map(async (q) => {
          const questionData = {
            survey_id: finalSurveyId,
            question_text: q.text,
            question_type: q.type,
            is_required: q.required,
            options: JSON.stringify(q.options || []),
            rows: JSON.stringify(q.rows || []),
            columns: JSON.stringify(q.columns || [])
          };
  
          // Update existing question
          if (q.id) {
            const { error } = await supabase
              .from("questions")
              .update(questionData)
              .eq("id", q.id);
  
            if (error) throw error;
            return q;
          }
  
          // Create new question and get ID
          const { data: newQuestion, error } = await supabase
            .from("questions")
            .insert(questionData)
            .select()
            .single();
  
          if (error) throw error;
          return { ...q, id: newQuestion.id }; // Critical: Store new ID
        })
      );
  
      // 3. Update Local State with New IDs
      setQuestions(updatedQuestions);
  
      alert("Survey saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert(`Error saving survey: ${err.message}`);
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
    addRow,
    updateRow,
    removeRow,
    addColumn,
    updateColumn,
    removeColumn

  };
};
