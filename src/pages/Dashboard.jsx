// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../assets/createClient";

const Dashboard = () => {
  const navigate = useNavigate();

  // Local state for storing all surveys
  const [surveys, setSurveys] = useState([]);
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Whether user clicked the plus card (to show an input)
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");

  // Fetch surveys on mount
  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching surveys:", error);
        setErrorMsg("Could not load surveys.");
        return;
      }

      setSurveys(data || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlusClick = () => {
    setShowInput(true);
  };

  const handleSaveNew = async () => {
    if (!newName.trim()) {
      alert("Please enter a survey name.");
      return;
    }

    const { data, error } = await supabase
      .from("surveys")
      .insert({ title: newName.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error creating survey:", error);
      alert("Failed to create new survey.");
      return;
    }

    // Navigate to builder for newly created survey
    navigate(`/builder/${data.id}`);

    // Clear input
    setNewName("");
    setShowInput(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this survey?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from("surveys")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting survey:", error);
        alert("Failed to delete survey.");
        return;
      }
      // Remove from local state
      const updated = surveys.filter((s) => s.id !== id);
      setSurveys(updated);
    } catch (err) {
      console.error("Unexpected error deleting survey:", err);
      alert("An error occurred while deleting survey.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 animate-pulse">Loading surveys...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <header className="bg-teal-600 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">
            My Surveys{" "}
            <span className="text-sm font-normal ml-2 text-teal-100">استبياناتي</span>
          </h1>
          <p className="text-teal-100 text-sm">Create or manage your surveys effortlessly</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* (A) Plus Card */}
          <div
            onClick={handlePlusClick}
            className="h-64 rounded shadow-sm bg-blue-200 hover:shadow-md transition flex items-center justify-center cursor-pointer"
          >
            <span className="text-4xl text-blue-700 font-bold">+</span>
          </div>

          {/* (B) The "New Survey" Input Card (if user clicked plus) */}
          {showInput && (
            <div className="h-64 col-span-1 sm:col-span-2 rounded shadow-sm bg-white flex flex-col p-4 space-y-3">
              <p className="text-gray-700 font-semibold">Enter Survey Name</p>
              <input
                type="text"
                className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-teal-300"
                placeholder="Survey Title..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleSaveNew}
                  className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowInput(false);
                    setNewName("");
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* (C) Existing Surveys */}
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="relative h-64 rounded shadow-sm bg-purple-300 hover:shadow-md transition"
            >
              {/* Centered text (example) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white text-base font-semibold">
                  استبيان
                </span>
              </div>
              {/* Bottom Bar */}
              <div className="absolute bottom-0 left-0 w-full bg-purple-100 
                              flex items-center justify-between px-4 py-2 
                              text-purple-900 text-sm">
                <span className="truncate font-medium">{survey.title}</span>
                <div className="flex items-center space-x-3">
                  {/* Edit */}
                  <Link
                    to={`/builder/${survey.id}`}
                    className="hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  {/* View */}
                  <Link
                    to={`/view/${survey.id}`}
                    className="hover:underline font-medium"
                  >
                    View
                  </Link>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
