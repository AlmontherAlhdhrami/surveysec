import React from "react";
import { FiCode, FiServer, FiShield, FiActivity } from "react-icons/fi";

const teamMembers = [
  { name: "Student 1", role: "Frontend Developer", id: "137771", icon: <FiCode /> },
  { name: "Student 2", role: "Backend Developer", id: "135215", icon: <FiServer /> },
  { name: "Student 3", role: "Security Specialist", id: "131704", icon: <FiShield /> },
  { name: "Student 4", role: "AI & Analytics Lead", id: "129791", icon: <FiActivity /> },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center py-16 px-4 text-white">
      {/* Header Section */}
      <div className="max-w-4xl text-center mb-16 animate-fade-in-down">
        <div className="inline-block bg-white/10 rounded-full px-6 py-2 mb-6 text-sm font-semibold backdrop-blur-sm">
          🚀 Innovating Survey Technology
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-300 bg-clip-text text-transparent">
          Behind the Code
        </h1>
        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          We're a passionate team of final year students dedicated to building secure, 
          intelligent survey solutions that transform data into insights.
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full px-4">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="relative group bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-2xl"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white">
                {member.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
              <p className="text-cyan-300 font-semibold mb-2">{member.role}</p>
              <p className="text-sm text-white/70">ID: {member.id}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mission Statement */}
      <div className="max-w-4xl text-center mt-16 px-4 animate-fade-in-up">
        <div className="border-t border-white/20 pt-12">
          <p className="text-xl text-white/90 italic font-light">
            "Our mission is to redefine survey experiences through cutting-edge security, 
            AI-driven analytics, and user-centric design - making data collection both 
            trustworthy and insightful."
          </p>
        </div>
      </div>
    </div>
  );
}