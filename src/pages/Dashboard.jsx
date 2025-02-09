import { useEffect, useState } from "react";
import { supabase } from "../assets/createClient";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/login"); // Redirect to login if not authenticated
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📂 User Dashboard</h2>
      {user && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
