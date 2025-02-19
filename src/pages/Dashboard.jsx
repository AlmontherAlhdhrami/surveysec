import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto mt-20 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-4xl font-extrabold text-indigo-600">Dashboard</h2>
      <p className="text-gray-600 mt-4 text-lg">
        Select an option to proceed
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        
        {/* البطاقة الأولى: Respondents */}
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-2">Respondents</h3>
          <p className="text-gray-500">
            View and manage respondents
          </p>
        </div>

        {/* البطاقة الثانية: Chart and Result */}
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-2">Chart &amp; Result</h3>
          <p className="text-gray-500">
            Analyze survey results with charts
          </p>
        </div>

        {/* البطاقة الثالثة: Create Survey مع زر Get Started */}
        <div className="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
          <h3 className="text-2xl font-semibold mb-4">Create Survey</h3>
          {/* هنا زر Get Started (أو لينك موجه كما ترغب) */}
          <Link
            to="/create-survey"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Dashboard;
