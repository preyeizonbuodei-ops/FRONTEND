import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../src/assets/hero.jpg"; // adjust path if needed

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    adminkey: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };
    if (name === "username" && value.trim()) delete newErrors.username;
    if (name === "adminkey" && value.trim()) delete newErrors.adminkey;
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.adminkey.trim()) newErrors.adminkey = "Admin key is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("https://free-electrical-learning-backend.onrender.com/api/auth/v1/user/admin-login", {
        username: formData.username,
        adminkey: formData.adminkey,
      });

      // ✅ Save the token exactly as returned by backend
      if (res.data && res.data.token) {
        localStorage.setItem("adminToken", res.data.token);
        setMessage("Login successful!");
        setMessageType("success");

        // Navigate to dashboard
        navigate("/admin-dashboard");
      } else {
        throw new Error("No token returned from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.message || "Login failed. Please check your credentials.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          Admin Login
        </h3>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              name="username"
              placeholder="Enter Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="adminkey"
              placeholder="Enter Admin Key"
              value={formData.adminkey}
              onChange={handleChange}
              className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-violet-400 transition"
            />
            {errors.adminkey && (
              <p className="text-red-400 text-sm mt-1">{errors.adminkey}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-semibold text-lg transition disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center mt-6 text-gray-300">
          Don't have an account?{" "}
          <Link 
            to="/admin-register" 
            className="text-violet-400 hover:text-violet-300 font-medium underline"
          >
            Register here
          </Link>
        </p>

        {message && (
          <p
            className={`mt-6 text-center font-medium ${
              messageType === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
