import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../assets/createClient";
import {
  ClipboardDocumentIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PresentationChartBarIcon

} from "@heroicons/react/24/outline";
import {encrypt,decrypt} from "../service/cryptoHelper"

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (user) fetchSurveys();
  }, [user]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("user_id", user.id)
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

  const handlePlusClick = () => setShowInput(true);

  const handleSaveNew = async () => {
    if (!newName.trim()) {
      alert("Please enter a survey name.");
      return;
    }

    const { data, error } = await supabase
      .from("surveys")
      .insert({ title:encrypt( newName.trim()), user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating survey:", error);
      alert("Failed to create new survey.");
      return;
    }

    navigate(`/builder/${data.id}`);
    setNewName("");
    setShowInput(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this survey?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("surveys").delete().eq("id", id);
      if (error) throw error;
      setSurveys(surveys.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting survey:", err);
      alert("Failed to delete survey.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-red-600 font-semibold mb-2">Error Loading Surveys</h3>
          <p className="text-red-700">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with optimized spacing */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-sm pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          <div className="flex items-center justify-between space-x-6">
            <div className="flex items-center space-x-4">
              <ClipboardDocumentIcon className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Survey Dashboard</h1>
                <p className="text-indigo-100 text-sm mt-2">
                  {surveys.length} active surveys • Last modified: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handlePlusClick}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-all"
            >
              <PlusIcon className="h-5 w-5 text-white" />
              <span className="text-white font-medium">New Survey</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content with proper spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Create New Card */}
          <div
            onClick={handlePlusClick}
            className="group h-48 bg-white/50 hover:bg-white border-2 border-dashed border-gray-300 hover:border-indigo-300 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center"
          >
            <PresentationChartBarIcon className="h-30 w-30 text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" />
            <p className="text-gray-500 group-hover:text-indigo-600 font-medium transition-colors">
              Create New Survey
            </p>
          </div>

          {/* New Survey Form */}
          {showInput && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-sm p-8 border border-gray-200">
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Start New Survey</h3>
                <input
                  type="text"
                  className="w-full px-5 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter survey title..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleSaveNew}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Create Survey
                  </button>
                  <button
                    onClick={() => setShowInput(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Survey Cards */}
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="h-48 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all border border-purple-700 flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <PresentationChartBarIcon className="h-12 w-12 text-indigo-600" />
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                    {survey.status || "Draft"}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white truncate mb-2">
                  {survey.title}
                </h3>
                <p className="text-sm text-white mb-auto">
                  Created: {new Date(survey.created_at).toLocaleDateString()}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex space-x-4">
                    <Link
                      to={`/builder/${survey.id}`}
                      className="text-white hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/view/${survey.id}`}
                      className="text-white hover:text-indigo-600 transition-colors"
                      title="Preview"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                  <button
                    onClick={() => handleDelete(survey.id)}
                    className="text-white hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
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