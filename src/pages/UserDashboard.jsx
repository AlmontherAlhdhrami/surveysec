import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📝 User Dashboard</h2>
      <div className="flex flex-col md:flex-row justify-center mt-6 space-y-4 md:space-y-0 md:space-x-4">
        {/* زر رؤية استباناتي */}
        <button
          onClick={() => navigate("/my-surveys")}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
        >
          👀 View My Surveys
        </button>

        {/* زر إنشاء استبانة جديدة */}
        <button
          onClick={() => navigate("/create-survey")}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
        >
          ➕ Create New Survey
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;
