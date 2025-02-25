import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  section: { marginBottom: 20, padding: 10, backgroundColor: "#f5f5f5" },
  question: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  analysisText: { fontSize: 12, marginBottom: 5 },
});

const AdvancedStatisticalReport = ({ report }) => {
  if (!report) {
    return <Text>Generating analysis...</Text>;
  }

  return (
    <View>
      {report.analysisResult.map((analysis, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.question}>{analysis.question}</Text>

          <Text style={styles.analysisText}>
            Chi-Square Value: {analysis.chiSquare.chiSquareValue.toFixed(2)} - Significant:{" "}
            {analysis.chiSquare.significant ? "Yes" : "No"}
          </Text>

          <Text style={styles.analysisText}>
            Linear Regression: Slope: {analysis.regression.m.toFixed(2)} - Intercept:{" "}
            {analysis.regression.b.toFixed(2)}
          </Text>

          <Text style={styles.analysisText}>
            Correlation Coefficient: {analysis.correlation.correlationValue.toFixed(2)} - Strong
            Correlation: {analysis.correlation.strongCorrelation ? "Yes" : "No"}
          </Text>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.question}>AI Report Summary:</Text>
        <Text>{report.aiText}</Text>
      </View>
    </View>
  );
};

export default AdvancedStatisticalReport;
