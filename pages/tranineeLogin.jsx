import React, { useState } from "react";
import axios from "axios";
import bgImage from "../src/assets/hero.jpg"; 

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    level: "",
    department: "Electrical Electronics Engineering", // default value
    matricnumber: "",
    phonenumber: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let newErrors = { ...errors };
    if (name === "username" && value.trim()) delete newErrors.username;
    if (name === "email" && /\S+@\S+\.\S+/.test(value)) delete newErrors.email;
    if (name === "department" && value.trim()) delete newErrors.department;
    if (name === "phonenumber" && /^\+234\d{10}$/.test(value))
      delete newErrors.phonenumber;
    if (name === "level" && value) delete newErrors.level;
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required.";
    if (!formData.department.trim())
      newErrors.department = "Department is required.";
// Define the regex for Nigerian numbers
    const nigerianPhoneRegex = /^(?:070|080|081|090|091)\d{8}$/;

    if (!nigerianPhoneRegex.test(formData.phonenumber)) {
      newErrors.phonenumber =
        "Phone number must be 11 digits and start with 070, 080, 081, 090, or 091.";
    }

    if (!formData.matricnumber.trim())
      newErrors.matricnumber = "Matric number is required.";
    if (!formData.level) newErrors.level = "Please select your level.";

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
    try {
      const response = await axios.post(
        "https://free-electrical-learning-backend.onrender.com/api/auth/v1/user/register",
        formData
      );

      // Assuming backend returns verificationCode in response.data.verificationCode
      setVerificationCode(response.data.verificationCode);
      setShowSuccessModal(true);
      localStorage.setItem("adminUsername", response.data.user.username);


      // Reset form
      setFormData({
        username: "",
        email: "",
        level: "",
        department: "Electrical Electronics Engineering",
        matricnumber: "",
        phonenumber: "",
      });
    } catch (error) {
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur"></div>

      <div className="relative bg-white/30 backdrop-blur-md rounded-lg shadow-lg p-8 max-w-lg w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Free Electrical Training Registration
        </h3>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {errors.username && <p className="text-red-600 text-sm">{errors.username}</p>}

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}    

          {/* Department select */}
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Electrical Electronics Engineering">
              Electrical Electronics Engineering
            </option>
            <option value="Mechatronics Engineering">Mechatronics Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Petroleum and Gas Engineering">
              Petroleum and Gas Engineering
            </option>
            <option value="Chemical Engineering">Chemical Engineering</option>
          </select>
          {errors.department && <p className="text-red-600 text-sm">{errors.department}</p>}

          <input
            type="tel"
            name="phonenumber"
            placeholder="080XXXXXXXXXX"
            value={formData.phonenumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {errors.phonenumber && <p className="text-red-600 text-sm">{errors.phonenumber}</p>}

          <input
            type="text"
            name="matricnumber"
            placeholder="mat numb: FUO/**/***/*****"
            value={formData.matricnumber}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          />
          {errors.matricnumber && <p className="text-red-600 text-sm">{errors.matricnumber}</p>}

          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Level</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
          </select>
          {errors.level && <p className="text-red-600 text-sm">{errors.level}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

         

        {message && (
          <p
            className={`mt-4 text-center ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {showSuccessModal && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-green-500">
            <h2 className="text-xl font-semibold mb-4 text-green-600">Registration Successful</h2>
            <p className="text-gray-700 mb-6">
              The trainee has been registered successfully.
            </p>
            <p className="text-gray-900 font-mono mb-6">
              Verification Code: <span className="text-indigo-600">{verificationCode}</span>
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          </div>
  </div>
)}

      </div>
    </div>
  );
}

export default RegistrationForm;
