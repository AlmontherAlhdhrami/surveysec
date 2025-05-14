import { useSurveyContext } from "../context/surveycontexts"; // Adjusted path
import { supabase } from "../assets/createClient"; // Adjusted path
import { encrypt } from "../service/cryptoHelper"; // Adjusted path

export const useSurveyHelper = () => {
  const {
    surveyDBId,
    setSurveyDBId,
    title,
    description,
    questions, // Expect questions to have section_id if applicable
    setQuestions,
    frameColor,
    answerColor,
    sections, // Assuming sections are managed in context for UI purposes
    setSections // Assuming sections are managed in context for UI purposes
  } = useSurveyContext();

  const addQuestion = (sectionId) => { // Pass sectionId to associate question
    setQuestions([
      ...questions,
      {
        text: "",
        type: "shortAnswer",
        options: [],
        required: false,
        rows: [],
        columns: [],
        section_id: sectionId // Store section_id with the question
      },
    ]);
  };

  const updateQuestionText = (index, value) => {
    const updated = [...questions];
    updated[index].text = value;
    setQuestions(updated);
  };

  const updateQuestionType = (index, value) => {
    const updated = [...questions];
    updated[index].type = value;
    updated[index].options = ["multipleChoice", "checkboxes", "dropdown"].includes(value)
      ? [""]
      : [];
    if (["multipleChoiceGrid", "checkboxGrid"].includes(value)) {
      updated[index].rows = [];
      updated[index].columns = [];
    } else {
      updated[index].rows = undefined;
      updated[index].columns = undefined;
    }
    setQuestions(updated);
  };

  const toggleRequired = (index) => {
    const updated = [...questions];
    updated[index].required = !updated[index].required;
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const removeQuestion = (qIndex) => {
    const updated = questions.filter((_, idx) => idx !== qIndex);
    setQuestions(updated);
  };

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

  // Function to handle saving/updating sections
  const handleSaveSections = async (surveyId, sectionsToSave) => {
  const savedSections = [];
  
  // First, delete any sections that were removed in the UI
  const { data: existingSections } = await supabase
    .from('sections')
    .select('id')
    .eq('survey_id', surveyId);
    
  const existingSectionIds = existingSections?.map(s => s.id) || [];
  const currentSectionIds = sectionsToSave
    .filter(s => !s.id?.startsWith('temp-'))
    .map(s => s.id);
    
  const sectionsToDelete = existingSectionIds.filter(id => !currentSectionIds.includes(id));
  
  if (sectionsToDelete.length > 0) {
    await supabase
      .from('sections')
      .delete()
      .in('id', sectionsToDelete);
  }

  // Then process each section
  for (const section of sectionsToSave) {
    const sectionData = {
      survey_id: surveyId,
      title: (section.title),
      description: (section.description || ''),
      order: section.order
    };
    
    try {
      if (section.id && !section.id.startsWith('temp-')) { 
        // Update existing section
        const { data, error } = await supabase
          .from('sections')
          .update(sectionData)
          .eq('id', section.id)
          .select()
          .single();
        if (error) throw error;
        savedSections.push(data);
      } else { 
        // Create new section
        const { data, error } = await supabase
          .from('sections')
          .insert(sectionData)
          .select()
          .single();
        if (error) throw error;
        savedSections.push(data);
      }
    } catch (error) {
      console.error('Error saving section:', error);
      throw error;
    }
  }
  
  return savedSections;
};
  const handleSaveSurvey = async () => {
  try {
    let finalSurveyId = surveyDBId;

    // 1. Handle Survey Creation/Update
    if (!finalSurveyId) {
      const { data: newSurvey, error: surveyError } = await supabase
        .from('surveys')
        .insert({ 
          title: encrypt(title),
          description: (description || ''),
          frame_color: frameColor,
          answer_color: answerColor
        })
        .select()
        .single();

      if (surveyError) throw surveyError;
      finalSurveyId = newSurvey.id;
      setSurveyDBId(newSurvey.id);
    } else {
      const { error: updateError } = await supabase
        .from('surveys')
        .update({ 
          title: (title),
          description: (description || ''),
          frame_color: frameColor,
          answer_color: answerColor
        })
        .eq('id', finalSurveyId);

      if (updateError) throw updateError;
    }

    // 2. Handle Sections Save/Update
    const savedSections = await handleSaveSections(finalSurveyId, sections);
    
    // Create a mapping from temporary IDs to database IDs
    const sectionIdMap = {};
    sections.forEach(section => {
      const savedSection = savedSections.find(s => 
        (section.id && !section.id.startsWith('temp-') && s.id === section.id) || 
        (section.title === s.title && section.order === s.order)
      );
      if (savedSection) {
        sectionIdMap[section.id] = savedSection.id;
      }
    });

    // 3. Handle Questions
    const questionsToSave = questions.map(q => ({
      ...q,
      section_id: sectionIdMap[q.section_id] || q.section_id
    }));

    // Delete questions that were removed
    const { data: existingQuestions } = await supabase
      .from('questions')
      .select('id')
      .eq('survey_id', finalSurveyId);
      
    const existingQuestionIds = existingQuestions?.map(q => q.id) || [];
    const currentQuestionIds = questionsToSave
      .filter(q => q.id && !q.id.startsWith('temp-'))
      .map(q => q.id);
      
    const questionsToDelete = existingQuestionIds.filter(id => !currentQuestionIds.includes(id));
    
    if (questionsToDelete.length > 0) {
      await supabase
        .from('questions')
        .delete()
        .in('id', questionsToDelete);
    }

    // Save/update questions
    const updatedQuestions = await Promise.all(
      questionsToSave.map(async (q) => {
        const questionData = {
          survey_id: finalSurveyId,
          question_text: (q.text),
          question_type: q.type,
          is_required: q.required,
          options: q.options ? JSON.stringify(q.options) : null,
          rows: q.rows ? JSON.stringify(q.rows) : null,
          columns: q.columns ? JSON.stringify(q.columns) : null,
          section_id: q.section_id?.startsWith('temp-') ? null : q.section_id
        };

        if (q.id && !q.id.startsWith('temp-')) {
          await supabase
            .from('questions')
            .update(questionData)
            .eq('id', q.id);
          return { ...q };
        } else {
          const { data: newQuestion, error } = await supabase
            .from('questions')
            .insert(questionData)
            .select()
            .single();
          if (error) throw error;
          return { ...q, id: newQuestion.id };
        }
      })
    );

    // 4. Update Local State
    setQuestions(updatedQuestions);
    setSections(savedSections);

    alert('Survey saved successfully!');
    return true;
  } catch (err) {
    console.error('Save error:', err);
    alert(`Error saving survey: ${err.message}`);
    return false;
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
    removeColumn,
    handleSaveSections // Expose if sections are saved independently or for more granular control
  };
};

