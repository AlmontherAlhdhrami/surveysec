import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import { chartToImage } from "../utils/chartToImage";

const ChartComponent = ({ data, question }) => {
  const chartRef = useRef(null); // Reference for the chart instance

  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Responses",
        data: values,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Handle downloading the chart as an image
  const handleDownloadImage = () => {
    const image = chartToImage(chartRef);
    if (image) {
      const link = document.createElement("a");
      link.href = image;
      link.download = `${question || "chart"}.png`;
      link.click();
    }
  };

  return (
    <div
      className="mt-8 p-4 bg-white rounded shadow-lg mx-auto"
      style={{ maxWidth: "600px", marginTop: "80px" }} // Spacing from navbar
    >
      <h3 className="text-lg font-bold text-center mb-4">{question}</h3>
      <div style={{ height: "250px", width: "100%" }}> {/* Smaller chart size */}
        <Bar ref={chartRef} data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
      <button
        onClick={handleDownloadImage}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 block mx-auto"
      >
        Download Chart Image
      </button>
    </div>
  );
};

export default ChartComponent;
