import { useEffect, useState } from "react";
import { supabase } from "../assets/createClient"; // ✅ Correct

const MySurveys = () => {
  const [surveys, setSurveys] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      const user = supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("surveys")
        .select("*")
        .eq("created_by", user.id);

      if (!error) setSurveys(data);
    };

    fetchSurveys();
  }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-600 text-center">📋 My Surveys</h2>
      <div className="mt-6">
        {surveys.length > 0 ? (
          surveys.map((survey) => (
            <div key={survey.id} className="p-4 border rounded-lg mt-3 bg-gray-100">
              <h4 className="text-lg font-semibold">{survey.title}</h4>
              <p className="text-gray-600">Responses: {survey.responses_count || 0}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">You have not created any surveys yet.</p>
        )}
      </div>
    </div>
  );
};

export default MySurveys;
