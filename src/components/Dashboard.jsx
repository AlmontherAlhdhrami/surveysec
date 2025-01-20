import React, { useState, useEffect } from "react";
import { Supabase } from "../assets/createClient";
import '../index.css';

const Dashboard = () => {
  const [admin, setAdmin] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data } = await Supabase.from("admin").select("*");
      setAdmin(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="table-container">
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p>Loading...</p>
      ) : admin.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {admin.map((item) => (
              <tr key={item.id}>
                <td>{item.email}</td>
                <td>{item.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default Dashboard;
