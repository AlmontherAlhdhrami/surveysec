import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  section: { marginBottom: 15 },
});

const DownloadReport = ({ questions, answers, aiReport }) => {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Survey Report</Text>
        {questions.map((q) => (
          <View key={q.id} style={styles.section}>
            <Text>{q.question_text}</Text>
            <Text>Answer Summary: {answers.filter(a => a.question_id === q.id).length} responses</Text>
          </View>
        ))}
        <Text style={styles.title}>AI Analysis</Text>
        <Text>{aiReport}</Text>
      </Page>
    </Document>
  );
};

export default DownloadReport;
