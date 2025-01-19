import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Supabase } from "../assets/createClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { error } = await Supabase.from("admin").insert([{ email, password }]);
      if (!error) {
        setSuccess(true);
        setTimeout(() => navigate("/"), 2000);
      } else {
        console.error("Registration error:", error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      {success && <p className="success">Registration successful! Redirecting to login...</p>}
    </div>
  );
};

export default Register;
