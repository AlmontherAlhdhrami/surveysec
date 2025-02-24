import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styling for the PDF report
const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#f5f5f5" },
  section: { marginBottom: 20, padding: 10, backgroundColor: "#ffffff", borderRadius: 8 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center", color: "#333333" },
  question: { fontSize: 16, marginBottom: 10, fontWeight: "bold", color: "#555555" },
  answer: { fontSize: 12, marginBottom: 5, color: "#333333" },
  analysis: { fontSize: 14, marginTop: 10, fontStyle: "italic", color: "#666666" }
});

// Function to count responses per answer
const countAnswers = (questionId, answers) => {
  const answerCount = {};

  answers
    .filter((answer) => answer.question_id === questionId)
    .forEach((response) => {
      const value = response.answer_value || "No Answer";
      answerCount[value] = (answerCount[value] || 0) + 1;
    });

  return answerCount;
};

// Main PDF Generator Component
const ReportGenerator = ({ questions, answers }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Survey Report</Text>

        {/* Loop through each question and display responses */}
        {questions.map((q) => {
          const answerStats = countAnswers(q.id, answers);
          return (
            <View key={q.id} style={styles.section}>
              <Text style={styles.question}>{q.question_text}</Text>

              {Object.entries(answerStats).map(([answer, count]) => (
                <Text key={answer} style={styles.answer}>
                  - {answer}: {count} response{count > 1 ? "s" : ""}
                </Text>
              ))}

              {/* Placeholder for AI Analysis - Later integrated with Gemini */}
              <Text style={styles.analysis}>
                AI Insight: This question received {Object.values(answerStats).reduce((a, b) => a + b, 0)} total responses.
              </Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export default ReportGenerator;
