import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import bgImage from "../src/assets/hero.jpg";

function AdminRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", adminkey: "", secret: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, } = e.target;
    setFormData({ ...formData, [name]: value });
    let newErrors = { ...errors };
    if (name === "username" && value.trim()) delete newErrors.username;
    if (name === "adminkey" && value.trim()) delete newErrors.adminkey;
    if (name === "secret" && value.trim()) delete newErrors.secret;
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.adminkey.trim()) newErrors.adminkey = "Admin key is required.";
    if (!formData.secret.trim()) newErrors.secret = "secret key is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setMessage("Please fix the errors above.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        "https://free-electrical-learning-backend.onrender.com/api/auth/v1/user/admin-register",
        formData
      );

      setMessage(response.data.message || "Registration successful!");
      setMessageType("success");
      setFormData({ username: "", adminkey: "" });
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate("/admin-login");
      }, 2000);
    } catch (error) {
      console.error(error);
      if (error.response) {
        setMessage(error.response.data.message || "Registration failed.");
      } else {
        setMessage("Network error. Please try again.");
      }
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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          Admin Register
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
              <p className="text-red-400 text-sm mt-1">{errors.secret}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              name="secret"
              placeholder="Enter Admin secret"
              value={formData.secret}
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
            {loading ? "Registering..." : "Register Account"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-300">
          Already have an account?{" "}
          <Link
            to="/admin-login"
            className="text-violet-400 hover:text-violet-300 font-medium underline"
          >
            Login here
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
      {showSuccessModal && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-13 rounded-xl shadow-lg w-96 border border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-green-600">
              Registration Successful
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRegister;
