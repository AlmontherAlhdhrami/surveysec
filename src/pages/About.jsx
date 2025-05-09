import React from 'react';
import { FaUniversity, FaUsers, FaGraduationCap, FaChartPie, FaPalette, FaCode } from 'react-icons/fa';

const About = () => {
  const teamMembers = [
    { name: "Student 1", role: "Full Stack Developer" },
    { name: "Student 2", role: "UI/UX Designer" },
    { name: "Student 3", role: "Data Analyst" },
    { name: "Student 4", role: "Project Manager" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 py-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <FaUniversity className="text-4xl text-plum-600 mr-3 transition-colors duration-300" />
            <h1 className="text-4xl font-bold text-plum-700 transition-colors duration-300">
              Sultan Qaboos University
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Computer Science Graduation Project
          </h2>
          <p className="text-xl text-plum-600 max-w-2xl mx-auto transition-colors duration-300">
            Advanced Survey Analytics Platform - A comprehensive solution for data collection 
            and analysis, developed as part of our final year project requirements.
          </p>
        </div>

        {/* University Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img 
              src="https://www.squ.edu.om/Portals/0/SQU%20Logo.png" 
              alt="SQU Logo"
              className="w-48 h-48 object-contain p-4 bg-plum-100 rounded-xl"
            />
            <div>
              <h3 className="text-2xl font-bold text-plum-700 mb-4 transition-colors duration-300">About Sultan Qaboos University</h3>
              <p className="text-plum-600 mb-4">
                As Oman's premier institution of higher learning, SQU maintains the highest standards 
                in academic excellence. This project represents our commitment to innovative solutions 
                that address real-world challenges through technology.
              </p>
              <div className="flex items-center text-gold-500">
                <FaGraduationCap className="mr-2 text-xl" />
                <span className="font-medium">B.Sc. in Computer Science</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-plum-700 mb-12 transition-colors duration-300">
            Development Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                <div className="w-32 h-32 bg-gold-50 rounded-full mx-auto mb-4 overflow-hidden transition-colors duration-300">
                  <div className="w-full h-full flex items-center justify-center group-hover:bg-gold-100">
                    <FaUsers className="text-4xl text-plum-600 transition-colors duration-300" />
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-center text-gray-800">{member.name}</h4>
                <p className="text-center text-plum-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-plum-700 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <FaChartPie className="text-4xl mb-4 text-gold-400" />
            <h4 className="text-xl font-bold mb-3">Project Objectives</h4>
            <ul className="list-disc list-inside space-y-2">
              {['Advanced Visualization', 'Real-time Analytics', 'Secure Data Flow', 'Intuitive UX'].map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-gold-400 mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-xl font-bold text-plum-700 mb-4">Key Features</h4>
            <div className="space-y-4">
              {['Interactive Dashboards', 'Multi-language Support', 'AI Insights', 'Cross-platform'].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 bg-gold-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gold-600">✓</span>
                  </div>
                  <span className="text-plum-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-xl font-bold text-plum-700 mb-4">Technology Stack</h4>
            <div className="grid grid-cols-2 gap-4">
              {['React', 'Node.js', 'MongoDB', 'Python', 'TensorFlow', 'Docker'].map((tech, index) => (
                <span key={index} className="bg-gold-100 text-plum-700 px-3 py-1.5 rounded-full text-sm text-center transition-colors duration-300 hover:bg-gold-200">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Academic Statement */}
        <div className="bg-gold-50 p-8 rounded-xl text-center transition-colors duration-300 hover:bg-gold-100">
          <p className="text-lg italic text-plum-700 mb-4">
            "This project represents the culmination of four years of study in Computer Science,
            incorporating modern software engineering practices and cutting-edge technologies
            learned during our academic journey at SQU."
          </p>
          <p className="font-medium text-plum-700">
            - Project Development Team
          </p>
        </div>
      </div>
    </div>
  );
};


export default About;