import React from "react";

const ChartSelector = ({ setSelectedChart }) => {
  return (
    <div className="my-4 text-center">
      <label className="mr-2 font-bold">Select Chart Type:</label>
      <select
        onChange={(e) => setSelectedChart(e.target.value)}
        className="p-2 rounded shadow bg-white"
      >
        <option value="Bar">Bar Chart</option>
        <option value="Pie">Pie Chart</option>
        <option value="Line">Line Chart</option>
        <option value="Histogram">Histogram</option>
        <option value="Scatter">Scatter Plot</option>
        <option value="Box">Box Plot</option>
        <option value="Heatmap">Heatmap</option>
      </select>
    </div>
  );
};

export default ChartSelector;
