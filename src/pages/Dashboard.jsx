// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow p-8 rounded">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Survey Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome! Click below to build a new survey or edit existing ones.</p>
        <Link
          to="/builder"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Create / Edit Survey
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
