import React, { useState } from "react";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "chartjs-chart-box-and-violin-plot"; // Box and Violin plots
import "chartjs-chart-matrix"; // Heatmap

const StatisticalCharts = ({ data = {}, question }) => {
  const [selectedChart, setSelectedChart] = useState("Bar");

  const chartTypes = ["Bar", "Line", "Pie", "Doughnut", "Box", "Heatmap"];

  // ✅ Safeguard against null or undefined data
  const labels = data ? Object.keys(data) : [];
  const values = data ? Object.values(data) : [];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Responses",
        data: values,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 2,
      },
    ],
  };

  // ✅ Define specialized data for Heatmap and Box Plot
  const heatmapData = {
    labels: labels,
    datasets: [
      {
        label: "Heatmap",
        data: labels.map((_, i) => ({ x: i, y: i, v: values[i] })),
        backgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex].v;
          return `rgba(255, ${255 - value * 10}, ${255 - value * 10}, 0.8)`;
        },
        width: ({ chart }) => chart.chartArea.width / labels.length - 1,
        height: ({ chart }) => chart.chartArea.height / labels.length - 1,
      },
    ],
  };

  const boxPlotData = {
    labels: labels,
    datasets: [
      {
        label: "Box Plot",
        data: values.map((v) => [v - 1, v, v + 1]), // Mock data for demonstration
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "red",
        borderWidth: 1,
      },
    ],
  };

  // ✅ Render Charts Based on Selection
  const renderChart = () => {
    switch (selectedChart) {
      case "Bar":
        return <Bar data={chartData} options={{ maintainAspectRatio: false }} />;
      case "Line":
        return <Line data={chartData} options={{ maintainAspectRatio: false }} />;
      case "Pie":
        return <Pie data={chartData} options={{ maintainAspectRatio: false }} />;
      case "Doughnut":
        return <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />;
      case "Box":
        return <Chart type="boxplot" data={boxPlotData} options={{ maintainAspectRatio: false }} />;
      case "Heatmap":
        return <Chart type="matrix" data={heatmapData} options={{ maintainAspectRatio: false }} />;
      default:
        return <Bar data={chartData} options={{ maintainAspectRatio: false }} />;
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-medium mb-2">{question || "Survey Question"}</h3>

      {/* Chart Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Select Chart Type:</label>
        <select
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
          className="border rounded p-1"
        >
          {chartTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Render Chart */}
      <div className="h-64">
        {labels.length > 0 && values.length > 0 ? (
          renderChart()
        ) : (
          <p className="text-center text-gray-500">No data available for this chart.</p>
        )}
      </div>
    </div>
  );
};

export default StatisticalCharts;
